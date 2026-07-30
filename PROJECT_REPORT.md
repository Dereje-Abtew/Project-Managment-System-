# PM-MERN — Project Management System
## Comprehensive Technical & Functional Report

---

## Table of Contents

1. [Project Basics](#1-project-basics)
2. [Technology Stack](#2-technology-stack)
3. [System Architecture](#3-system-architecture)
4. [Organizational Hierarchy](#4-organizational-hierarchy)
5. [User Roles & Permissions (RBAC)](#5-user-roles--permissions-rbac)
6. [Send Requirement — Service Provider (Owner) Workflow](#6-send-requirement--service-provider-owner-workflow)
7. [Approve Request — Approver Workflow](#7-approve-request--approver-workflow)
8. [General Report — Analytics Dashboard](#8-general-report--analytics-dashboard)
9. [Project Management Module](#9-project-management-module)
10. [Dashboard](#10-dashboard)
11. [Project Report — Per-Project Analytics](#11-project-report--per-project-analytics)
12. [Project Status Report Module](#12-project-status-report-module)
13. [Service Provider Management](#13-service-provider-management)
14. [User Management](#14-user-management)
15. [API Endpoints Summary](#15-api-endpoints-summary)
16. [Security Model](#16-security-model)
17. [Data Flow Summary](#17-data-flow-summary)

---

## 1. Project Basics

**System Name:** Project Management System (PMS)  
**Package Name:** `globalbank-backend` (Global Bank S.C.)  
**Version:** 1.0.0  
**Architecture:** MERN Stack (MongoDB, Express.js, React, Node.js)  
**Default Port:** 8181 (backend), 3000 (frontend)  
**Node.js Required:** ≥ 16.x

### Purpose

The system is a full-cycle Project Management System designed for a large institution (Global Bank S.C.). It supports:

- Managing projects with deliverables, tasks, risks, budgets, and timelines
- A structured organizational hierarchy (Chief → Department → Division → User)
- Role-based access control (RBAC) for fine-grained permission management
- A complete service provider requirement workflow — from submission through approval, rejection, enhancement, and re-approval
- Comprehensive analytics and reports (PDF/Excel export)
- Project issue tracking with comments, quality assurance tracking, and Kanban boards

### Key Pages / Routes (Frontend)

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | Dashboard | Summary overview |
| `/project` | Project List | All projects |
| `/project/create` | ProjectCreate | Create a new project |
| `/project/read/:id` | ProjectRead | View project detail |
| `/project/:id` | TodoRead | Kanban / task board |
| `/send-requirement` | SendRequirement | Service provider submits requirement |
| `/approve-requirement` | ApproveRequirement | Approver reviews & acts on requirements |
| `/generalReport` | GeneralReport | Analytics dashboard with charts & export |
| `/role` | Role List | Manage roles and permissions |
| `/user` | User List | Manage users |
| `/serviceprovider` | Service Provider List | Manage service providers |

---

## 2. Technology Stack

### Backend

| Technology | Version | Role |
|------------|---------|------|
| Node.js | ≥ 16.x | Runtime |
| Express.js | ^4.18.1 | HTTP framework |
| MongoDB + Mongoose | ^6.3.3 | Database + ODM |
| mongoose-autopopulate | ^0.14.0 | Automatic ref population |
| bcryptjs | ^2.4.3 | Password hashing |
| jsonwebtoken | ^9.0.2 | JWT authentication |
| Joi | ^17.10.1 | Input validation |
| Helmet | ^4.6.0 | Security headers |
| PDFKit | ^0.19.1 | Server-side PDF generation |
| ExcelJS | ^4.4.0 | Excel report generation |
| Resend | ^0.17.2 | Email notifications |
| Winston | ^3.13.0 | Logging |
| dotenv | 4.0.0 | Environment variables |
| cors | ^2.8.5 | CORS policy |
| Pug | ^3.0.2 | Email/HTML templates |

### Frontend

| Technology | Version | Role |
|------------|---------|------|
| React | 17.x | UI framework |
| Redux + redux-thunk | — | State management |
| Ant Design | 4.x | UI component library |
| React Router | v5 | Client-side routing |
| Tailwind CSS | — | Utility styling |
| Chart.js + react-chartjs-2 | — | Analytics charts |
| ExcelJS + file-saver | — | Client-side Excel export |
| react-beautiful-dnd | — | Kanban drag-and-drop |
| axios | — | HTTP client |
| dayjs | — | Date formatting |

---

## 3. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React SPA)                      │
│  Ant Design UI  │  Redux State  │  Axios HTTP Client        │
│  Routes, Forms, Charts, Kanban Board                         │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS (JWT + HMAC Signature)
┌──────────────────────────▼──────────────────────────────────┐
│                  Backend (Express.js)                        │
│  app.js — Middleware Stack                                   │
│   ├── Helmet (security headers)                              │
│   ├── CORS                                                   │
│   ├── Body parsers (JSON, URL-encoded, 5MB limit)            │
│   ├── isValidSignature (HMAC check)                          │
│   ├── isValidToken (JWT + isLoggedIn check)                  │
│   └── Routes                                                 │
│         ├── /api/public/* (no auth)                          │
│         ├── /api/login  (signature only)                     │
│         └── /api/* (signature + JWT)                         │
└──────────────────────────┬──────────────────────────────────┘
                           │ Mongoose ODM
┌──────────────────────────▼──────────────────────────────────┐
│                      MongoDB                                 │
│  Collections: User, ServiceProvider, Project,                │
│  ServiceProviderRequirement, Role, Permission, Resource,     │
│  Category, Chief, Department, Division, Report               │
└─────────────────────────────────────────────────────────────┘
```

### Request Flow

1. Frontend makes an Axios call with a Bearer JWT + HMAC signature header
2. `isValidSignature` middleware verifies the HMAC request signature
3. `isValidToken` middleware decodes the JWT, loads the user from DB, and checks `isLoggedIn ≠ 0`
4. The route handler runs; RBAC permission check happens inside the controller
5. Mongoose query executes with autopopulate resolving all refs
6. JSON response sent back to frontend

---

## 4. Organizational Hierarchy

The system models a formal institutional hierarchy:

```
Chief  (top-level organizational unit, e.g., CEO)
  └── Department  (e.g., IT Department)
        └── Division  (e.g., Software Development Division)
              └── Users  (Professionals / Managers / Directors)
```

**User Positions:**
- **Professional** — belongs to a Division; has a Manager and a Director above them
- **Manager** — manages a Division; has a Director above them
- **Director** — manages a Department; has a Chief above them

**At login**, the system enriches the JWT response with the user's full org context:
- Their Chief, Department, Division
- Their Manager's email/ID (for Professionals)
- Their Director's email/ID (for Professionals and Managers)

This hierarchy is used for task assignment, reporting, and project role assignment.

---

## 5. User Roles & Permissions (RBAC)

### How It Works

The system uses a fully configurable Role-Based Access Control system:

1. **Permission** — a named action (e.g., `create`, `read`, `update`, `delete`)
2. **Resource** — a named system module or page (e.g., `Send Requirement`, `Approve Requirement`, `Project`)
3. **Role** — assigns a set of Permissions to each Resource

```
Role: "Approver (Manager)"
  ├── Resource: "Approve Requirement"
  │     └── Permissions: [read, update]      ← can view and approve/reject
  └── Resource: "Project"
        └── Permissions: [read, create, update]
```

### Role Schema (MongoDB)

```js
Role {
  name: String,                     // unique, e.g. "Approver"
  description: String,
  resources: [
    {
      resource: ObjectId → Resource,
      permissions: [ObjectId → Permission]
    }
  ]
}
```

### Permission Check (Example — Approver)

When an approver hits `PATCH /api/serviceprovider-requirement/approve/:id`:

```
1. Load user from DB → get user.role
2. Load role → get role.resources[]
3. Find Resource where name = "Approve Requirement"
4. Check if that resource entry includes the "update" Permission
5. If yes → proceed; if no → 403 Forbidden
```

### Key Resources in the Requirement Workflow

| Resource Name | Required Permission | Who Has It |
|---------------|--------------------|----|
| `Send Requirement` | `create` | Service Provider / Internal user with "send" role |
| `Approve Requirement` | `update` | Manager with Approver role |
| `Send Requirement` | `read` | Both sender and approver |
| `Approve Requirement` | `read` | Both sender and approver |

---

## 6. Send Requirement — Service Provider (Owner) Workflow

### Overview

A service provider (owner of a project) or an internal user with the appropriate role can submit formal requirements to the organization. Each requirement must include at least one attachment (PDF, DOC, or DOCX file).

### Who Can Submit

- Any **internal system user** whose role includes `create` permission on the `Send Requirement` resource
- The form auto-fills the sender's name, email, and phone from their session/auth data

### Data Model — `ServiceProviderRequirement`

```js
{
  serviceProvider:  ObjectId → ServiceProvider,   // optional
  project:          ObjectId → Project,            // optional, links to a project
  submittedBy:      ObjectId → User,               // the submitting user
  submittedByType:  "service_provider" | "internal_user",
  senderName:       String,   // required
  senderEmail:      String,
  senderPhone:      String,
  title:            String,
  description:      String,
  expectedDeliverables: String,
  attachments: [{
    name:   String,
    url:    String,          // base64 data URL stored directly
    type:   "original" | "enhancement",
    round:  Number           // 0 = original, 1,2,3... = enhancement rounds
  }],
  enhancementHistory: [{
    round, description, submittedAt, submittedBy
  }],
  activityLog: [{
    action:      "submitted" | "approved" | "rejected" |
                 "enhancement_submitted" | "approval_reversed",
    performedBy: ObjectId → User,
    performedAt: Date,
    note:        String
  }],
  status:   "submitted" | "approved" | "rejected" |
            "enhancement_pending" | "implemented",
  isEnhancement:      Boolean,
  parentRequirement:  ObjectId → ServiceProviderRequirement,
  approvalNotes:      String,
  approvedBy:         ObjectId → User,
  approvedAt:         Date,
  rejectedBy:         ObjectId → User,
  rejectedAt:         Date,
  rejectionReason:    String,
  submittedAt:        Date
}
```

### Submission Process (Step by Step)

**Frontend — `/send-requirement`:**

1. User opens the "Send Requirement" page
2. The form auto-populates:
   - **Sender Name** — from authenticated user session (read-only)
   - **Date** — today's date (read-only)
   - **Email** — from session
   - **Phone** — from session
3. User uploads one or more documents (PDF / DOC / DOCX only)
   - Files are read as base64 data URLs in the browser
   - Invalid file types are rejected before upload
4. User clicks **"Submit Requirement"**
5. `POST /api/serviceprovider-requirement/create` is called

**Backend validation:**
- Checks the user has `create` permission on `Send Requirement`
- Validates required fields: `senderName`, `senderEmail`, `senderPhone`
- Validates at least one attachment is present
- Validates all attachment filenames end in `.pdf`, `.doc`, or `.docx`
- If a project ID is provided, verifies the project exists
- Saves the document with `status: "submitted"`
- Appends the first `activityLog` entry: `{ action: "submitted" }`

### My Submissions Table

After submitting, the user can view all their past submissions in a table:

| Column | Description |
|--------|-------------|
| # | Row number |
| Sender | Sender's name |
| Status | Color-coded badge (orange=submitted, green=approved, red=rejected, blue=enhancement pending, purple=implemented) |
| Submitted At | Timestamp |
| Approved By | Approver's full name |
| Action | Dropdown: View Detail / Add Enhancement (if rejected) |

### Status Color Reference

| Status | Color | Meaning |
|--------|-------|---------|
| `submitted` | Orange | Awaiting review |
| `approved` | Green | Approved by approver |
| `rejected` | Red | Rejected; sender can submit enhancement |
| `enhancement_pending` | Blue | Enhancement submitted, awaiting re-review |
| `implemented` | Purple | Implemented in a project |

### Enhancement Flow (After Rejection)

When a requirement is **rejected**, the sender can improve and resubmit:

1. Sender clicks "Add Enhancement" in the My Submissions table
2. A modal shows:
   - The original attachment(s) — read-only
   - Any previous enhancement files — read-only
   - A text area for "Enhancement Description"
   - A file picker to upload a new version of the document
3. Sender clicks "Submit Enhancement"
4. `POST /api/serviceprovider-requirement/enhancement/:id` is called

**Backend logic:**
- Validates requirement is in `rejected` status
- Calculates round number: `enhancementHistory.length + 1`
- New files are tagged `{ type: "enhancement", round: N }` and appended to `attachments[]`
- A new `enhancementHistory` entry is added
- `activityLog` entry: `{ action: "enhancement_submitted" }`
- Status changes to `enhancement_pending`
- Rejection fields are cleared so the approver sees a clean state

This cycle (reject → enhance → re-review) can repeat unlimited times, with full history tracked.

---

## 7. Approve Request — Approver Workflow

### Overview

A user whose role includes `update` permission on the `Approve Requirement` resource becomes an **Approver**. This role is typically assigned by a Manager. The approver sees all submitted requirements and can approve, reject, or reverse approvals.

### Approver Dashboard — `/approve-requirement`

The `ApproveRequirement` page loads all requirements via `GET /api/serviceprovider-requirement/list`.

**Table columns:**

| Column | Description |
|--------|-------------|
| # | Row number |
| Sender | Sender's name |
| Status | Color-coded status badge |
| Submitted At | Timestamp |
| Approved By | Full name of approver |
| Rejected By | Full name of rejector |
| Action | Dropdown: View Detail / Approve / Reject / Reverse Approval |

### Available Actions

| Action | Status Required | API Call | Description |
|--------|----------------|----------|-------------|
| View Detail | Any | `GET /read/:id` | Opens detail modal |
| Approve | `submitted` or `enhancement_pending` | `PATCH /approve/:id` | Approves the requirement |
| Reject | `submitted` or `enhancement_pending` | `PATCH /reject/:id` | Rejects with mandatory reason |
| Reverse Approval | `approved` | `PATCH /reverse/:id` | Reverts approval back to rejected |

### Approve Process

1. Approver selects "Approve" from dropdown (or from detail modal)
2. `PATCH /api/serviceprovider-requirement/approve/:id` is called

**Backend logic:**
- Checks `update` permission on `Approve Requirement`
- Sets `status = "approved"`, records `approvedBy`, `approvedAt`
- Appends `activityLog` entry: `{ action: "approved" }`
- **Auto-creates a project task (non-fatal bonus feature):**
  - If the requirement is linked to a `project`
  - And the approver has `create` permission
  - A new task is created in the project's `task[]` array
  - If no deliverable exists, one is auto-created from the requirement's title/description

### Reject Process

1. Approver selects "Reject" from dropdown
2. A modal opens requiring a **Rejection Reason** (minimum 10 characters)
3. Form shows: Date (auto), Approver Name (auto), Reason (free text, required)
4. `PATCH /api/serviceprovider-requirement/reject/:id` is called with `{ rejectionReason }`

**Backend logic:**
- Validates `rejectionReason` is at least 10 characters
- Sets `status = "rejected"`, records `rejectedBy`, `rejectedAt`, `rejectionReason`
- Appends `activityLog` entry: `{ action: "rejected", note: rejectionReason }`

### Reverse Approval

If an approver made a mistake or needs to undo an approval:

1. Approver selects "Reverse Approval" from dropdown (only available for `approved` items)
2. A warning modal appears explaining the action is recorded for accountability
3. Approver enters a **Reason for Reversal** (minimum 10 characters)
4. `PATCH /api/serviceprovider-requirement/reverse/:id` is called with `{ reverseReason }`

**Backend logic:**
- Only works on `status = "approved"` requirements
- Sets `status = "rejected"`, records `rejectedBy/rejectedAt`, sets `rejectionReason = reverseReason`
- Clears `approvedBy` and `approvedAt`
- Appends `activityLog` entry: `{ action: "approval_reversed", note: reverseReason }`
- Sender can now submit an enhancement

### Detail Modal — Full Audit Trail

The detail modal shows:

- Sender info (name, email, phone, submitted at)
- Current status badge
- All attachments (originals labeled blue, enhancements labeled green)
- Approval details (if approved): Approved By, Approved At, Approval Notes
- Rejection details (if rejected): Rejected By, Rejected At, Rejection Reason
- Enhancement History (if any): rounds with descriptions and timestamps
- **Activity Log** — complete audit timeline with color-coded events:
  - 🔵 Submitted
  - 🟢 Approved
  - 🔴 Rejected
  - 🟠 Enhancement Sent
  - 🟣 Approval Reversed

### Complete Workflow State Machine

```
                    ┌─────────────────┐
                    │   submitted     │◄──────────────────────┐
                    └────────┬────────┘                       │
                             │                                │
              ┌──────────────┼──────────────┐                │
              ▼              │              ▼                 │
        ┌──────────┐         │        ┌──────────┐           │
        │ approved │         │        │ rejected │           │
        └──────────┘         │        └────┬─────┘           │
              │              │             │                  │
              │ (reverse      │             │ (enhancement)    │
              │  approval)    │             ▼                  │
              │              │   ┌─────────────────────┐      │
              └──────────────┼──►│ enhancement_pending │──────┘
                             │   └─────────────────────┘
                             │              │
                             │        (approve/reject)
                             ▼
                     ┌─────────────┐
                     │ implemented │
                     └─────────────┘
```

---

## 8. General Report — Analytics Dashboard

### Overview

The General Report (`/generalReport`) is a comprehensive analytics dashboard that reads directly from project data and generates KPI cards, charts, and filterable detail tables. It can export to both **Excel** and **PDF**.

### Filters Available

| Filter | Type | Description |
|--------|------|-------------|
| Date Range | DatePicker | Filter by project start/end date overlap |
| Project | Dropdown | Select a specific project |
| Status | Dropdown | pending / ongoing / closed |
| Priority | Dropdown | high / medium / low |
| Classification | Dropdown | completed / delayed / inprogress / backlog |
| Project Search | Text | Filter task table by project title |

### KPI Summary Cards

| KPI | Color | Description |
|-----|-------|-------------|
| Total Projects | Green | Total non-removed projects |
| Total Tasks | Blue | All active tasks across projects |
| Completed Tasks | Green | Tasks with stage=Completed OR actual ≥ weight |
| Delayed Tasks | Red | Tasks past due date and not completed |
| In Progress | Yellow | Tasks currently in progress |
| On-Time Rate | Teal | % of completed tasks finished on or before deadline |
| Completion Rate | — | % of tasks that are completed |
| Delay Rate | — | % of tasks that are delayed |
| Planned Budget | Purple | Sum of all project totalBudget values |
| Actual Budget | — | Sum of all project actualBudget values |
| Budget Variance | — | Actual − Planned (negative = under budget) |

### Charts

1. **Doughnut Chart — Task Stage Distribution**
   - Shows proportion of Completed / Delayed / In Progress / Backlog across all tasks

2. **Stacked Bar Chart — Tasks Per Project**
   - Shows task count breakdown (by classification) per project

3. **Line Chart — Monthly Task Trend**
   - X-axis: Month (YYYY-MM), bucketed by task submission date
   - Y-axis: Count of Completed / Delayed / In Progress tasks per month

4. **Horizontal Bar Chart — On-Time vs Delayed**
   - Shows: Completed On-Time / Completed Late / Still Delayed / In Progress

### Task Detail Table

The full-detail table shows every task across all projects (filterable):

| Column | Description |
|--------|-------------|
| Project | Project title |
| Task | Task title (hover for description) |
| Assigned To | Team member assigned |
| Priority | High / Medium / Low badge |
| Stage | Current stage string |
| Status | Classification: Completed / Delayed / In Progress / Backlog |
| On Time | ✓ or ✗ (only for completed tasks) |
| Days Variance | How many days early (negative) or late (positive) |
| Progress | Progress bar based on actual/weight ratio |
| Submission Date | Task deadline |
| Cost / Actual Cost | Planned vs actual cost (red if over budget) |

### Task Classification Logic (Backend)

```
classifyTask(task):
  if stage === "completed" OR actual >= weight  → "completed"
  elif submissionDate < NOW and not completed   → "delayed"
  elif stage ∈ ["in progress", "done", "assigned"] → "inprogress"
  else → "backlog"
```

### Export Features

**Excel Export (client-side via ExcelJS):**
- Sheet 1: Summary — KPI table with formatting
- Sheet 2: Project Breakdown — all projects with task counts and budget
- Sheet 3: Task Details — all filtered tasks with full columns
- Delayed rows highlighted in red, green striping for readability
- Branded header: "General Project Report — Global Bank S.C. — PMS"
- Filename: `General-Report-YYYYMMDD-HHmm.xlsx`

**PDF Export (browser print):**
- Opens a new window with a formatted HTML page
- Includes company logo, generation timestamp
- Three sections: Summary, Project Breakdown, Task Details
- Delayed rows highlighted in red
- Browser's native print dialog used (Save as PDF)

---

## 9. Project Management Module

### Project Schema (Key Fields)

```js
Project {
  title, description, projectNumber,   // required, title + number unique
  category:      ObjectId → Category,
  ownerName:     ObjectId → ServiceProvider,  // the project owner
  ownerContact:  String,
  methodology:   String (default: "agile"),
  totalBudget, actualBudget, achievement,
  director:      ObjectId → User,      // required
  projectManager:ObjectId → User,      // required
  teamLeader:    ObjectId → User,       // required
  teamMember:    [ObjectId → User],
  qualityAssurance: [ObjectId → User],
  startDate, endDate,
  deliverables: [{name, description, startDate, endDate, weight, cost}],
  task: [{
    title, description, weight, cost, actualCost, actual,
    assignedTo, assignedBy, assuredBy,
    stage, priority (low|medium|high),
    submissionDate, assignedDate,
    dependOnTask, deliverable,
    comments: [{message, postedBy, createdAt}]
  }],
  issue: [{
    title, description, task ref, risk ref,
    registeredBy, assignedTo,
    startDate, endDate, status,
    comments: [{message, postedBy, createdAt}]
  }],
  risk: [{name, description, possibility, impact, emv}],
  comments: [{message, postedBy, createdAt}],
  status: "pending" | "ongoing" | "closed",
  priority: "normal" | "high" | ...
}
```

### Project Features

- **Task Kanban Board** — drag-and-drop task management (react-beautiful-dnd)
- **Deliverables** — weighted deliverables; sum of weights must equal 100
- **Risk Matrix** — risk register with probability, impact, EMV (Expected Monetary Value)
- **Issue Tracker** — issues linked to tasks, can be assigned to team members
- **Comments** — threaded comments at project level and task level
- **Member Management** — add/remove team members and quality assurance reviewers
- **Achievement Tracking** — `achievement` field tracks % completion (0–100)
- **Task Auto-creation** — when a requirement is approved and linked to a project, a task is automatically created

---

## 10. Dashboard

The Dashboard (`/`) is the first screen every user sees after login. It is powered by the `Home.js` Kanban component and provides a bird's-eye view of the entire system.

### Active Project Carousel

At the top, a scrollable carousel shows all **active projects** (fetched from `GET /api/projects/active`). Each card shows the project title, dates, and progress. Clicking navigates to the project's Kanban board.

### Project Status Summary Cards

Four summary cards display project counts by status:

| Card | Color | Icon | Content |
|------|-------|------|---------|
| Ongoing Projects | Blue | Pause circle | Count of ongoing projects |
| Pending Projects | Yellow | Play circle | Count of pending projects |
| Closed Projects | Green | Check circle | Count of closed projects |
| All Projects | Gray | Info circle | Total project count |

Each card has a **"More Info"** button. Clicking it opens a right-side Drawer listing all projects in that status category. Clicking any project in the drawer opens a `ProjectDrawer` with project detail.

### "Projects You Enrolled In" Table

A personal table filters the full project list to only show projects where the current logged-in user is assigned as:
- Team Leader
- Project Manager
- Director
- Team Member
- Quality Assurance Reviewer

The table is clickable — clicking a row navigates to the project's task board at `/project/:id`.

### System Summary Panel

A side-by-side summary panel shows quick counts (from `GET /api/project/summary`):

| Metric | Color | Description |
|--------|-------|-------------|
| Enabled Users | Green (UserAddOutlined) | Active user count |
| Disabled Users | Red (UserDeleteOutlined) | Deactivated user count |
| Project Categories | Gray | Total category count |
| Available Roles | Gray | Total configured role count |

---

## 11. Project Report — Per-Project Analytics

### Overview

Each project has a dedicated report page at `/project/report/:id`. It is accessible only to the project's **Team Leader**, **Project Manager**, or **Director** — attempting access as any other user redirects to `/unauthorized`.

### Report Page Features

**Date Filters:**
- Start Date picker and End Date picker to narrow task date ranges
- "Search Tasks" button triggers report generation

**Report Generation Logic:**
For each deliverable in the project, the report computes:

| Field | Calculation |
|-------|------------|
| Deliverable Actual | Sum of `task.actual` for all tasks under this deliverable |
| Deliverable Actual Budget | Sum of `task.actualCost` for all tasks |
| Performance | `(deliverableActual / deliverable.weight) × 100` % |
| Planned (per task) | Time-based calculation: `(elapsed days / total days) × task.weight` — shows how much weight should be done by now |
| Task Performance | `(task.actual / task.weight) × 100` % |

**Summary Table Columns:**

| Column | Description |
|--------|-------------|
| Deliverable | Deliverable name |
| Cost | Planned cost (budgeted) |
| Actual Cost | Actual cost spent |
| Weight | Deliverable weight (out of 100) |
| Actual | Actual work completed |
| Performance | % completion of deliverable |
| Start Date | Deliverable start date |
| End Date | Deliverable end date |

Each deliverable row is **expandable** to reveal all its tasks with columns:
Task name, Assigned To, Weight, Planned, Actual, Performance, Start Date, Submission Date.

### Excel Export — Two Modes

**1. Deliverables Only** (`ProjectTitle - Deliverables Only at <timestamp>.xlsx`)
- One row per deliverable
- Columns: Deliverable, Cost, Actual Cost, Weight, Actual, Performance, Start Date, End Date
- Auto-column width, centered alignment, thin borders

**2. Deliverables with Tasks** (`ProjectTitle - Deliverables with Tasks at <timestamp>.xlsx`)
- Tasks nested under their deliverable
- Deliverable cells merged vertically across all task rows
- Columns: Deliverable, Deliverable Cost/Actual/Weight/Performance + Task/Assigned To/Weight/Planned/Actual/Performance/Start/Submission Date
- 14 columns total with auto-width

---

## 12. Project Status Report Module

A separate, dedicated reporting module for structured project status reports (separate from the analytics dashboard).

### Report Model

```js
Report {
  project:     ObjectId → Project,      // linked project
  projectName: String,   // required
  description: String,   // required
  startDate:   Date,     // required
  endDate:     Date,     // required
  status: {
    scope:    "On Track" | "At Risk" | "Delayed",
    budget:   "Under Budget" | "On Budget" | "Over Budget",
    schedule: "Ahead of Schedule" | "On Schedule" | "Behind Schedule"
  },
  reports: [{
    title:     String,   // required
    content:   String,   // required
    createdAt: Date,
    updatedAt: Date
  }]
}
```

### Features

**Frontend Pages (`/report`):**
- `/report` — List all status reports
- `/report/create` — Create a new project status report
- `/generalReport` — View the analytics dashboard (see Section 8)
- `/generalReport/create` — Create a general report entry
- `/generalReport/read/:id` — View a general report
- `/generalReport/update/:id` — Edit a general report

**Backend — Paginated Dashboard (`GET /api/reports`)**

Supports:
- Pagination (`?page=N&limit=N`)
- Text search by project name (`?search=keyword`)
- Filter by scope status (`?status=At Risk`)

Returns: `{ count, total, page, pages, data[] }`

**Server-side PDF Export (`GET /api/reports/export/pdf`)**

Generates a PDFKit-rendered A4 document:
- Title: "Project Reports"
- Table: Project Name | Status | Budget | Schedule
- Auto page-break after 750pt
- Row separator lines
- Streamed directly as `attachment; filename=reports.pdf`

**Server-side Excel Export (`GET /api/reports/export/excel`)**

Generates an ExcelJS workbook:
- Sheet: "Project Reports"
- Bold header row
- Columns: Project Name, Status Scope, Budget, Schedule, Start Date, End Date
- Streamed as `.xlsx` attachment

---

## 13. Service Provider Management

### What Is a Service Provider?

A **Service Provider** is an external company or individual who owns a project or provides services. They are registered separately from internal users and have their own login credentials and a dedicated login endpoint.

### Service Provider Data Model

```js
ServiceProvider {
  name:     String,   // required — full name or company name
  email:    String,   // contact email
  phone:    String,   // contact phone
  company:  String,   // company name
  username: String,   // unique, sparse — used for login
  password: String,   // bcrypt hashed
  address:  String,
  created, updated: Date
}
```

### Service Provider CRUD Pages

| Route | Component | Purpose |
|-------|-----------|---------|
| `/serviceprovider` | index.jsx | List all service providers |
| `/serviceprovider/create` | ServiceProviderCreate.jsx | Register a new provider |
| `/serviceprovider/read/:id` | ServiceProviderRead.jsx | View provider profile |
| `/serviceprovider/update/:id` | ServiceProviderUpdate.jsx | Edit provider details |

### Service Provider Login

Service providers authenticate separately via:
```
POST /api/serviceprovider-requirement/login
Body: { username, password }  OR  { email, password }
```
- Returns a JWT signed with `type: "serviceProvider"`
- Token valid for 7 days

### Relationship to Projects

When creating a project, the `ownerName` field references a `ServiceProvider` document (autopopulated). This links the project to its external owner. Service providers can then submit requirements against the projects they own using the Send Requirement workflow.

---

## 14. User Management

### User Positions

The system defines four user positions that determine hierarchy and permissions at login:

| Position | Org Scope | Gets at Login |
|----------|-----------|---------------|
| Professional | Division-level | Manager info, Director info, Division, Department, Chief |
| Manager | Division-level manager | Director info, Division, Department, Chief |
| Director | Department-level | Department, Chief |
| (Admin/Other) | System-level | Role only |

### User CRUD Pages

| Route | Component | Purpose |
|-------|-----------|---------|
| `/user` | index.jsx | List all users |
| `/user/create` | UserCreate.jsx | Create a user |
| `/user/read/:id` | UserRead.jsx | View user profile |
| `/user/update/:id` | UserUpdate.jsx | Edit user |

### User Status Management

- Users can be **enabled** or **disabled** via `PATCH /api/user/status/:id`
- Disabled users cannot log in (`user.enabled` check in auth middleware)
- `isLoggedIn` flag is set to `1` on login and can be reset server-side to force logout

### Password Management

- `PATCH /api/user/change-password/:id` — allows password reset
- Passwords are bcrypt-hashed on create/update; never stored in plain text

### Org Structure Entities

These support the User hierarchy and are all CRUD-managed:

| Entity | Route | Description |
|--------|-------|-------------|
| Chief | `/chief` | Top-level org unit (e.g., CEO office) |
| Department | `/department` | Department under a Chief |
| Division | `/division` | Division under a Department |
| Category | `/category` | Project categories (used when creating projects) |

---

## 15. API Endpoints Summary

### Authentication
```
POST /api/login                                    — User login (returns JWT)
POST /api/serviceprovider-requirement/login        — Service provider login
```

### Service Provider Requirements (Core Workflow)
```
POST   /api/serviceprovider-requirement/create          — Submit requirement
GET    /api/serviceprovider-requirement/list            — List all (approver)
GET    /api/serviceprovider-requirement/mine            — List own submissions
GET    /api/serviceprovider-requirement/read/:id        — Get single requirement
PATCH  /api/serviceprovider-requirement/approve/:id     — Approve
PATCH  /api/serviceprovider-requirement/reject/:id      — Reject (requires reason)
PATCH  /api/serviceprovider-requirement/reverse/:id     — Reverse approval
POST   /api/serviceprovider-requirement/enhancement/:id — Submit enhancement
DELETE /api/serviceprovider-requirement/delete/:id      — Soft delete
```

### Analytics & Reports
```
GET /api/project-report/analytics   — Full analytics dashboard data (query params: startDate, endDate, projectId, status, priority, assignedTo)
GET /api/reports                     — Paginated project status reports
GET /api/reports/export/pdf          — Server-side PDF export (PDFKit)
GET /api/reports/export/excel        — Server-side Excel export (ExcelJS)
```

### Projects — CRUD
```
POST   /api/project/create
GET    /api/project/list
GET    /api/project/filter
GET    /api/project/search
GET    /api/project/summary          — Dashboard summary counts
GET    /api/project/read/:id
PATCH  /api/project/update/:id
DELETE /api/project/delete/:id
GET    /api/projects                 — All projects with full embedded data
GET    /api/projects/active          — Active projects for carousel
```

### Projects — Tasks, Issues, Members
```
GET    /api/project/:id              — Full project with tasks
POST   /api/project/:id/task         — Add task
GET    /api/project/:id/task/:taskId
PUT    /api/project/:id/task/:taskId — Update task
DELETE /api/project/:id/task/:taskId
PUT    /api/project/:id/todo         — Reorder tasks (Kanban drag-and-drop)
POST   /api/project/:id/member       — Add team member
DELETE /api/project/:id/member/:memberId
POST   /api/project/:id/qualityAssurance
DELETE /api/project/:id/qualityAssurance/:id
POST   /api/project/:id/issue
GET    /api/project/:id/issue/:issueId
PUT    /api/project/:id/issue/:issueId
DELETE /api/project/:id/issue/:issueId
POST   /api/project/:id/comment
DELETE /api/project/:id/comment/:commentId
POST   /api/project/:id/task/:taskId/comment
DELETE /api/project/:id/task/:taskId/comment/:commentId
```

### Users
```
POST   /api/user/create
GET    /api/user/read/:id
PATCH  /api/user/update/:id
DELETE /api/user/delete/:id
GET    /api/user/search
GET    /api/user/list
GET    /api/user/filter
PATCH  /api/user/change-password/:id
PATCH  /api/user/status/:id          — Enable / disable account
```

### Roles & Permissions
```
POST/GET/PATCH/DELETE /api/role/create|read/:id|update/:id|delete/:id|search|list|filter
GET /api/resources
GET /api/permissions
```

### Org Structure (all full CRUD)
```
/api/chief/*          — Chief CRUD
/api/department/*     — Department CRUD
/api/division/*       — Division CRUD
/api/category/*       — Category CRUD
```

### Service Providers
```
POST   /api/serviceprovider/create
GET    /api/serviceprovider/read/:id
PATCH  /api/serviceprovider/update/:id
DELETE /api/serviceprovider/delete/:id
GET    /api/serviceprovider/search
GET    /api/serviceprovider/list
GET    /api/serviceprovider/filter
```

### Report Entries (Status Reports)
```
POST/GET/PATCH/DELETE /api/report/*         — Project Status Reports
POST/GET/PATCH/DELETE /api/generalReport/*  — General Reports
```

---

## 16. Security Model

### Dual Authentication

Every protected API request requires **two** security checks:

1. **HMAC Signature** (`isValidSignature`) — validates a cryptographic signature embedded in the request header; ensures requests originate from the legitimate frontend client
2. **JWT Token** (`isValidToken`) — validates the Bearer token, checks expiry, loads the user from DB, and confirms `user.isLoggedIn ≠ 0` (enables server-side forced logout)

### Password Security

- All passwords hashed with `bcryptjs` (salted bcrypt)
- Service providers have separate credentials and a separate login endpoint
- Login generates a JWT with configurable expiry (`7d` if "remember me", `24h` otherwise)
- Password comparison uses `bcrypt.compare` (timing-safe)

### Permission Enforcement (4-level chain)

Every sensitive controller action calls `hasPermission(req, permissionName)`:

```
User → user.role (ObjectId)
  → Role.resources[] → find entry where resource matches target
    → resource.permissions[] → check if target Permission._id is present
      → 403 Forbidden if not found
```

Returns `403 Forbidden` with a descriptive message if any step fails.

### Route-Level Protection Summary

| Route Group | Signature | JWT | RBAC |
|-------------|-----------|-----|------|
| `/api/public/*` | ✗ | ✗ | ✗ |
| `/api/serviceprovider-requirement/login` | ✗ | ✗ | ✗ |
| `/api/login` | ✓ | ✗ | ✗ |
| `/api/*` (app routes) | ✓ | ✓ | ✓ (per controller) |
| `/api/reports/*` | ✓ | ✓ | ✓ |

### Input Validation

- Joi schema validation on login inputs (email format, required fields)
- File type validation on requirement attachments — only `.pdf`, `.doc`, `.docx`
- Required field validation on all create/update operations
- Minimum length enforcement on rejection/reversal reasons (≥ 10 characters)
- Project creation validations: unique title, valid date range, deliverable dates within project range, consecutive deliverable dates, total weight = 100, total deliverable cost = totalBudget

### Soft Deletes

All records use `removed: true` flag — no data is permanently destroyed. This preserves full history, audit trails, and allows recovery.

### Audit Trail

`ServiceProviderRequirement.activityLog` is an append-only array recording every significant action:

| Action | Recorded When |
|--------|--------------|
| `submitted` | Requirement first created |
| `approved` | Approver approves |
| `rejected` | Approver rejects |
| `enhancement_submitted` | Sender submits enhancement |
| `approval_reversed` | Approver reverses a prior approval |

Each entry stores: `action`, `performedBy` (User ref), `performedAt` (timestamp), `note` (reason/description).

---

## 17. Data Flow Summary

### Complete System Interaction Map

```
┌──────────────────────────────────────────────────────────────────────┐
│                        USERS & ROLES                                 │
│                                                                      │
│  Admin  ──creates──►  Role (Approver)  ──assigned to──►  Manager    │
│                        Role (Sender)   ──assigned to──►  Internal   │
│                                                                      │
│  Chief → Department → Division → User (position: Professional/      │
│                                        Manager/Director)             │
└────────────────────────────────┬─────────────────────────────────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              │                  │                  │
              ▼                  ▼                  ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐
│ Service Provider│  │  Send Require-  │  │  Project Management     │
│ (Owner/Company) │  │  ment (Internal │  │                         │
│                 │  │   User)         │  │  Category               │
│ Register as     │  │                 │  │  → Project              │
│ ServiceProvider │  │ /send-requirement│ │     → Deliverables      │
│ ─────────────── │  │ ────────────── │  │     → Tasks (Kanban)    │
│ Submit require- │  │ POST /create   │  │     → Issues            │
│ ment via login  │  │                 │  │     → Risks             │
└────────┬────────┘  └────────┬────────┘  │     → Comments         │
         │                    │           │  → Team Members         │
         └──────────┬─────────┘           │  → QA Reviewers        │
                    │                     └──────────────────────────┘
                    ▼
         ┌─────────────────────┐
         │  ServiceProvider-   │
         │  Requirement DB     │
         │  status: submitted  │
         └──────────┬──────────┘
                    │
                    ▼
         ┌─────────────────────┐
         │  Approver Reviews   │
         │  /approve-requirement│
         └──────────┬──────────┘
                    │
         ┌──────────┼───────────┐
         ▼          ▼           ▼
    ┌─────────┐ ┌────────┐ ┌──────────────┐
    │Approved │ │Rejected│ │Reverse       │
    │         │ │        │ │(if approved) │
    │ → Auto  │ │ → Sender│ └──────────────┘
    │   task  │ │   can   │
    │  created│ │  enhance│
    │  in proj│ └────┬────┘
    └─────────┘      │
                     ▼
              ┌─────────────────┐
              │  Enhancement    │
              │  Submitted      │
              │  status:        │
              │  enhancement_   │
              │  pending        │
              └─────────────────┘
                     │
                     ▼ (back to Approver review)

                  ─── Full audit trail in activityLog ───

┌──────────────────────────────────────────────────────────────────────┐
│                         REPORTING                                    │
│                                                                      │
│  Dashboard (/) ──────────── Project summary cards + My Projects      │
│                                                                      │
│  /project/report/:id ─────── Per-project: Deliverables + Tasks      │
│                               Excel export (2 modes)                 │
│                                                                      │
│  /generalReport ────────────  Analytics dashboard                    │
│     KPI cards, Doughnut, Bar, Line, On-Time charts                   │
│     Filterable task detail table                                     │
│     Export: Excel (3 sheets) + PDF (browser print)                  │
│                                                                      │
│  /report ───────────────────  Status reports (scope/budget/schedule) │
│     Server PDF (PDFKit) + Server Excel (ExcelJS)                     │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Glossary

| Term | Definition |
|------|-----------|
| **Service Provider** | External company or individual registered in the system, linked as the owner of a project |
| **Requirement** | A formal document submitted by a service provider or internal user for review and approval |
| **Enhancement** | A revised version of a rejected requirement — resubmitted with additional description and/or documents |
| **Approver** | A user whose Role includes `update` permission on the `Approve Requirement` resource; typically a Manager |
| **Deliverable** | A major outcome/milestone within a project; has a weight (0–100, sum must equal 100) and cost (sum must equal totalBudget) |
| **Task** | A unit of work under a deliverable; has a stage (todo/in progress/done/completed), actual completion value, and cost |
| **Achievement** | A project-level `0–100` integer representing overall completion percentage |
| **EMV** | Expected Monetary Value — a risk metric (possibility × impact) stored on each project risk item |
| **activityLog** | Append-only audit trail on `ServiceProviderRequirement` recording every action with performer and timestamp |
| **RBAC** | Role-Based Access Control — the permission system where a Role maps Resources to allowed Permissions |
| **HMAC Signature** | Hash-based Message Authentication Code — a cryptographic signature attached to every API request to verify request authenticity |

---

*Report prepared: July 26, 2026*  
*System: PM-MERN — Project Management System*  
*Organization: Global Bank S.C.*
