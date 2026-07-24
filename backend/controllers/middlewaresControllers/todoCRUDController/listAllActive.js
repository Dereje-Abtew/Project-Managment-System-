const listAll = async (Model, req, res) => {
  const sort = parseInt(req.query.sort) || 'desc';

  try {
    const result = await Model.aggregate([
      { $match: { removed: false, status: 'onGoing' } }, // Filter by 'removed' flag
      { $sort: { created: -1 } }, // Sort by 'created' field (ascending = 1 and descending =-1)
      {
        $lookup: {
          from: 'users', // Name of the referenced collection
          localField: 'projectManager' , // Field in the current collection
          foreignField: '_id', // Field in the referenced collection
          as: 'teamLeaderInfo', // Name for the joined data
        },
      },
      {
        $project: {
          _id: 0,

          title: 1,
          methodology: 1,
          achievement: 1,
          'teamLeaderInfo.firstName': 1, // Include specific fields from the referenced collection
          'teamLeaderInfo.lastName': 1,
          deliverablesCount: { $size: '$deliverables' }, // Calculate deliverables count (assuming tasks field is 'deliverables')
          taskCount: { $size: '$task' }, // Calculate task count (assuming tasks field is 'task')
          teamMemberCount: { $size: '$teamMember' }, // Calculate teamMember count (assuming tasks field is 'teamMember')
          task: {
            weight: 1,
            actual: 1,
            stage: 1,
          },
          status: 1,
        },
      },
    ]);

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

      message: err.message,
      // error: err,
    });
  }
};

module.exports = listAll;
