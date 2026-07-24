const mongoose = require('mongoose');

const Model = mongoose.model('Role');

const create = async (req, res) => {
  try {
    const existingRole = await Model.find({ name: req.body.name }).exec();
    if (existingRole.length > 0) {
      return res.status(500).json({
        success: false,
        //  result: null,
        message: 'Role with this name is already registered. Please try again.',
      });
    }

    const result = await new Model(req.body).save();
    const updateResult = await Model.findOneAndUpdate(
      { _id: result._id },
      {
        new: true,
      }
    ).exec();

    return res.status(200).json({
      success: true,
      result: updateResult,
      message: 'Role is created successfully!',
    });
  } catch (err) {
    if (err.name == 'ValidationError') {
      return res.status(400).json({
        success: false,
        //  result: null,
        message: 'Required fields are not supplied',
      });
    } else {
      return res.status(500).json({
        success: false,
        //  result: null,

        message: err.message,
      });
    }
  }
};
module.exports = create;
