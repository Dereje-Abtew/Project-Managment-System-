# Requirements Document

## Introduction

This feature delivers a Requirement Submission and Approval workflow within the PM-MERN project management application. Internal users with the appropriate role permission can submit requirements through a structured form (Send Requirement). Designated approvers with a separate permission can view all submitted requirements and take Accept or Reject actions. Rejected requirements can be updated by the original sender as an "enhancement" and resubmitted for re-approval. The feature builds on the existing `ServiceProviderRequirement` model, controller, and route infrastructure already present in the codebase, and surfaces two distinct menu items — **Send Requirement** and **Approve Requirement** — whose visibility is controlled by the role-permission system.

---

## Glossary

- **Requirement**: A formal submission created by a Sender that carries: Sender Name, Date, Sender Email, Sender Phone, and at least one file Attachment (PDF, DOC, or DOCX).
- **Sender**: An authenticated internal user who has the `create` permission on the `Send Requirement` resource and submits Requirements through the Send Requirement form.
- **Approver**: An authenticated internal user who has the `update` permission on the `Approve Requirement` resource and can Accept or Reject Requirements.
- **Enhancement**: An update submitted by the original Sender against a previously Rejected Requirement, which resets the status to `enhancement_pending` and triggers a new approval cycle.
- **Submission_Form**: The UI form on the Send Requirement page containing Sender Name, Date, Sender Email, Sender Phone, and Attachment fields.
- **Submission_List**: The table displayed below the Submission_Form showing: Sender, Status, Submitted At, Approved By, and Action columns.
- **Rejection_Form**: The modal shown to an Approver when rejecting a Requirement, containing Date, Username (Approver), and Reason fields — all mandatory.
- **Requirement_Status**: One of `submitted`, `approved`, `rejected`, `enhancement_pending`, or `implemented`.
- **Attachment**: A file object with `name` and `url` properties. Permitted types: `.pdf`, `.doc`, `.docx`.
- **API**: The PM-MERN Express/Node.js backend REST API.
- **UI**: The PM-MERN React/Ant Design frontend single-page application.
- **Permission_System**: The role-based access control already implemented via `Resource`, `Permission`, and `Role` MongoDB models.
- **FileUpload_Handler**: The frontend utility responsible for reading a selected file and converting it to a base64 data-URL for attachment storage.

---

## Requirements

### Requirement 1: Submit a Requirement

**User Story:** As a Sender, I want to fill in a structured form with my identity details and attach a document, so that I can formally submit a requirement for approval.

#### Acceptance Criteria

1. WHEN the Sender navigates to the Send Requirement page, THE Submission_Form SHALL display the following fields: Sender Name (pre-filled, read-only from the authenticated user), Date (pre-filled, read-only with current date), Sender Email, Sender Phone, and Attachment.
2. WHEN the Sender submits the Submission_Form, THE API SHALL require Sender Name, Sender Email, and Sender Phone to be non-empty; IF any required field is missing, THEN THE API SHALL return HTTP 400 with a descriptive error message.
3. WHEN the Sender submits the Submission_Form, THE API SHALL require at least one Attachment; IF no Attachment is provided, THEN THE API SHALL return HTTP 400 with the message "At least one attachment (pdf/doc/docx) is required."
4. WHEN an Attachment is selected, THE FileUpload_Handler SHALL accept only files with extensions `.pdf`, `.doc`, or `.docx`; IF a file with a disallowed extension is selected, THEN THE UI SHALL display an error message and SHALL NOT add the file to the attachment list.
5. WHEN a valid Attachment is selected, THE FileUpload_Handler SHALL read the file and add an object `{ name: <filename>, url: <base64-data-url> }` to the attachment list.
6. WHEN the Submission_Form is successfully submitted, THE API SHALL persist the Requirement with `status` set to `submitted` and a `submittedAt` timestamp.
7. WHEN the Submission_Form is successfully submitted, THE UI SHALL display a success notification and SHALL reset the form fields and the attachment list.

---

### Requirement 2: View Submitted Requirements (Sender Side)

**User Story:** As a Sender, I want to see a list of all requirements I have submitted with their current status and approval details, so that I can track the progress of my submissions.

#### Acceptance Criteria

1. WHEN the Send Requirement page loads, THE Submission_List SHALL display all Requirements returned by the API, including columns: Sender, Status, Submitted At, Approved By, and Action.
2. THE Submission_List SHALL render the Status column using a color-coded tag: green for `approved`, red for `rejected`, blue for `enhancement_pending`, and orange for all other statuses.
3. WHEN a Requirement has been approved, THE Submission_List SHALL display the full name of the Approver in the Approved By column.
4. WHEN a Requirement has not been approved, THE Submission_List SHALL display "—" in the Approved By column.

---

### Requirement 3: Add an Enhancement to a Rejected Requirement

**User Story:** As a Sender, I want to add an enhancement or update to a rejected requirement and resubmit it, so that the Approver can review the updated version.

#### Acceptance Criteria

1. WHEN a Requirement has `status` equal to `rejected`, THE Submission_List SHALL display an "Add Enhancement" action button in the Action column for that row.
2. WHEN the Sender clicks "Add Enhancement", THE UI SHALL open a modal form allowing the Sender to provide a new Attachment and optionally updated Sender Email, Sender Phone, and an Enhancement Summary text field.
3. WHEN the Sender submits the Enhancement modal, THE API SHALL create a new Requirement document with `isEnhancement: true`, `parentRequirement` referencing the original Requirement's `_id`, and `status` set to `enhancement_pending`.
4. WHEN the Enhancement is successfully created, THE API SHALL update the original Requirement's `status` to `enhancement_pending`.
5. WHEN the Enhancement is successfully created, THE UI SHALL close the modal, display a success notification, and SHALL reload the Submission_List.
6. IF the Sender submits the Enhancement modal without providing at least one Attachment, THEN THE API SHALL return HTTP 400 with the message "At least one attachment (pdf/doc/docx) is required."

---

### Requirement 4: View All Requirements (Approver Side)

**User Story:** As an Approver, I want to see all submitted requirements from all senders in a dedicated menu, so that I can take approval actions.

#### Acceptance Criteria

1. WHEN a user with the `update` permission on the `Approve Requirement` resource navigates to the Approve Requirement page, THE UI SHALL display all Requirements fetched from the API in a table with columns: Sender, Status, Submitted At, Approved By, and Action.
2. WHEN a user without the `update` permission on the `Approve Requirement` resource navigates to the Approve Requirement page, THE UI SHALL display an unauthorized warning and SHALL NOT show any Requirement data.
3. THE Approve Requirement menu item SHALL only be visible in the navigation sidebar to users whose role includes the `Approve Requirement` resource.
4. THE Send Requirement menu item SHALL only be visible in the navigation sidebar to users whose role includes the `Send Requirement` resource.

---

### Requirement 5: Approve a Requirement

**User Story:** As an Approver, I want to approve a submitted requirement with a single action, so that the requirement is marked as accepted and the sender is notified via status change.

#### Acceptance Criteria

1. WHEN an Approver clicks the "Approve" button for a Requirement with `status` not equal to `approved`, THE API SHALL update the Requirement's `status` to `approved`, record the `approvedBy` field with the Approver's user `_id`, and set `approvedAt` to the current timestamp.
2. WHEN a Requirement is successfully approved, THE UI SHALL display a success notification and SHALL reload the requirements list.
3. WHEN a Requirement already has `status` equal to `approved`, THE UI SHALL NOT display an "Approve" button for that row.

---

### Requirement 6: Reject a Requirement

**User Story:** As an Approver, I want to reject a requirement and provide a mandatory reason, date, and my username, so that the sender understands why the requirement was not accepted.

#### Acceptance Criteria

1. WHEN an Approver clicks the "Reject" button for a Requirement with `status` not equal to `approved`, THE UI SHALL open the Rejection_Form modal.
2. THE Rejection_Form SHALL contain the following fields, all of which are mandatory: Date (pre-filled, read-only with current date), Username (pre-filled, read-only from authenticated user), and Reason (free-text input).
3. WHEN the Approver submits the Rejection_Form with all fields filled, THE API SHALL update the Requirement's `status` to `rejected`, set `rejectedBy` to the Approver's user `_id`, set `rejectedAt` to the current timestamp, and store the Reason in the `approvalNotes` field.
4. IF the Approver submits the Rejection_Form with an empty Reason, THEN THE UI SHALL display a validation error and SHALL NOT submit the request to the API.
5. WHEN a Requirement is successfully rejected, THE UI SHALL close the Rejection_Form modal, display a success notification, and SHALL reload the requirements list.

---

### Requirement 7: Re-Approval After Enhancement

**User Story:** As an Approver, I want to see enhanced/updated requirements and approve or reject them again, so that the approval cycle can be completed after a sender has addressed feedback.

#### Acceptance Criteria

1. WHEN a Requirement has `status` equal to `enhancement_pending`, THE Approve Requirement page SHALL display it in the requirements table with status tag "enhancement_pending".
2. WHEN an Approver clicks "Approve" on a Requirement with `status` equal to `enhancement_pending`, THE API SHALL update its `status` to `approved` following the same rules as Requirement 5.
3. WHEN an Approver clicks "Reject" on a Requirement with `status` equal to `enhancement_pending`, THE UI SHALL open the Rejection_Form modal and THE API SHALL follow the same rejection rules as Requirement 6.

---

### Requirement 8: File Type Enforcement

**User Story:** As a system administrator, I want the API to enforce that only PDF and Word documents are attached to requirements, so that the document store remains consistent and safe.

#### Acceptance Criteria

1. WHEN the API receives a create or enhancement request that contains at least one Attachment whose `name` does not end with `.pdf`, `.doc`, or `.docx` (case-insensitive), THEN THE API SHALL return HTTP 400 with the message "Attachments must be PDF or Word documents."
2. THE API SHALL validate attachment file type using the file extension of the `name` field, ignoring case.
3. WHERE the Attachment list contains multiple files, THE API SHALL validate every file and SHALL reject the entire request if any single file fails validation.

---

### Requirement 9: Permission-Based Access Control

**User Story:** As a system administrator, I want each workflow action to be protected by the role-permission system, so that only authorized users can submit, approve, or reject requirements.

#### Acceptance Criteria

1. WHEN the API receives a create requirement request from an authenticated user who does not have the `create` permission on the `Send Requirement` resource, THEN THE API SHALL return HTTP 403 with the message "You do not have permission to create requirements."
2. WHEN the API receives an approve or reject request from an authenticated user who does not have the `update` permission on the `Approve Requirement` resource, THEN THE API SHALL return HTTP 403 with the message "You do not have permission to approve requirements" or "You do not have permission to reject requirements" respectively.
3. WHEN the API receives a list or read request from an authenticated user who does not have the `read` permission on either the `Send Requirement` or `Approve Requirement` resource, THEN THE API SHALL return HTTP 403 with the message "You do not have permission to view requirements."
4. THE Permission_System SHALL determine access by checking the authenticated user's role, resolving the role's resource entries, and comparing against the required resource name and permission name.
