/**
 * Fix Script: Ensure all UAT Sign Offs have correct Stakeholder
 * This script will update UAT records to match their project's ownerName
 * 
 * Run from backend directory: node diagnostics/fixUATServiceProviders.js
 */

require('module-alias/register');
const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

// Load models
require('../models/appModels/UATSignOff');
require('../models/coreModels/User');
require('../models/appModels/Project');

async function fixUATServiceProviders() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.DATABASE, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB\n');

    const UATSignOff = mongoose.model('UATSignOff');
    const Project = mongoose.model('Project');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔧 FIXING UAT STAKEHOLDER ASSIGNMENTS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Get all UAT records
    const uats = await UATSignOff.find({ removed: false });
    console.log(`Found ${uats.length} UAT records to check\n`);

    let fixedCount = 0;
    let alreadyCorrect = 0;
    let errorCount = 0;
    let noOwnerCount = 0;

    for (const uat of uats) {
      try {
        // Get the project with populated ownerName
        const project = await Project.findOne({ _id: uat.project, removed: false })
          .populate('ownerName');

        if (!project) {
          console.log(`⚠️  UAT ${uat.uatNumber}: Project not found (ID: ${uat.project})`);
          errorCount++;
          continue;
        }

        const correctServiceProvider = project.ownerName?._id;

        if (!correctServiceProvider) {
          console.log(`⚠️  UAT ${uat.uatNumber}: Project "${project.title}" has no owner assigned`);
          noOwnerCount++;
          continue;
        }

        // Check if serviceProvider is already correct
        const currentSP = uat.serviceProvider?.toString();
        const correctSP = correctServiceProvider.toString();

        if (currentSP === correctSP) {
          console.log(`✅ UAT ${uat.uatNumber}: Already correct (Project: ${project.title})`);
          alreadyCorrect++;
          continue;
        }

        // Update the UAT with correct serviceProvider
        uat.serviceProvider = correctServiceProvider;
        uat.updated = new Date();
        await uat.save();

        const spUser = project.ownerName;
        console.log(`🔧 FIXED UAT ${uat.uatNumber}:`);
        console.log(`   Project: ${project.title}`);
        console.log(`   Old SP: ${currentSP || 'NULL'}`);
        console.log(`   New SP: ${correctSP} (${spUser.firstName} ${spUser.lastName} - ${spUser.email})`);
        fixedCount++;

      } catch (error) {
        console.error(`❌ Error processing UAT ${uat.uatNumber}: ${error.message}`);
        errorCount++;
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Total UATs Checked:     ${uats.length}`);
    console.log(`✅ Already Correct:     ${alreadyCorrect}`);
    console.log(`🔧 Fixed:               ${fixedCount}`);
    console.log(`⚠️  No Project Owner:   ${noOwnerCount}`);
    console.log(`❌ Errors:              ${errorCount}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (noOwnerCount > 0) {
      console.log('⚠️  ACTION REQUIRED:');
      console.log('   Some projects have no owner (stakeholder) assigned.');
      console.log('   Please go to the Project management page and assign an owner to these projects.');
      console.log('   Then run this script again to update the UATs.\n');
    }

    if (fixedCount > 0) {
      console.log('✅ SUCCESS: UAT stakeholder assignments have been corrected!');
      console.log('   Please restart your backend server to clear any cached data.\n');
    }

    await mongoose.connection.close();
    console.log('✅ Fix complete. Connection closed.');
    process.exit(0);

  } catch (error) {
    console.error('❌ Fatal Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

fixUATServiceProviders();
