const mongoose = require('mongoose');

const remove = async (Model, req, res) => {
  try {
    const result = await Model.findOneAndUpdate(
      { _id: mongoose.Types.ObjectId(req.params.id) },
      { $pull: { issue: { _id: mongoose.Types.ObjectId(req.params.issueId) } } },
      { new: true }
    );
    if (!result) {
      return res.status(404).json({
        success: false,
        //  result: null,
        message: 'There is no record found. Please try again!',
      });
    } else {
      const removedIssue = { _id: req.params.issueId };

      return res.status(200).json({
        success: true,
        result: removedIssue,
        message: 'You have successfully deleted the issue.',
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      //  result: null,
      message: err.message,
      // error: err,
    });
  }
};

module.exports = remove;
