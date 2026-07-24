require('dotenv').config({ path: __dirname + '/../.env' });

const mongoose = require('mongoose');
mongoose.set('strictQuery', false);
mongoose.connect(process.env.DATABASE);
mongoose.Promise = global.Promise;

async function deleteData() {
  const User       = require('../models/coreModels/User');
  const Permission = require('../models/appModels/Permission');
  const Role       = require('../models/appModels/Role');
  const Resource   = require('../models/appModels/Resource');

  await User.remove();
  console.log('✅ User data is successfully removed!');

  await Permission.remove();
  console.log('✅ Permission data is successfully removed!');

  await Role.remove();
  console.log('✅ Role data is successfully removed!');

  await Resource.remove();
  console.log('✅ Resource data is successfully removed!');

  console.log('✅ To setup data again  → run, \t  npm run setup');
  process.exit();
}

deleteData();
