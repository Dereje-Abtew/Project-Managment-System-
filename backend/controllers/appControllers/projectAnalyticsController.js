/**
 * Project Analytics Controller
 *
 * Provides a single rich analytics endpoint that powers the GeneralReport dashboard.
 * Reads directly from the Project model — no Report document needed.
 * Also aggregates StakeholderRequirement and RequirementTemplate stats.
 *
 * GET /api/project-report/analytics
 * Query params:
 *   startDate  — ISO date string, filter projects whose endDate >= startDate
 *   endDate    — ISO date string, filter projects whose startDate <= endDate
 *   projectId  — single project ObjectId
 *   status     — project status (pending | ongoing | closed)
 *   priority   — project priority
 *   assignedTo — User ObjectId, filter to tasks assigned to this person
 */

const mongoose = require('mongoose');
const Project = require('@/models/appModels/Project');
const StakeholderRequirement = require('@/models/appModels/StakeholderRequirement');
const RequirementTemplate = require('@/models/appModels/RequirementTemplate');

// ─── helpers ──────────────────────────────────────────────────────────────────

const NOW = () => new Date();

/**
 * Classify a single task as:
 *   'completed'   — stage is Completed  OR actual >= weight
 *   'delayed'     — submissionDate is in the past and NOT completed
 *   'inprogress'  — currently active (stage In Progress / Assigned / Done but not yet completed)
 *   'backlog'     — stage Backlog
 */
function classifyTask(task) {
  const stage = (task.stage || '').toLowerCase();
  const actual = Number(task.actual) || 0;
  const weight = Number(task.weight) || 1;

  if (stage === 'completed' || actual >= weight) return 'completed';

  const now = NOW();
  const submissionDate = task.submissionDate ? new Date(task.submissionDate) : null;

  if (submissionDate && submissionDate < now) return 'delayed';
  if (stage === 'in progress' || stage === 'done' || stage === 'assigned') return 'inprogress';
  return 'backlog';
}

/**
 * Determine if a task is on-time: completed before or on its submissionDate.
 */
function isOnTime(task) {
  const stage = (task.stage || '').toLowerCase();
  const actual = Number(task.actual) || 0;
  const weight = Number(task.weight) || 1;

  if (stage !== 'completed' && actual < weight) return false;

  // Completed — check if completed before deadline.
  // We use updated_at as proxy for completion date; if unavailable, treat as on-time.
  const submissionDate = task.submissionDate ? new Date(task.submissionDate) : null;
  const completedAt = task.updated_at ? new Date(task.updated_at) : null;

  if (!submissionDate) return true;
  if (!completedAt) return true;
  return completedAt <= submissionDate;
}

// ─── main handler ─────────────────────────────────────────────────────────────

exports.getAnalytics = async (req, res) => {
  try {
    // ── Build project-level filter ───────────────────────────────────────────
    const filter = { removed: false };

    if (req.query.projectId) {
      try {
        filter._id = mongoose.Types.ObjectId(req.query.projectId);
      } catch (_) { /* invalid id — skip */ }
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.priority) {
      filter.priority = req.query.priority;
    }

    // Date range filter on project dates
    if (req.query.startDate || req.query.endDate) {
      filter.$and = [];
      if (req.query.startDate) {
        filter.$and.push({ endDate: { $gte: new Date(req.query.startDate) } });
      }
      if (req.query.endDate) {
        filter.$and.push({ startDate: { $lte: new Date(req.query.endDate) } });
      }
    }

    // ── Fetch projects ────────────────────────────────────────────────────────
    const projects = await Project.find(filter).lean();

    // Optional per-task filter by assignedTo user
    const assignedToId = req.query.assignedTo
      ? String(req.query.assignedTo)
      : null;

    // ── Per-project task date range filter ────────────────────────────────────
    const taskDateStart = req.query.startDate ? new Date(req.query.startDate) : null;
    const taskDateEnd   = req.query.endDate   ? new Date(req.query.endDate)   : null;

    // ── Aggregate data ────────────────────────────────────────────────────────
    let totalTasks       = 0;
    let totalCompleted   = 0;
    let totalDelayed     = 0;
    let totalInProgress  = 0;
    let totalBacklog     = 0;
    let totalOnTime      = 0;
    let totalBudget      = 0;
    let totalActualBudget = 0;

    // For stage-distribution bar chart  (per project)
    const projectBreakdowns = [];

    // For monthly trend line chart  { 'YYYY-MM': { completed, delayed } }
    const monthlyTrend = {};

    // For detailed table
    const taskDetails = [];

    for (const project of projects) {
      totalBudget       += Number(project.totalBudget)  || 0;
      totalActualBudget += Number(project.actualBudget) || 0;

      let pCompleted  = 0;
      let pDelayed    = 0;
      let pInProgress = 0;
      let pBacklog    = 0;

      const activeTasks = (project.task || []).filter((t) => t.assignedStatus === 'active');

      for (const task of activeTasks) {
        // Optional: filter by assignedTo
        if (assignedToId) {
          const taskAssignedTo = task.assignedTo
            ? String(task.assignedTo._id || task.assignedTo)
            : null;
          if (taskAssignedTo !== assignedToId) continue;
        }

        // Optional: filter task by date range (submissionDate in range)
        if (taskDateStart || taskDateEnd) {
          const sd = task.submissionDate ? new Date(task.submissionDate) : null;
          if (!sd) continue;
          if (taskDateStart && sd < taskDateStart) continue;
          if (taskDateEnd   && sd > taskDateEnd)   continue;
        }

        const classification = classifyTask(task);
        totalTasks++;

        switch (classification) {
          case 'completed':  pCompleted++;  totalCompleted++;  break;
          case 'delayed':    pDelayed++;    totalDelayed++;    break;
          case 'inprogress': pInProgress++; totalInProgress++; break;
          default:           pBacklog++;    totalBacklog++;
        }

        if (classification === 'completed' && isOnTime(task)) {
          totalOnTime++;
        }

        // Monthly trend — use submissionDate as the bucket key
        const bucketDate = task.submissionDate
          ? new Date(task.submissionDate)
          : null;
        if (bucketDate) {
          const monthKey = `${bucketDate.getFullYear()}-${String(bucketDate.getMonth() + 1).padStart(2, '0')}`;
          if (!monthlyTrend[monthKey]) {
            monthlyTrend[monthKey] = { completed: 0, delayed: 0, inprogress: 0 };
          }
          monthlyTrend[monthKey][classification === 'backlog' ? 'inprogress' : classification]++;
        }

        // Task detail row
        const assignedTo = task.assignedTo || {};
        const assignedBy = task.assignedBy || {};
        const assuredBy  = task.assuredBy  || {};

        taskDetails.push({
          projectId:      String(project._id),
          projectTitle:   project.title,
          projectStatus:  project.status,
          taskId:         String(task._id),
          taskTitle:      task.title,
          description:    task.description,
          weight:         task.weight,
          cost:           task.cost,
          actualCost:     task.actualCost,
          actual:         task.actual,
          priority:       task.priority,
          stage:          task.stage,
          classification,
          assignedDate:   task.assignedDate,
          submissionDate: task.submissionDate,
          deliverable:    task.deliverable,
          assignedTo: assignedTo._id
            ? { _id: assignedTo._id, name: `${assignedTo.firstName || ''} ${assignedTo.lastName || ''}`.trim(), jobTitle: assignedTo.jobTitle }
            : null,
          assignedBy: assignedBy._id
            ? { _id: assignedBy._id, name: `${assignedBy.firstName || ''} ${assignedBy.lastName || ''}`.trim() }
            : null,
          assuredBy: assuredBy._id
            ? { _id: assuredBy._id, name: `${assuredBy.firstName || ''} ${assuredBy.lastName || ''}`.trim() }
            : null,
          isOnTime:        classification === 'completed' ? isOnTime(task) : null,
          daysVariance:    (() => {
            const sub = task.submissionDate ? new Date(task.submissionDate) : null;
            if (!sub) return null;
            const ref = task.updated_at ? new Date(task.updated_at) : NOW();
            return Math.round((ref - sub) / (1000 * 60 * 60 * 24)); // positive = late
          })(),
        });
      }

      projectBreakdowns.push({
        projectId:    String(project._id),
        title:        project.title,
        status:       project.status,
        priority:     project.priority,
        startDate:    project.startDate,
        endDate:      project.endDate,
        achievement:  project.achievement,
        totalBudget:  project.totalBudget,
        actualBudget: project.actualBudget,
        taskCounts: {
          total:      pCompleted + pDelayed + pInProgress + pBacklog,
          completed:  pCompleted,
          delayed:    pDelayed,
          inprogress: pInProgress,
          backlog:    pBacklog,
        },
        manager:  project.projectManager,
        leader:   project.teamLeader,
        director: project.director,
      });
    }

    // ── Build sorted monthly trend array ──────────────────────────────────────
    const trendArray = Object.entries(monthlyTrend)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, counts]) => ({ month, ...counts }));

    // ── KPI summary ───────────────────────────────────────────────────────────
    const onTimeRate     = totalCompleted > 0 ? Math.round((totalOnTime    / totalCompleted) * 100) : 0;
    const completionRate = totalTasks     > 0 ? Math.round((totalCompleted / totalTasks)     * 100) : 0;
    const delayRate      = totalTasks     > 0 ? Math.round((totalDelayed   / totalTasks)     * 100) : 0;

    // ── Requirement & Template analytics ─────────────────────────────────────
    // Run all counts in parallel for performance
    const [
      reqTotal,
      reqSubmitted,
      reqApproved,
      reqRejected,
      reqEnhancement,
      reqImplemented,
      templateTotal,
      templateGlobal,
      reqRecent,
    ] = await Promise.all([
      StakeholderRequirement.countDocuments({ removed: false }),
      StakeholderRequirement.countDocuments({ removed: false, status: 'submitted' }),
      StakeholderRequirement.countDocuments({ removed: false, status: 'approved' }),
      StakeholderRequirement.countDocuments({ removed: false, status: 'rejected' }),
      StakeholderRequirement.countDocuments({ removed: false, status: 'enhancement_pending' }),
      StakeholderRequirement.countDocuments({ removed: false, status: 'implemented' }),
      RequirementTemplate.countDocuments({ removed: false }),
      RequirementTemplate.countDocuments({ removed: false, isGlobal: true }),
      // Last 50 requirements — populate stakeholder name for the detail table
      StakeholderRequirement.find({ removed: false })
        .sort({ created: -1 })
        .limit(50)
        .populate('stakeholder', 'name company')
        .lean(),
    ]);

    // Build requirement detail rows for the report table
    const requirementDetails = reqRecent.map((r) => ({
      _id:             String(r._id),
      senderName:      r.senderName || '—',
      senderEmail:     r.senderEmail || '',
      stakeholder: r.stakeholder?.name || r.stakeholder || '—',
      status:          r.status,
      submittedAt:     r.submittedAt,
      approvedAt:      r.approvedAt || null,
      rejectedAt:      r.rejectedAt || null,
      isEnhancement:   r.isEnhancement || false,
      attachmentCount: Array.isArray(r.attachments) ? r.attachments.length : 0,
    }));

    const requirementSummary = {
      total:              reqTotal,
      submitted:          reqSubmitted,
      approved:           reqApproved,
      rejected:           reqRejected,
      enhancementPending: reqEnhancement,
      implemented:        reqImplemented,
      approvalRate:       reqTotal > 0 ? Math.round((reqApproved  / reqTotal) * 100) : 0,
      rejectionRate:      reqTotal > 0 ? Math.round((reqRejected  / reqTotal) * 100) : 0,
      templatesUploaded:  templateTotal,
      globalTemplates:    templateGlobal,
      specificTemplates:  templateTotal - templateGlobal,
    };

    return res.status(200).json({
      success: true,
      summary: {
        totalProjects:    projects.length,
        totalTasks,
        totalCompleted,
        totalDelayed,
        totalInProgress,
        totalBacklog,
        totalOnTime,
        onTimeRate,
        completionRate,
        delayRate,
        totalBudget,
        totalActualBudget,
        budgetVariance: totalActualBudget - totalBudget,
      },
      requirementSummary,
      requirementDetails,
      projectBreakdowns,
      monthlyTrend: trendArray,
      taskDetails,
    });
  } catch (err) {
    console.error('[projectAnalyticsController] error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
