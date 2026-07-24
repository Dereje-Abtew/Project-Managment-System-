const mongoose = require('mongoose');

const remove = async (Model, req, res) => {
  try {
    const result = await Model.updateOne(
      { _id: mongoose.Types.ObjectId(req.params.id) },
      { $pull: { task: { _id: mongoose.Types.ObjectId(req.params.taskId) } } }
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        //  result: null,
        message: 'There is no record found. Please try again!',
      });
    } else {
      return res.status(200).json({
        success: true,
        result: req.params.taskId,
        message: 'You have successfully deleted the record.',
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      //  result: null,
      message: 'Oops there is an Error',
      // error: err,
    });
  }
};

module.exports = remove;
