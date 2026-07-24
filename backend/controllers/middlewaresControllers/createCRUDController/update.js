const User = require('../../../models/coreModels/User');

const update = async (Model, req, res) => {
  try {
    if (Model.collection.name === 'users' && req.body.password) {
      const newUser = new User();
      req.body.password = newUser.generateHash(req.body.password);
    }

    const result = await Model.findOneAndUpdate({ _id: req.params.id, removed: false }, req.body, {
      new: true,
      runValidators: true,
    })
      .select('-password')
      .exec();
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'There is no record found. Please try again!',
      });
    } else {
      return res.status(200).json({
        success: true,
        result,
        message: 'The record is updated successfully!',
      });
    }
  } catch (err) {
    if (err.name === 'ValidationError') {
      const fields = Object.keys(err.errors || {}).reduce((acc, key) => {
        acc[key] = err.errors[key].message;
        return acc;
      }, {});
      return res.status(400).json({
        success: false,
        message: 'Validation failed. Please check required fields.',
        fields,
      });
    }

    if (err.code === 11000) {
      const duplicatedFields = Object.keys(err.keyValue || {}).join(', ');
      return res.status(400).json({
        success: false,
        message: `Duplicate value found for: ${duplicatedFields}`,
      });
    }

    return res.status(500).json({
      success: false,
      message: err.message || 'Oops there is an Error',
    });
  }
};

module.exports = update;
