const mongoose = require('mongoose');

const update = async (Model, req, res) => {
  try {
    const stage = req.body.stage;
    const weight = parseInt(req.body.weight);
    const actual = parseInt(req.body.actual);

    // Enforce weight === actual for Completed stage (type-safe comparison)
    if (stage === 'Completed') {
      if (actual !== weight) {
        return res.status(400).json({
          success: false,
          message: 'Weight and actual completed should be same for Completed status',
        });
      }
    }

    const deliverableId = mongoose.Types.ObjectId(req.body.deliverable);
    const taskId = mongoose.Types.ObjectId(req.params.taskId);

    // Get all active tasks for this deliverable (excluding the task being updated)
    const oldResult = await Model.findOne(
      { _id: req.params.id, removed: false },
      {
        task: {
          $filter: {
            input: '$task',
            as: 'task',
            cond: {
              $and: [
                { $eq: ['$$task.assignedStatus', 'active'] },
                { $eq: ['$$task.deliverable', deliverableId] },
              ],
            },
          },
        },
      }
    );

    // Get deliverable details
    const deliverableResult = await Model.aggregate([
      { $match: { _id: mongoose.Types.ObjectId(req.params.id), removed: false } },
      {
        $project: {
          deliverables: {
            $filter: {
              input: '$deliverables',
              as: 'deliverable',
              cond: { $eq: ['$$deliverable._id', deliverableId] },
            },
          },
        },
      },
    ]);

    if (!deliverableResult[0] || !deliverableResult[0].deliverables[0]) {
      return res.status(400).json({
        success: false,
        message: 'Deliverable not found.',
      });
    }

    const taskDeliverable = deliverableResult[0].deliverables[0];
    const submissionDate = new Date(req.body.submissionDate);
    const assignedDate = new Date(req.body.assignedDate);

    if (submissionDate < assignedDate) {
      return res.status(400).json({
        success: false,
        message: `Task submission date should be greater than its start date.`,
      });
    }

    if (actual > weight) {
      return res.status(400).json({
        success: false,
        message: `Task actual achievement cannot be greater than its weight.`,
      });
    }

    if (submissionDate < new Date(taskDeliverable.startDate)) {
      return res.status(400).json({
        success: false,
        message: `Task submission date must be after deliverable start date (${taskDeliverable.startDate}).`,
      });
    }

    if (submissionDate > new Date(taskDeliverable.endDate)) {
      return res.status(400).json({
        success: false,
        message: `Task submission date must be before deliverable end date (${taskDeliverable.endDate}).`,
      });
    }

    // Validate weight against remaining deliverable weight
    if (oldResult && oldResult.task.length > 0) {
      const totalWeight = oldResult.task.reduce((acc, obj) => {
        return taskId.equals(obj._id) ? acc : acc + parseInt(obj.weight);
      }, 0);
      const remainingWeight = parseInt(taskDeliverable.weight) - totalWeight;
      if (weight > remainingWeight) {
        return res.status(400).json({
          success: false,
          message: `Task weight cannot be greater than ${remainingWeight}`,
        });
      }
    } else {
      if (weight > parseInt(taskDeliverable.weight)) {
        return res.status(400).json({
          success: false,
          message: `Task weight cannot be greater than deliverable weight (${taskDeliverable.weight}).`,
        });
      }
    }

    // Perform the update (no duplicate keys)
    const result = await Model.findOneAndUpdate(
      {
        _id: mongoose.Types.ObjectId(req.params.id),
        task: { $elemMatch: { _id: taskId } },
      },
      {
        $set: {
          'task.$.title': req.body.title,
          'task.$.description': req.body.description,
          'task.$.remark': req.body.remark || '',
          'task.$.actual': actual,
          'task.$.deliverable': req.body.deliverable,
          'task.$.assignedTo': req.body.assignedTo,
          'task.$.assuredBy': req.body.assuredBy,
          'task.$.assignedBy': req.body.assignedBy || req.body.assignedTo,
          'task.$.submissionDate': req.body.submissionDate,
          'task.$.assignedDate': req.body.assignedDate,
          'task.$.weight': weight,
          'task.$.cost': req.body.cost,
          'task.$.stage': stage,
          'task.$.priority': req.body.priority || 'medium',
          'task.$.actualCost': req.body.actualCost || 0,
          'task.$.assignedStatus': 'active',
        },
      },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Record not found. Please try again!',
      });
    }

    // ── Post-update: recalculate actualBudget and achievement ──────────
    const project = await Model.findOne({ _id: req.params.id });
    const projectTasks = project.task || [];

    // Recalculate actual budget from all tasks
    const actualBudget = projectTasks.reduce((sum, t) => sum + (t.actualCost || 0), 0);

    // Recalculate achievement:
    // - Waterfall: sum of `actual` values from Completed tasks
    // - Agile: sum of `weight` values from Completed tasks (driven by kanban drag)
    let achievement = project.achievement;
    if (project.methodology === 'waterfall') {
      achievement = projectTasks
        .filter((t) => t.stage === 'Completed')
        .reduce((sum, t) => sum + (t.actual || 0), 0);
    } else {
      // Agile — recalculate from completed tasks' weights for consistency
      achievement = projectTasks
        .filter((t) => t.stage === 'Completed')
        .reduce((sum, t) => sum + (t.weight || 0), 0);
    }

    // Auto-close project when achievement reaches 100
    const newStatus =
      achievement >= 100 && project.status !== 'closed' ? 'closed' : project.status;

    await Model.updateOne(
      { _id: mongoose.Types.ObjectId(req.params.id) },
      { $set: { actualBudget, achievement, status: newStatus } }
    );

    const updatedTask = result.task.find((t) => t._id.toString() === taskId.toString());
    return res.status(200).json({
      success: true,
      result: updatedTask,
      message: 'Task updated successfully!',
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: 'Required fields are not supplied' });
    }
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = update;
