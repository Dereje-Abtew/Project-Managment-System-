/**
 * Migration: Link existing Stakeholder users to Stakeholder records
 * 
 * This script helps automatically link User records (with "Stakeholder" role)
 * to matching Stakeholder records based on email, username, or name.
 *
 * Run once:
 *   node backend/setup/linkUsersToStakeholders.js
 */
require('dotenv').config({ path: __dirname + '/../.env' });

const mongoose = require('mongoose');
mongoose.set('strictQuery', false);
mongoose.connect(process.env.DATABASE);
mongoose.Promise = global.Promise;

const User        = require('../models/coreModels/User');
const Stakeholder = require('../models/appModels/Stakeholder');
const Role        = require('../models/appModels/Role');

async function run() {
  try {
    console.log('🔍 Finding Stakeholder role...');
    
    // Find the Stakeholder role
    const spRole = await Role.findOne({ 
      name: { $regex: /stakeholder/i },
      removed: false 
    });
    
    if (!spRole) {
      console.error('❌ No "Stakeholder" role found. Please create it first.');
      process.exit(1);
    }
    
    console.log(`✅ Found role: "${spRole.name}" (${spRole._id})`);
    
    // Find all users with Stakeholder role
    const spUsers = await User.find({ 
      role: spRole._id,
      removed: false,
      enabled: true
    });
    
    console.log(`\n🔍 Found ${spUsers.length} users with Stakeholder role\n`);
    
    if (spUsers.length === 0) {
      console.log('ℹ️  No Stakeholder users to process.');
      process.exit(0);
    }
    
    let linked = 0;
    let alreadyLinked = 0;
    let notMatched = 0;
    
    for (const user of spUsers) {
      const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
      
      // Check if already linked
      if (user.stakeholder) {
        console.log(`✓ ${user.email} → Already linked to Stakeholder (${user.stakeholder})`);
        alreadyLinked++;
        continue;
      }
      
      // Try to find matching Stakeholder
      const spProvider = await Stakeholder.findOne({
        removed: false,
        $or: [
          { email: user.email },
          { username: user.email },
          { username: user.username },
          ...(fullName ? [{ name: new RegExp(`^${fullName}$`, 'i') }] : []),
        ],
      });
      
      if (spProvider) {
        // Link the user to the stakeholder
        user.stakeholder = spProvider._id;
        await user.save();
        
        console.log(`✅ ${user.email} → Linked to "${spProvider.name}" (${spProvider._id})`);
        linked++;
      } else {
        console.log(`⚠️  ${user.email} (${fullName}) → No matching Stakeholder found`);
        notMatched++;
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 Migration Summary:');
    console.log('='.repeat(60));
    console.log(`   Total Stakeholder users: ${spUsers.length}`);
    console.log(`   ✅ Successfully linked:   ${linked}`);
    console.log(`   ✓  Already linked:        ${alreadyLinked}`);
    console.log(`   ⚠️  Not matched:           ${notMatched}`);
    console.log('='.repeat(60));
    
    if (notMatched > 0) {
      console.log('\n⚠️  WARNING: Some users could not be automatically linked.');
      console.log('   Please manually link them using the User Management interface:');
      console.log('   1. Edit the user');
      console.log('   2. Set the "Stakeholder Link" field');
      console.log('   3. Select the correct Stakeholder record');
      console.log('   4. Save\n');
    }
    
    console.log('\n✅ Migration complete.\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    console.error(err);
    process.exit(1);
  }
}

run();
