# Requirements: Requirement Submission & Approval Workflow

## Overview

This feature covers two separate menu items — **Send Requirement** and **Approve Requirement** — that together form a full document-based approval cycle.

---

## REQ-1: Send Requirement Page

### REQ-1.1 — Submit Form
The Send Requirement page shows a form for users who have the `create` permission on the "Send Requirement" resource. The form must include:
- **Sender Name** — pre-filled from the logged-in user, read-only
- **Date** — auto-filled with today's date, read-only
- **Sender Email** — pre-filled from the logged-in user
- **Sender Phone** — pre-filled from the logged-in user, editable
- **Attachment (PDF/DOC/DOCX)** — required; must accept only `.pdf`, `.doc`, `.docx` files; at least one file is required to submit

On submit, the form posts the requirement (with attachment) to the backend. On success, the form resets and the list below refreshes.

### REQ-1.2 — My Submissions Table
Below the form, the sender sees a table of **their own submitted requirements** (not all requirements). Columns:
- Sender Name
- Status (color-coded tag: submitted=orange, approved=green, rejected=red, enhancement_pending=blue)
- Submitted At
- Approved By
- Action — a **View** button to open the detail modal

### REQ-1.3 — Enhancement Submission
If a requirement is in `rejected` status, the sender can click **Add Enhancement** in the action column. This opens a modal where they fill in an enhancement description and optionally upload a new attachment. Submitting creates a new linked enhancement requirement (status: `enhancement_pending`), and the approver can then review and approve it.

---

## REQ-2: Approve Requirement Page

### REQ-2.1 — View-Only (No Form)
The Approve Requirement page shows **only a table of all submitted requirements**. There is **no form** on this page. The form is exclusive to Send Requirement.

### REQ-2.2 — Submissions Table
The table shows all requirements (visible to users with `update` permission on "Approve Requirement"). Columns:
- Sender Name
- Status (color-coded tag)
- Submitted At
- Approved By
- Rejected By
- Action buttons: **View**, **Approve**, **Reject** (shown only when the user has approve permission and the requirement is not already approved)

### REQ-2.3 — View Detail Modal
Clicking **View** opens a detail modal showing:
- Sender name, email, phone
- Submitted at date
- Status
- Attachment download link(s)
- Approved by / approved at (if applicable)
- Rejected by / rejected at / rejection reason (if applicable)
- Enhancement summary (if this is an enhancement)

### REQ-2.4 — Approve Action
Clicking **Approve** immediately approves the requirement (no extra modal needed). Updates status to `approved`, records `approvedBy` (current user) and `approvedAt`.

### REQ-2.5 — Reject Action (Required Fields)
Clicking **Reject** opens a modal. The following fields are **required** before submission:
- **Date** — auto-filled with today's date, read-only
- **Username** — auto-filled from the logged-in approver, read-only
- **Reason for Rejection** — free-text, required (minimum 10 characters)

On submit, updates status to `rejected`, stores `rejectedBy`, `rejectedAt`, and saves the reason in a dedicated `rejectionReason` field on the model (separate from `approvalNotes`).

### REQ-2.6 — Re-Approval After Enhancement
If a requirement has status `enhancement_pending`, the approver sees it in the table and can approve or reject the enhancement using the same Approve/Reject actions (REQ-2.4 and REQ-2.5).

---

## REQ-3: Attachment Handling

### REQ-3.1 — File Type Validation
Only PDF, DOC, and DOCX files are accepted. Validation happens both on the frontend (file picker) and on the backend (extension check on `name` field).

### REQ-3.2 — Attachment Storage
Attachments are stored as base64 data URLs in the `attachments` array field of the MongoDB document. This is the current architecture (no separate file server).

### REQ-3.3 — Attachment Download
In the detail modal, each attachment must be displayed as a clickable link that opens the file (using the base64 data URL with `target="_blank"`).

---

## REQ-4: Model Updates

### REQ-4.1 — Rejection Reason Field
Add a dedicated `rejectionReason` field (String, default `''`) to the `ServiceProviderRequirement` model, separate from `approvalNotes`. The rejection reason entered by the approver is stored here.

### REQ-4.2 — Existing Fields Unchanged
All existing fields (`approvedBy`, `approvedAt`, `rejectedBy`, `rejectedAt`, `approvalNotes`, `status`, etc.) remain unchanged.

---

## REQ-5: Permission & Route Separation

### REQ-5.1 — Separate Components
`/send-requirement` and `/approve-requirement` must render **separate page components** (not the same `RequirementWorkflow` component) so that each page's layout and content can differ independently.

### REQ-5.2 — Send Requirement Access
Only users with the `create` permission on the "Send Requirement" resource can see and use the submission form. Users without this permission see a "no permission" message.

### REQ-5.3 — Approve Requirement Access
Only users with the `update` permission on the "Approve Requirement" resource can see and use the Approve/Reject action buttons. Users without this permission see a read-only table without action buttons.

---

## REQ-6: Backend Validation

### REQ-6.1 — Reject Endpoint
The `PATCH /reject/:id` endpoint must require `rejectionReason` in the request body (non-empty string). If missing, return HTTP 400 with a descriptive error message.

### REQ-6.2 — Rejection Data Saved
On reject, the backend saves: `status = 'rejected'`, `rejectedBy`, `rejectedAt`, and `rejectionReason`.
