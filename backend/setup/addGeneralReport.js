/**
 * Migration: Add "General Report" to the live database
 *
 * Run once from the backend folder:
 *   node setup/addGeneralReport.js
 *
 * What it does:
 *   1. Creates the "General Report" Resource ( /generalReport )
 *   2. Adds it to every existing Role with appropriate permissions
 *   3. Safe to re-run — uses upsert, never duplicates
 */

require('dotenv').config({ path: __dirname + '/../.env' });

const mongoose = require('mongoose');
mongoose.set('strictQuery', false);
mongoose.connect(process.env.DATABASE);
mongoose.Promise = global.Promise;

const Resource   = require('../models/appModels/Resource');
const Permission = require('../models/appModels/Permission');
const Role       = require('../models/appModels/Role');

// Roles that get READ + REPORT permission on General Report
const REPORT_ROLES = ['Admin', 'Director', 'ProjectManager'];

// Roles that get READ-only permission on General Report
const READONLY_ROLES = ['TeamLeader', 'Professional', 'QA'];

async function run() {
  try {
    // ── 1. Load all permissions ──────────────────────────────────────────────
    const perms = await Permission.find({});
    if (perms.length === 0) {
      console.error('❌ No permissions found. Run npm run setup first.');
      process.exit(1);
    }
    const permByName = Object.fromEntries(perms.map((p) => [p.name, p]));

    const readPerm   = permByName['read'];
    const reportPerm = permByName['report'];

    if (!readPerm) {
      console.error('❌ "read" permission not found. Run npm run setup first.');
      process.exit(1);
    }

    // ── 2. Upsert the General Report resource ────────────────────────────────
    const allPermIds = perms.map((p) => p._id);
    const resource = await Resource.findOneAndUpdate(
      { name: 'General Report' },
      {
        name:        'General Report',
        url:         '/generalReport',
        isSubMenu:   false,
        permissions: allPermIds,
      },
      { upsert: true, new: true }
    );
    console.log(`✅ Resource "General Report" ready  (id: ${resource._id})`);

    // ── 3. Add the resource to every role ────────────────────────────────────
    const roles = await Role.find({});

    for (const role of roles) {
      // Skip if already has this resource
      const alreadyHas = role.resources.some(
        (r) => String(r.resource) === String(resource._id)
      );
      if (alreadyHas) {
        console.log(`  ⏭  Role [${role.name}] already has General Report — skipped`);
        continue;
      }

      let permissions = [];

      if (role.name === 'Admin') {
        // Admin gets all permissions
        permissions = allPermIds;
      } else if (REPORT_ROLES.includes(role.name)) {
        // Director / ProjectManager — read + report
        permissions = [readPerm._id];
        if (reportPerm) permissions.push(reportPerm._id);
      } else {
        // TeamLeader / Professional / QA — read only
        permissions = [readPerm._id];
      }

      await Role.findByIdAndUpdate(role._id, {
        $push: {
          resources: { resource: resource._id, permissions },
        },
      });

      console.log(`✅ Role [${role.name}] — General Report added`);
    }

    console.log('\n══════════════════════════════════════════════════════════');
    console.log('✅ Migration complete!');
    console.log('   → All users must LOG OUT and LOG BACK IN to see the');
    console.log('     "General Report" menu item in their sidebar.');
    console.log('══════════════════════════════════════════════════════════\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }
}

run();
