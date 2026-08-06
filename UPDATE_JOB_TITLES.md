# Update Job Titles - Service Provider to Stakeholder

## Issue
User records in the database have "service provider" or "services provider" in the **Job Title** field (user-entered data), which needs to be updated to "stakeholder" for consistency.

## Solution
A migration script has been created to automatically update all user job titles that contain "service provider" (case-insensitive) to "stakeholder".

## How to Run the Migration

### Step 1: Navigate to Backend Directory
```bash
cd backend
```

### Step 2: Run the Migration Script
```bash
node migrations/updateJobTitles.js
```

### Step 3: Verify the Results
The script will:
1. Connect to your MongoDB database
2. Find all users with "service provider" in their job title
3. Display the users that will be updated
4. Update their job titles to "stakeholder"
5. Display the updated users
6. Show a summary of how many records were updated

## What Gets Updated

### Before:
- Job Title: "service provider" → Will be updated
- Job Title: "services provider" → Will be updated
- Job Title: "Service Provider Manager" → Will be updated
- Job Title: "Senior Service Provider" → Will be updated

### After:
- All matching job titles will be set to: "stakeholder"

## Safety Features

✅ Only updates non-deleted users (`removed: false`)
✅ Case-insensitive matching (finds "Service Provider", "service provider", "SERVICES PROVIDER", etc.)
✅ Shows preview before updating
✅ Provides detailed logging of all changes
✅ Does not affect other user fields

## What This Does NOT Change

This migration script ONLY updates the `jobTitle` field in the User collection. It does NOT change:
- Position field (already set to "Stakeholder")
- UI labels (already updated in previous changes)
- API endpoints (already renamed)
- Database collection names (already migrated if you ran the previous migration)

## Rollback

If you need to rollback, you can manually update the job titles back or create a reverse migration. However, since "stakeholder" is the correct term going forward, rollback should not be necessary.

## Example Output

```
🚀 Starting Job Title Update Migration...

✅ Connected to MongoDB

Found 3 users with "service provider" in job title

Users to be updated:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Dereje Abtew
   Current Job Title: "services provider"
   Position: Stakeholder

2. John Doe
   Current Job Title: "Service Provider Manager"
   Position: Stakeholder

3. Jane Smith
   Current Job Title: "senior service provider"
   Position: Stakeholder

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Updating job titles...

✅ Successfully updated 3 user job titles

Updated users:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Dereje Abtew
   New Job Title: "stakeholder"
   Position: Stakeholder

2. John Doe
   New Job Title: "stakeholder"
   Position: Stakeholder

3. Jane Smith
   New Job Title: "stakeholder"
   Position: Stakeholder

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Migration completed successfully!

Database connection closed.
```

## After Running Migration

After running this migration:
1. Refresh the Team Member page in your browser
2. Edit the user record again
3. The Job Title field should now show "stakeholder" instead of "services provider"

## Note

This is a **one-time migration** script. You only need to run it once to update existing records. New users can have any job title they want - this just updates the old "service provider" entries to match the new terminology.
