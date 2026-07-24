const mongoose = require('mongoose');
const User = mongoose.model('User');

const status = async (req, res) => {
  try {
    if (req.query.enabled === true || req.query.enabled === false) {
      let updates = {
        enabled: req.query.enabled,
      };

      const result = await User.findOneAndUpdate(
        { _id: req.params.id, removed: false },
        { $set: updates },
        {
          new: true,
        }
      )
        .select('-password')
        .exec();

      if (!result) {
        return res.status(404).json({
          success: false,
          //  result: null,
          message: 'There is no record found. Please try again!',
        });
      } else {
        return res.status(200).json({
          success: true,
          result,
          message: 'Successfully update status of this record by id: ' + req.params.id,
        });
      }
    } else {
      return res
        .status(202)
        .json({
          success: false,
          result: [],
          message: "couldn't change user status by this request",
        })
        .end();
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      //  result: null,
      message: 'Oops there is an Error',
    });
  }
};
module.exports = status;
