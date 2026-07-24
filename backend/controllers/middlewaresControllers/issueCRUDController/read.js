const mongoose = require('mongoose');

const read = async (Model, req, res) => {
  try {
    let result = await Model.find(
      { _id: mongoose.Types.ObjectId(req.params.id), removed: false },
      {
        issue: {
          $filter: {
            input: '$issue',
            as: 'issue',
            cond: {
              $in: ['$$issue._id', [mongoose.Types.ObjectId(req.params.issueId)]],
            },
          },
        },
      }
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        //  result: null,
        message: 'There is no issue found. Please try again!',
      });
    } else {
      return res.status(200).json({
        success: true,
        result,
        message: 'Successfully found the issue.',
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

module.exports = read;
