const listAll = async (Model, req, res) => {
  const sort = parseInt(req.query.sort) || 'desc';
  try {
    const result = await Model.find({ removed: false })
      .sort({ created: sort })
      .select('-password')
      .populate();

    if (result.length > 0) {
      return res.status(200).json({
        success: true,
        result,
        message: 'Successfully found all records',
      });
    } else {
      return res.status(203).json({
        success: true,
        result: [],
        message: 'Collection is Empty',
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      result: [],
      message: 'Oops there is an Error',
      // error: err,
    });
  }
};

module.exports = listAll;
