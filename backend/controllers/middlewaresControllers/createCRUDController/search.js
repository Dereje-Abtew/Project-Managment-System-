const search = async (Model, req, res) => {
  if (req.query.q === undefined || req.query.q.trim() === '') {
    return res
      .status(202)
      .json({
        success: false,
        result: [],
        message: 'There is no record found. Please try again!',
      })
      .end();
  }
  const fieldsArray = req.query.fields
    ? req.query.fields.split(',')
    : ['firstName', 'lastName', 'birthday'];

  const fields = { $or: [] };

  for (const field of fieldsArray) {
    fields.$or.push({ [field]: { $regex: new RegExp(req.query.q, 'i') } });
  }
  try {
    let results = await Model.find(fields).where('removed', false).select('-password').limit(10);

    if (results.length >= 1) {
      return res.status(200).json({
        success: true,
        result: results,
        message: 'Successfully found all records',
      });
    } else {
      return res
        .status(202)
        .json({
          success: false,
          result: [],
          message: 'There is no record found. Please try again!',
        })
        .end();
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

module.exports = search;
