const { model } = require('mongoose');

const paginatedList = async (Model, req, res) => {
  const page = req.query.page || 1;
  const limit = parseInt(req.query.items) || 10;
  const skip = page * limit - limit;

  const schemaName = Model.collection.name;
  const sortType = schemaName === 'users' ? 'asc' : 'desc';

  try {
    const resultsPromise = Model.find({ removed: false })
      .skip(skip)
      .limit(limit)
      .sort({ created: sortType })
      .select('-password')
      .populate();

    const countPromise = Model.count({ removed: false });

    const [result, count] = await Promise.all([resultsPromise, countPromise]);

    const pages = Math.ceil(count / limit);

    const pagination = { page, pages, count };

    if (count > 0) {
      return res.status(200).json({
        success: true,
        result,
        pagination,
        message: 'Successfully found all records',
      });
    } else {
      return res.status(203).json({
        success: true,
        result: [],
        pagination,
        message: 'Collection is Empty',
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      result: [],
      message: err.message,

      // error: err,
    });
  }
};

module.exports = paginatedList;
