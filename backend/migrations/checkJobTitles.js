/**
 * Check Script: List all job titles in the database
 */

const mongoose = require('mongoose');
require('module-alias/register');
const User = require('@/models/coreModels/User');

// Load environment variables
require('dotenv').config({ path: './.env' });

const DATABASE_URL = process.env.DATABASE || 'mongodb://127.0.0.1:27017/globalbank';

async function run() {
  try {
    console.log('🔍 Checking Job Titles in Database...\n');
    
    // Connect to database
    await mongoose.connect(DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB\n');

    // Find all users with Stakeholder position
    const stakeholderUsers = await User.find({
      position: 'Stakeholder',
      removed: false,
    }).select('firstName lastName jobTitle position email');

    console.log(`Found ${stakeholderUsers.length} users with "Stakeholder" position\n`);

    if (stakeholderUsers.length === 0) {
      console.log('No stakeholder users found.\n');
    } else {
      console.log('Stakeholder Users:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      stakeholderUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.firstName} ${user.lastName}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Job Title: "${user.jobTitle}"`);
        console.log(`   Position: ${user.position}`);
        console.log('');
      });
    }

    // Also check all unique job titles in the system
    const allJobTitles = await User.distinct('jobTitle', { removed: false });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`\nAll unique job titles in database (${allJobTitles.length} total):\n`);
    allJobTitles.forEach((title, index) => {
      console.log(`${index + 1}. "${title}"`);
    });

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Close database connection
    await mongoose.connection.close();
    console.log('Database connection closed.');

  } catch (error) {
    console.error('❌ Check failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run the check
run();
