const listAll = require('@/controllers/middlewaresControllers/createCRUDController/listAll');
const signatureGenerator = require('@/utils/hashSignature');
const express = require('express');
const mongoose = require('mongoose');

const Model = mongoose.model('Project');

const project = express.Router();
project.post('/projects', async function (request, response) {
  const { _1, _2 } = request.body;
  const signature = signatureGenerator.CreateSignature(_2);
  if (signature !== _1) {
    return response.status(401).json({
      success: false,
      result: null,
      message: 'You are not authorized to access this resource.',
    });
  }

  try {
    const result = await Model.aggregate([
      { $match: { removed: false } },
      { $sort: { created: 1 } },
      {
        $lookup: {
          from: 'users',
          localField: 'projectManager',
          foreignField: '_id',
          as: 'teamLeaderInfo',
        },
      },
      // Only include projects where teamLeaderInfo resolved correctly
      { $match: { 'teamLeaderInfo.0': { $exists: true } } },
      {
        $project: {
          _id: 0,
          title: 1,
          methodology: 1,
          achievement: 1,
          status: 1,
          'teamLeaderInfo.firstName': 1,
          'teamLeaderInfo.lastName': 1,
          deliverablesCount: { $size: '$deliverables' },
          taskCount: { $size: '$task' },
          teamMemberCount: { $size: '$teamMember' },
          task: { weight: 1, actual: 1, stage: 1 },
        },
      },
    ]);

    if (result.length > 0) {
      return response.status(200).json({
        success: true,
        result,
        message: 'Successfully found all records',
      });
    } else {
      return response.status(203).json({
        success: true,
        result: [],
        message: 'Collection is Empty',
      });
    }
  } catch (err) {
    return response.status(500).json({
      success: false,
      result: [],
      message: 'Oops there is an Error',
      error: err.message,
    });
  }
});

module.exports = project;
