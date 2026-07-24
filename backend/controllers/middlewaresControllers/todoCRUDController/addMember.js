const mongoose = require('mongoose');
const User = mongoose.model('User');

const addMember = async (Model, req, res) => {
  try {
    let oldResult = await Model.find({
      _id: mongoose.Types.ObjectId(req.params.id),
      removed: false,
    });

    const memberId = mongoose.Types.ObjectId(req.body.teamMember);

    const memberExists = await Model.exists({
      _id: mongoose.Types.ObjectId(req.params.id),
      teamMember: memberId,
    });
    if (memberExists) {
      return res.status(500).json({
        success: false,
        result: null,
        message: 'Member already exists in the team!',
      });
    }
    const result = await Model.updateOne(
      { _id: mongoose.Types.ObjectId(req.params.id) },
      { $addToSet: { teamMember: memberId }, $pull: { removedTeamMember: memberId } }
    );
    if (result) {
      const addedMember = await User.findOne({ _id: memberId })
        .select('email firstName lastName _id jobTitle')
        .lean()
        .exec();

      return res.status(200).json({
        success: true,
        result: addedMember,
        message: 'User added to the project successfully!',
      });
    } else {
      return res.status(500).json({
        success: false,
        result: null,
        message: 'Something went wrong!',
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

module.exports = addMember;
