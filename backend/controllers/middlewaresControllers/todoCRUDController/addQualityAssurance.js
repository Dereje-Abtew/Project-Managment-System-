const mongoose = require('mongoose');
const User = mongoose.model('User');

const addQualityAssurance = async (Model, req, res) => {
  try {
    let oldResult = await Model.find({
      _id: mongoose.Types.ObjectId(req.params.id),
      removed: false,
    });

    const qualityAssuranceId = mongoose.Types.ObjectId(req.body.qualityAssurance);

    const qualityAssuranceExists = await Model.exists({
      _id: mongoose.Types.ObjectId(req.params.id),
      qualityAssurance: qualityAssuranceId,
    });
    if (qualityAssuranceExists) {
      return res.status(500).json({
        success: false,
        data: null,
        message: 'Quality Assurance already exists in the team!',
      });
    }

    const result = await Model.updateOne(
      { _id: mongoose.Types.ObjectId(req.params.id) },
      {
        $addToSet: { qualityAssurance: qualityAssuranceId },
        $pull: { removedQualityAssurance: qualityAssuranceId },
      }
    );

    if (result) {
      const addedQA = await User.findOne({ _id: qualityAssuranceId })
        .select('email firstName lastName _id jobTitle')
        .lean()
        .exec();

      return res.status(200).json({
        success: true,
        result: addedQA,
        message: 'Quality Assurance added to the project successfully!',
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
        message: 'Oops there is an Error',

        // error: err,
      });
    }
  }
};

module.exports = addQualityAssurance;
