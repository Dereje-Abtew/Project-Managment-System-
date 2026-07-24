const mongoose = require('mongoose');
const User = mongoose.model('User');

const removeMember = async (Model, req, res) => {
  try {
    const memberId = mongoose.Types.ObjectId(req.params.memberId);
    const result = await Model.updateOne(
      { _id: mongoose.Types.ObjectId(req.params.id) },
      { $pull: { teamMember: memberId }, $push: { removedTeamMember: memberId } }
    );
    if (result) {
      const removedMember = await User.findOne({ _id: memberId }).select('_id').lean().exec();

      return res.status(200).json({
        success: true,
        result: removedMember,
        message: 'User removed from the project successfully!',
      });
    } else {
      return res.status(400).json({
        success: false,
        //  result: null,
        message: 'Something went wrong. Please try again!',
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

module.exports = removeMember;
