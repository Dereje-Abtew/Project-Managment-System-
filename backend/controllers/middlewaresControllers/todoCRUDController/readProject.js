const mongoose = require('mongoose');

const readProject = async (Model, req, res) => {
  try {
    const result = await Model.findOne(
      { _id: req.params.id, removed: false },
      {
        task: {
          $filter: {
            input: '$task',
            as: 'task',
            cond: { $eq: ['$$task.assignedStatus', 'active'] },
          },
        },
        title: 1,
        actualBudget: 1,
        totalBudget: 1,
        description: 1,
        ownerName: 1,
        ownerContact: 1,
        projectNumber: 1,
        methodology: 1,
        startDate: 1,
        endDate: 1,
        achievement: 1,
        priority: 1,
        status: 1,
        updated: 1,
        created: 1,
        deliverables: 1,
        risk: 1,
        issue: 1,
        comments: 1,
        // People — required by Task.js and ProjectDetailDrawer
        category: 1,
        director: 1,
        projectManager: 1,
        teamLeader: 1,
        teamMember: 1,
        qualityAssurance: 1,
        removedTeamMember: 1,
        removedQualityAssurance: 1,
      }
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'There is no record found. Please try again!',
      });
    }

    return res.status(200).json({
      success: true,
      result,
      message: 'The record is found by this id: ' + req.params.id,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = readProject;
