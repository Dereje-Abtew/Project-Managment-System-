const mongoose = require('mongoose');

const Model = mongoose.model('Role');

const update = async (req, res) => {
  try {
    let body = req.body;

    const result = await Model.findOneAndUpdate({ _id: req.params.id, removed: false }, body, {
      new: true,
    }).exec();

    return res.status(200).json({
      success: true,
      result,
      message: 'The record is updated successfully!',
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
        message: 'Oops there is an Error',
      });
    }
  }
};
module.exports = update;
