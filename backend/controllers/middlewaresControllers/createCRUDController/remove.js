const remove = async (Model, req, res) => {
  try {
    let updates = {
      removed: true,
    };

    const result = await Model.findOneAndUpdate(
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
        message: 'You have successfully deleted the record.',
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      //  result: null,
      message: 's there is an Error',
      // error: err,
    });
  }
};

module.exports = remove;
