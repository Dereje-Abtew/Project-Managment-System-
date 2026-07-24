const mongoose = require('mongoose');
const update = async (Model, req, res) => {
  try {
    const issueId = mongoose.Types.ObjectId(req.params.issueId);

    const result = await Model.findOneAndUpdate(
      {
        _id: mongoose.Types.ObjectId(req.params.id),
        issue: {
          $elemMatch: { _id: issueId },
        },
      },
      {
        $set: {
          'issue.$.title': req.body.title,
          'issue.$.description': req.body.description,
          'issue.$.risk': req.body.risk,
          'issue.$.task': req.body.task,
          'issue.$.registeredBy': req.body.registeredBy,
          'issue.$.assignedTo': req.body.assignedTo,
          'issue.$.status': req.body.status,
          'issue.$.startDate': req.body.startDate,
          'issue.$.endDate': req.body.endDate,
        },
      },
      {
        new: true,
      }
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        //  result: null,
        message: 'There is no record found. Please try again!',
      });
    } else {
      const updatedIssue = result.issue.find(
        (issue) => issue._id.toString() === req.params.issueId.toString()
      );

      return res.status(200).json({
        success: true,
        result: updatedIssue,
        message: 'The record is updated successfully!',
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

module.exports = update;
