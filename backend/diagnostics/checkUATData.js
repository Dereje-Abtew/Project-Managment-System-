/**
 * Diagnostic Script to Check UAT Sign Off Data
 * Run this from backend directory: node diagnostics/checkUATData.js
 */

require('module-alias/register');
const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

// Load models
require('../models/appModels/UATSignOff');
require('../models/coreModels/User');
require('../models/appModels/Project');

async function checkData() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.DATABASE, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB\n');

    const UATSignOff = mongoose.model('UATSignOff');
    const User = mongoose.model('User');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 CHECKING UAT SIGN OFF DATA');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Get all UAT records
    const uats = await UATSignOff.find({ removed: false })
      .populate('serviceProvider')
      .populate('project')
      .sort({ created: -1 });

    console.log(`Total UAT Records: ${uats.length}\n`);

    uats.forEach((uat, index) => {
      console.log(`${index + 1}. UAT: ${uat.uatNumber}`);
      console.log(`   Project: ${uat.project?.title || 'N/A'}`);
      console.log(`   Stakeholder Field: ${uat.serviceProvider}`);
      console.log(`   Stakeholder Type: ${typeof uat.serviceProvider}`);
      
      if (uat.serviceProvider && typeof uat.serviceProvider === 'object') {
        console.log(`   SP Name: ${uat.serviceProvider.firstName} ${uat.serviceProvider.lastName}`);
        console.log(`   SP Email: ${uat.serviceProvider.email}`);
        console.log(`   SP Position: ${uat.serviceProvider.position}`);
        console.log(`   SP ID: ${uat.serviceProvider._id}`);
      } else if (uat.serviceProvider) {
        console.log(`   SP ID (not populated): ${uat.serviceProvider}`);
      } else {
        console.log(`   ❌ NO STAKEHOLDER SET!`);
      }
      console.log('');
    });

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👥 STAKEHOLDER USERS IN DATABASE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const spUsers = await User.find({ 
      removed: false, 
      position: /stakeholder/i 
    });

    console.log(`Total Stakeholder Users: ${spUsers.length}\n`);

    spUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Position: ${user.position}`);
      console.log(`   ID: ${user._id}`);
      console.log('');
    });

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await mongoose.connection.close();
    console.log('✅ Diagnostic complete. Connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkData();
