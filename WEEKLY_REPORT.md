# Weekly Progress Report
## Project Management System (PMS) — Global Bank S.C.

---

**To:** Project Manager / Direct Supervisor  
**From:** Development Team  
**Date:** July 26, 2026  
**Subject:** Weekly Development Progress Report — PMS Modules  
**Report Period:** Current Sprint  

---

## 1. Executive Summary

This report covers the development progress of four key modules within the Project Management System (PMS):

1. **General Report** — Cross-project analytics dashboard
2. **Stakeholder Management** — External owner registration and authentication
3. **Send Requirement** — Requirement submission workflow
4. **Approve Requirement** — Requirement review and approval workflow

All four modules have been implemented and are fully functional. The following sections detail the current state, features delivered, and how each module operates end-to-end.

---

## 2. General Report Module

### 2.1 Overview

The General Report module provides a comprehensive analytics dashboard that gives management a real-time view of task performance, budget utilization, and project health across all projects in the system. It is accessible at the `/generalReport` route.

### 2.2 Features Delivered

**KPI Summary Cards**

The dashboard displays the following key performance indicators at a glance:

| KPI | Description |
|-----|-------------|
| Total Projects | Total number of registered projects |
| Total Tasks | Combined task count across all projects |
| Completed Tasks | Tasks marked as completed |
| Delayed Tasks | Tasks past their deadline and not yet completed |
| In Progress Tasks | Tasks currently active |
| On-Time Rate | Percentage of completed tasks finished on or before deadline |
| Completion Rate | Percentage of total tasks completed |
| Delay Rate | Percentage of tasks currently delayed |
| Planned Budget (ETB) | Sum of all project planned budgets |
| Actual Budget (ETB) | Sum of all actual spending to date |
| Budget Variance (ETB) | Actual minus planned — negative means under budget |

**Analytics Charts**

Four visual charts are generated automatically from live project data:

- **Doughnut Chart** — Shows the proportion of tasks by stage (Completed / Delayed / In Progress / Backlog) across all projects
- **Stacked Bar Chart** — Breaks down task counts per project by classification, making it easy to compare project health side by side
- **Line Chart** — Monthly trend of task completion vs. delays vs. in-progress work, bucketed by task submission date
- **Horizontal Bar Chart** — Compares on-time completions, late completions, still-delayed, and in-progress tasks

**Filter Options**

The dashboard supports the following filters to narrow the analysis:

| Filter | Type |
|--------|------|
| Date Range | Date picker — filters projects whose dates overlap the selected range |
| Project | Dropdown — analyze a single project in isolation |
| Status | Dropdown — pending / ongoing / closed |
| Priority | Dropdown — high / medium / low |

**Detailed Task Table**

Below the charts, a full task-level table is available showing every task across all filtered projects with the following columns:

- Project name, Task title, Assigned To
- Priority, Stage, Status classification
- On-Time indicator (✓ / ✗)
- Days Variance (how many days early or late)
- Progress bar (actual vs. planned weight)
- Submission deadline, Cost vs. Actual Cost

**Export Capabilities**

| Format | Method | Contents |
|--------|--------|----------|
| Excel (.xlsx) | Client-side (ExcelJS) | 3 sheets: Summary KPIs, Project Breakdown, Task Details |
| PDF | Browser print | Formatted HTML with company logo, timestamp, all three data sections |

The Excel export filename follows the pattern: `General-Report-YYYYMMDD-HHmm.xlsx`

### 2.3 Status

✅ Fully implemented and operational.

---

## 3. Stakeholder Management Module

### 3.1 Overview

Stakeholders are external companies or individuals who own projects registered in the system. They are managed separately from internal users and have their own registration, credentials, and authentication flow.

### 3.2 Features Delivered

**Registration & Profile Management**

Each stakeholder record stores:

| Field | Description |
|-------|-------------|
| Name | Full name or company name (required) |
| Email | Contact email address |
| Phone | Contact phone number |
| Company | Company or organization name |
| Username | Unique login identifier |
| Password | Encrypted (bcrypt hashed) |
| Address | Physical address |

**CRUD Pages**

| Page | Route | Purpose |
|------|-------|---------|
| Stakeholder List | `/stakeholder` | View and search all registered stakeholders |
| Create | `/stakeholder/create` | Register a new stakeholder |
| View Profile | `/stakeholder/read/:id` | View stakeholder details |
| Edit | `/stakeholder/update/:id` | Update stakeholder information |

**Separate Authentication**

Stakeholders authenticate through a dedicated endpoint distinct from internal user login. On successful login, a JSON Web Token (JWT) is issued valid for 7 days. This keeps their access isolated from internal staff accounts.

**Project Linkage**

When a project is created, its `Owner Name` field links directly to a registered stakeholder. This establishes the formal relationship between the external owner and the project.

### 3.3 Status

✅ Fully implemented and operational.

---

## 4. Send Requirement Module

### 4.1 Overview

The Send Requirement module allows authorized users (internal staff with the appropriate role) to formally submit requirements for review. Each submission must include one or more attached documents. The module is accessible at the `/send-requirement` route.

### 4.2 Access Control

Only users whose assigned role includes the **Create** permission on the **"Send Requirement"** resource can submit. Users without this permission see a read-only warning message instead of the submission form.

### 4.3 Submission Process

**Step 1 — Fill the Form**

When the user opens the page, the following fields are auto-populated from their authenticated session and displayed as read-only:

- Sender Name
- Today's Date
- Email Address
- Phone Number

**Step 2 — Attach Document**

The user uploads one or more files. Only the following file types are accepted:
- PDF (`.pdf`)
- Word Document (`.doc`, `.docx`)

Files are validated before upload. Any invalid file type is rejected with an error message.

**Step 3 — Submit**

Clicking "Submit Requirement" sends the data to the backend. The backend performs the following checks before saving:

- Sender name, email, and phone are present
- At least one attachment is included
- All attachments are valid file types (PDF/DOC/DOCX)
- If linked to a project, verifies the project exists

On success, the requirement is saved with a status of **Submitted** and the activity log records the submission event.

### 4.4 My Submissions Table

After submitting, the user can see all their past submissions in a table below the form:

| Column | Description |
|--------|-------------|
| # | Row number |
| Sender | Sender's full name |
| Status | Color-coded badge (see below) |
| Submitted At | Date and time of submission |
| Approved By | Full name of the approver (if actioned) |
| Action | Dropdown to View Detail or Add Enhancement |

**Status Color Reference**

| Status | Color | Meaning |
|--------|-------|---------|
| Submitted | Orange | Awaiting approver review |
| Approved | Green | Approved successfully |
| Rejected | Red | Rejected — enhancement can be submitted |
| Enhancement Pending | Blue | Enhancement submitted, awaiting re-review |
| Implemented | Purple | Requirement has been implemented in a project |

### 4.5 Enhancement — What Happens After Rejection

If a requirement is rejected, the sender is not required to start over. Instead, they can submit an **Enhancement** — an improved version of the same requirement:

1. The sender selects "Add Enhancement" from the action dropdown
2. A modal opens displaying the original document(s) — read-only, for reference
3. The sender writes an Enhancement Description explaining what was changed or improved
4. Optionally, a new version of the document can be uploaded
5. The enhancement is submitted and the status changes to **Enhancement Pending**

The system tracks every enhancement round with a full history (round number, description, who submitted it, when). This cycle can repeat multiple times, with all history preserved.

### 4.6 Status

✅ Fully implemented and operational.

---

## 5. Approve Requirement Module

### 5.1 Overview

The Approve Requirement module is the management-side interface for reviewing submitted requirements. It is accessible at the `/approve-requirement` route and is intended for users whose role grants the **Update** permission on the **"Approve Requirement"** resource — typically a Manager assigned as Approver.

### 5.2 Access Control

Users without the approve permission can still view the page in read-only mode. The Approve, Reject, and Reverse Approval actions are hidden for read-only users. A warning message is shown to indicate read-only access.

### 5.3 Requirements List

The page loads all submitted requirements in a table:

| Column | Description |
|--------|-------------|
| # | Row number |
| Sender | Sender's full name |
| Status | Color-coded status badge |
| Submitted At | Submission timestamp |
| Approved By | Approver's name (if approved) |
| Rejected By | Rejector's name (if rejected) |
| Action | Dropdown with available actions based on current status |

### 5.4 Available Actions

| Action | Available When | Description |
|--------|----------------|-------------|
| View Detail | Any status | Opens full detail modal |
| Approve | Submitted or Enhancement Pending | Approves the requirement |
| Reject | Submitted or Enhancement Pending | Rejects with mandatory reason |
| Reverse Approval | Approved only | Reverts approval back to rejected |

### 5.5 Approve Process

The approver selects "Approve" from the action dropdown or directly from the detail modal.

**What happens on the backend:**
- Status is set to **Approved**
- Approver's identity and timestamp are recorded
- The activity log is updated with the approval event
- **Auto-task creation:** If the requirement is linked to a project, a task is automatically created inside that project from the requirement's content (non-blocking — a failure here does not prevent the approval)

### 5.6 Reject Process

Clicking "Reject" opens a modal with:
- Date (auto-filled, read-only)
- Approver Name (auto-filled from session, read-only)
- Rejection Reason (free text, **required**, minimum 10 characters)

**What happens on the backend:**
- Status is set to **Rejected**
- Rejector's identity, timestamp, and rejection reason are recorded
- The activity log is updated with the rejection event
- The sender can now see the rejection reason in their "My Submissions" table and submit an enhancement

### 5.7 Reverse Approval

If an approver needs to correct a previously approved decision:

1. The "Reverse Approval" option appears in the dropdown only for **Approved** items
2. Clicking it opens a warning modal — clearly stating the action is recorded for accountability
3. The approver enters a reason (minimum 10 characters, required)
4. On confirmation, the status reverts to **Rejected**, the approval fields are cleared, and the reversal is logged

This feature ensures accountability — no action is hidden or irreversible without a trace.

### 5.8 Detail Modal — Full View

The detail modal provides a complete picture of any requirement:

- Sender information (name, email, phone, submitted date)
- Current status badge
- All attached documents, clearly labeled:
  - **Original Documents** — shown with a blue label
  - **Enhancement Documents** — shown with a green label, numbered by round
- Approval details (if approved): Approver name, date, notes
- Rejection details (if rejected): Rejector name, date, reason
- Enhancement History: All rounds with description and timestamp
- **Activity Log** — a full timeline of every action taken on this requirement:

| Event | Color | Description |
|-------|-------|-------------|
| Submitted | Blue | Initial submission |
| Approved | Green | Approved by approver |
| Rejected | Red | Rejected with reason |
| Enhancement Sent | Orange | Enhancement round submitted |
| Approval Reversed | Purple | Prior approval reversed |

### 5.9 Full Workflow State Diagram

```
                    ┌──────────────┐
                    │  Submitted   │ ◄──────────────────────┐
                    └──────┬───────┘                        │
                           │                                │
              ┌────────────┼──────────────┐                 │
              ▼            │              ▼                 │
        ┌──────────┐       │        ┌──────────┐            │
        │ Approved │       │        │ Rejected │            │
        └──────────┘       │        └────┬─────┘            │
              │            │             │                  │
              │ (reverse)   │             │ (enhancement)    │
              │             │             ▼                  │
              │             │   ┌──────────────────────┐    │
              └─────────────┼──►│ Enhancement Pending  │────┘
                            │   └──────────────────────┘
                            ▼
                    ┌──────────────┐
                    │ Implemented  │
                    └──────────────┘

          All transitions recorded in Activity Log
```

### 5.10 Status

✅ Fully implemented and operational.

---

## 6. Summary of Delivered Work

| Module | Status | Key Deliverables |
|--------|--------|-----------------|
| General Report | ✅ Complete | KPI cards, 4 chart types, task detail table, Excel + PDF export |
| Stakeholder | ✅ Complete | CRUD pages, separate login, project linkage |
| Send Requirement | ✅ Complete | Submission form, file validation, My Submissions table, Enhancement flow |
| Approve Requirement | ✅ Complete | Approve / Reject / Reverse Approval, activity log, full detail modal |

---

## 7. Notes & Observations

- All four modules enforce **role-based access control** — users only see and can perform actions their assigned role permits.
- Every action in the requirement workflow is **fully auditable** — a complete, append-only activity log is maintained for accountability.
- The General Report exports include **company branding** (logo, name, generation timestamp) for formal document distribution.
- File attachments in requirements are validated both on the **client side** (browser) and the **server side** (backend API), ensuring data integrity.
- **Soft delete** is applied across all modules — no records are permanently removed, preserving data for future reference and audit purposes.

---

*Prepared by: Development Team*  
*Report Date: July 26, 2026*  
*Organization: Global Bank S.C. — Project Management System (PMS)*
