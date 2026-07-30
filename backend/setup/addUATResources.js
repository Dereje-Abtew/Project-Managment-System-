/**
 * Migration: Add "UAT Sign Off" and "SP UAT Portal" resources
 * and assign them to existing roles.
 *
 * Run once:
 *   node backend/setup/addUATResources.js
 */
require('dotenv').config({ path: __dirname + '/../.env' });

const mongoose = require('mongoose');
mongoose.set('strictQuery', false);
mongoose.connect(process.env.DATABASE);
mongoose.Promise = global.Promise;

const Permission = require('../models/appModels/Permission');
const Resource   = require('../models/appModels/Resource');
const Role       = require('../models/appModels/Role');

async function run() {
  try {
    // ── 1. Get all permissions ──────────────────────────────────────────────
    const perms      = await Permission.find({});
    const allPerms   = perms.map((p) => p._id);
    const permByName = Object.fromEntries(perms.map((p) => [p.name, p]));

    if (allPerms.length === 0) {
      console.error('❌ No permissions found. Run setup.js first.');
      process.exit(1);
    }

    // ── 2. Upsert the two missing resources ────────────────────────────────
    const uatSignOff = await Resource.findOneAndUpdate(
      { name: 'UAT Sign Off' },
      { name: 'UAT Sign Off', url: '/uat-signoff', isSubMenu: false, permissions: allPerms, removed: false },
      { upsert: true, new: true }
    );
    console.log('✅ Resource "UAT Sign Off" ready:', uatSignOff._id);

    const spPortal = await Resource.findOneAndUpdate(
      { name: 'SP UAT Portal' },
      { name: 'SP UAT Portal', url: '/sp-dashboard', isSubMenu: false, permissions: allPerms, removed: false },
      { upsert: true, new: true }
    );
    console.log('✅ Resource "SP UAT Portal" ready:', spPortal._id);

    // ── 3. Update all roles — append the two resources if not already there ──
    const roles = await Role.find({ removed: false });

    for (const role of roles) {
      let changed = false;

      // Check if UAT Sign Off already assigned
      const hasUAT = role.resources.some(
        (r) => r.resource?.toString() === uatSignOff._id.toString()
      );
      if (!hasUAT) {
        // Admin gets all perms; others get all perms too (admin can restrict later)
        role.resources.push({ resource: uatSignOff._id, permissions: allPerms });
        changed = true;
      }

      // Check if SP UAT Portal already assigned
      const hasSP = role.resources.some(
        (r) => r.resource?.toString() === spPortal._id.toString()
      );
      if (!hasSP) {
        role.resources.push({ resource: spPortal._id, permissions: allPerms });
        changed = true;
      }

      if (changed) {
        await role.save();
        console.log(`✅ Role [${role.name}] updated with new resources.`);
      } else {
        console.log(`ℹ️  Role [${role.name}] already has these resources.`);
      }
    }

    console.log('\n✅ Migration complete.');
    console.log('   "UAT Sign Off" and "SP UAT Portal" now appear in Role Management.');
    console.log('   Re-login to see the updated sidebar.\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }
}

run();
