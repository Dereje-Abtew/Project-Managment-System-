/**
 * Migration Script: Update Job Titles from "Service Provider" to "Stakeholder"
 * 
 * This script updates the jobTitle field for all users where it contains
 * "service provider" or "services provider" to "stakeholder"
 */

const mongoose = require('mongoose');
require('module-alias/register');
const User = require('@/models/coreModels/User');

// Load environment variables
require('dotenv').config({ path: './.env' });

const DATABASE_URL = process.env.DATABASE || 'mongodb://127.0.0.1:27017/globalbank';

async function run() {
  try {
    console.log('🚀 Starting Job Title Update Migration...\n');
    
    // Connect to database
    await mongoose.connect(DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB\n');

    // Find all users with "service provider" or "services provider" in job title (case-insensitive)
    const usersToUpdate = await User.find({
      jobTitle: { $regex: /service\s*provider/i },
      removed: false,
    });

    console.log(`Found ${usersToUpdate.length} users with "service provider" in job title\n`);

    if (usersToUpdate.length === 0) {
      console.log('✅ No users found with "service provider" in job title. Nothing to update.\n');
      await mongoose.connection.close();
      return;
    }

    // Display users that will be updated
    console.log('Users to be updated:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    usersToUpdate.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName}`);
      console.log(`   Current Job Title: "${user.jobTitle}"`);
      console.log(`   Position: ${user.position || 'N/A'}`);
      console.log('');
    });

    // Perform the update
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Updating job titles...\n');

    const result = await User.updateMany(
      { 
        jobTitle: { $regex: /service\s*provider/i },
        removed: false,
      },
      { 
        $set: { jobTitle: 'stakeholder' }
      }
    );

    console.log(`✅ Successfully updated ${result.modifiedCount} user job titles\n`);

    // Display updated users
    const updatedUsers = await User.find({
      _id: { $in: usersToUpdate.map(u => u._id) }
    });

    console.log('Updated users:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    updatedUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName}`);
      console.log(`   New Job Title: "${user.jobTitle}"`);
      console.log(`   Position: ${user.position || 'N/A'}`);
      console.log('');
    });

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Migration completed successfully!\n');

    // Close database connection
    await mongoose.connection.close();
    console.log('Database connection closed.');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run the migration
run();
