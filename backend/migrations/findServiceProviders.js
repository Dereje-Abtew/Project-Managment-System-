/**
 * Find users with "service" or "provider" in job title
 */

const mongoose = require('mongoose');
require('module-alias/register');
const User = require('@/models/coreModels/User');
const Role = require('@/models/appModels/Role');

require('dotenv').config({ path: './.env' });

const DATABASE_URL = process.env.DATABASE || 'mongodb://127.0.0.1:27017/globalbank';

async function run() {
  try {
    console.log('🔍 Finding users with service/provider in job title...\n');
    
    await mongoose.connect(DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB\n');

    // Find with more flexible regex
    const users = await User.find({
      $or: [
        { jobTitle: /service/i },
        { jobTitle: /provider/i }
      ],
      removed: false,
    }).select('firstName lastName jobTitle position email');

    console.log(`Found ${users.length} user(s)\n`);

    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Job Title: "${user.jobTitle}"`);
      console.log(`   Position: ${user.position || 'N/A'}`);
      console.log(`   User ID: ${user._id}`);
      console.log('');
    });

    await mongoose.connection.close();
    console.log('Done.');

  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

run();
