/**
 * Migration: Remove "Report" from sidebar (mark removed + strip from all roles)
 * Run: node setup/removeReportMenu.js
 */
require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
mongoose.set('strictQuery', false);
mongoose.connect(process.env.DATABASE);
mongoose.Promise = global.Promise;

const Resource = require('../models/appModels/Resource');
const Role     = require('../models/appModels/Role');

async function run() {
  try {
    await new Promise((r) => setTimeout(r, 1500));

    const reportRes = await Resource.findOne({ name: 'Report', url: '/report' });
    if (!reportRes) {
      console.log('Report resource not found — nothing to do.');
      process.exit(0);
    }
    console.log('Found Report resource:', String(reportRes._id));

    // Soft-delete so /api/resources (listAll) won't return it
    await Resource.findByIdAndUpdate(reportRes._id, { removed: true });
    console.log('✅ Marked Report resource as removed');

    // Pull from every role's resources array
    const result = await Role.updateMany(
      {},
      { $pull: { resources: { resource: reportRes._id } } }
    );
    console.log('✅ Removed from roles:', result.modifiedCount, 'roles updated');

    console.log('\n→ Users must log out and log back in (with Full Load ✓) to see the change.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

run();
