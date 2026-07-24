const User = require('@/models/coreModels/User'); // Replace './models/User' with the path to your User model file
const Role = require('@/models/appModels/Role'); // Replace './models/User' with the path to your User model file
const Category = require('@/models/appModels/Category'); // Replace './models/User' with the path to your User model file

const summary = async (Model, req, res) => {
  const enabledUserCount = await User.countDocuments({ enabled: true });
  const disabledUserCount = await User.countDocuments({ enabled: false });
  const rolesCount = await Role.countDocuments();
  const categoriesCount = await Category.countDocuments();
  const result = { enabledUserCount, disabledUserCount, rolesCount, categoriesCount };
  return res.status(200).json({
    success: true,
    result,
    message: 'Successfully found summary of records.',
  });
};

module.exports = summary;
