/**
 * Complete Migration: Update Service Provider to Stakeholder
 * 
 * This script updates BOTH:
 * 1. Position field: "Service Provider" → "Stakeholder"
 * 2. Job Title field: "services provider" → "stakeholder"
 */

const mongoose = require('mongoose');
require('module-alias/register');
const User = require('@/models/coreModels/User');
const Role = require('@/models/appModels/Role');

require('dotenv').config({ path: './.env' });

const DATABASE_URL = process.env.DATABASE || 'mongodb://127.0.0.1:27017/globalbank';

async function run() {
  try {
    console.log('🚀 Starting Complete Service Provider → Stakeholder Migration...\n');
    
    await mongoose.connect(DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB\n');

    // Find users with "Service Provider" position or "service/provider" in job title
    const usersToUpdate = await User.find({
      $or: [
        { position: /service\s*provider/i },
        { jobTitle: /service/i },
        { jobTitle: /provider/i }
      ],
      removed: false,
    }).select('firstName lastName jobTitle position email');

    console.log(`Found ${usersToUpdate.length} user(s) to update\n`);

    if (usersToUpdate.length === 0) {
      console.log('✅ No users found to update.\n');
      await mongoose.connection.close();
      return;
    }

    console.log('Users to be updated:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    usersToUpdate.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName} (${user.email})`);
      console.log(`   Current Position: "${user.position || 'N/A'}"`);
      console.log(`   Current Job Title: "${user.jobTitle || 'N/A'}"`);
      console.log('');
    });

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Updating records...\n');

    let updatedCount = 0;

    // Update each user individually to handle both fields
    for (const user of usersToUpdate) {
      const updates = {};
      
      // Update position if it contains "service provider"
      if (user.position && /service\s*provider/i.test(user.position)) {
        updates.position = 'Stakeholder';
      }
      
      // Update job title if it contains "service" or "provider"
      if (user.jobTitle && (/service/i.test(user.jobTitle) || /provider/i.test(user.jobTitle))) {
        updates.jobTitle = 'stakeholder';
      }

      if (Object.keys(updates).length > 0) {
        await User.updateOne({ _id: user._id }, { $set: updates });
        updatedCount++;
      }
    }

    console.log(`✅ Successfully updated ${updatedCount} user(s)\n`);

    // Display updated users
    const updatedUsers = await User.find({
      _id: { $in: usersToUpdate.map(u => u._id) }
    }).select('firstName lastName jobTitle position email');

    console.log('Updated users:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    updatedUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName} (${user.email})`);
      console.log(`   New Position: "${user.position}"`);
      console.log(`   New Job Title: "${user.jobTitle}"`);
      console.log('');
    });

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Migration completed successfully!\n');

    await mongoose.connection.close();
    console.log('Database connection closed.');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

run();
