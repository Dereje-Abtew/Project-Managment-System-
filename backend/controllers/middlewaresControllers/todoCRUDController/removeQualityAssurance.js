const mongoose = require('mongoose');
const User = mongoose.model('User');

const removeQualityAssurance = async (Model, req, res) => {
  try {
    const qualityAssuranceId = mongoose.Types.ObjectId(req.params.qualityAssuranceId);
    const result = await Model.updateOne(
      { _id: mongoose.Types.ObjectId(req.params.id) },
      {
        $pull: { qualityAssurance: qualityAssuranceId },
        $push: { removedQualityAssurance: qualityAssuranceId },
      }
    );

    if (result) {
      const removedQA = await User.findOne({ _id: qualityAssuranceId }).select('_id').lean().exec();

      return res.status(200).json({
        success: true,
        result: removedQA,
        message: 'Quality Assurance removed from the project successfully!',
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

module.exports = removeQualityAssurance;
