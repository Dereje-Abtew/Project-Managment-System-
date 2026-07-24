const mongoose = require('mongoose');

const create = async (Model, req, res) => {
  try {
    const result = await Model.findOneAndUpdate(
      { _id: mongoose.Types.ObjectId(req.params.id) },
      {
        $push: {
          issue: {
            ...req.body,
          },
        },
      },
      { new: true }
    );
    if (result) {
      const newlyAddedIssue = result.issue[result.issue.length - 1];

      return res.status(200).json({
        success: true,
        result: newlyAddedIssue,
        message: 'Successfully created the issue.',
      });
    }
  } catch (err) {
    if (err.name == 'ValidationError') {
      return res.status(400).json({
        success: false,
        //  result: null,
        message: 'Required fields are not supplied',
        // error: err,
      });
    } else {
      return res.status(500).json({
        success: false,
        //  result: null,

        message: err.message,
        // error: err,
      });
    }
  }
};

module.exports = create;
