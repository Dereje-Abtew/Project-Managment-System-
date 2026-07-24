const listAll = async (Model, req, res) => {
  const sort = parseInt(req.query.sort) || 'desc';

  try {
    const schemaName = Model.collection.name;
    let result = [];

    if (schemaName === 'projects') {
      result = await Model.aggregate([
        { $match: { removed: false } }, // Filter by 'removed' flag
        { $sort: { created: -1 } }, // Sort by 'created' field (ascending = 1 and descending =-1)
        {
          $lookup: {
            from: 'users', // Name of the referenced collection
            localField: 'teamLeader'  , // Field in the current collection
            foreignField: '_id', // Field in the referenced collection
            as: 'teamLeaderInfo', // Name for the joined data
          },
        },
        {
          $lookup: {
            from: 'users', // Name of the referenced collection
            localField: 'projectManager', // Field in the current collection
            foreignField: '_id', // Field in the referenced collection
            as: 'managerInfo', // Name for the joined data
          },
        },
        {
          $lookup: {
            from: 'users', // Name of the referenced collection
            localField: 'director', // Field in the current collection
            foreignField: '_id', // Field in the referenced collection
            as: 'directorInfo', // Name for the joined data
          },
        },
        {
          $lookup: {
            from: 'categories', // Name of the referenced collection
            localField: 'category', // Field in the current collection
            foreignField: '_id', // Field in the referenced collection
            as: 'categoryInfo', // Name for the joined data
          },
        },

        {
          $lookup: {
            from: 'users', // Name of the referenced collection
            localField: 'teamMember', // Field in the current collection
            foreignField: '_id', // Field in the referenced collection
            as: 'teamMemberInfo', // Name for the joined data
          },
        },
        {
          $lookup: {
            from: 'users', // Name of the referenced collection
            localField: 'qualityAssurance', // Field in the current collection
            foreignField: '_id', // Field in the referenced collection
            as: 'qualityAssuranceInfo', // Name for the joined data
          },
        },

        {
          $lookup: {
            from: 'categories', // Name of the referenced collection
            localField: 'category', // Field in the current collection
            foreignField: '_id', // Field in the referenced collection
            as: 'categoryInfo', // Name for the joined data
          },
        },

        {
          $project: {
            _id: 1,
            title: 1,
            description: 1,
            priority: 1,
            totalBudget: 1,
            startDate: 1,
            endDate: 1,
            projectNumber: 1,
            ownerContact: 1,
            ownerName: 1,
            methodology: 1,
            achievement: 1,
            status: 1,
            // Raw refs needed for client-side filtering by currentUserId
            teamLeader: 1,
            projectManager: 1,
            director: 1,
            teamMember: 1,
            qualityAssurance: 1,
            // Populated info for display
            'categoryInfo.categoryName': 1,
            'qualityAssuranceInfo._id': 1,
            'teamMemberInfo._id': 1,
            'teamLeaderInfo._id': 1,
            'teamLeaderInfo.firstName': 1,
            'teamLeaderInfo.lastName': 1,
            'managerInfo._id': 1,
            'managerInfo.firstName': 1,
            'managerInfo.lastName': 1,
            'directorInfo._id': 1,
            'directorInfo.firstName': 1,
            'directorInfo.lastName': 1,
            deliverablesCount: { $size: '$deliverables' },
            taskCount: { $size: '$task' },
            teamMemberCount: { $size: '$teamMember' },
            // Include task array (stage field only) so task completion count works
            task: { $map: { input: '$task', as: 't', in: { _id: '$$t._id', stage: '$$t.stage' } } },
          },
        },
      ]);

      // result = await Model.find({ removed: false }).sort({ created: sort }).populate();
    } else {
      await Model.find({ removed: false }).sort({ created: sort }).populate();
    }
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
