const mongoose = require('mongoose');

const Model = mongoose.model('Project');

const { calculate } = require('@/utils/helpers');

const create = async (req, res) => {
  try {
    const existingProject = await Model.find({ title: req.body.title }).exec();
    if (existingProject.length > 0) {
      return res.status(500).json({
        success: false,
        //  result: null,
        message: 'Project with this title is already registered. Please try again.',
      });
    }

    const projectStartDate = new Date(req.body.startDate);
    const projectEndDate = new Date(req.body.endDate);

    if (projectStartDate >= projectEndDate) {
      return res.status(500).json({
        success: false,
        //  result: null,
        message: 'Project end date must be greater than start date. Please try again.',
      });
    }

    const { deliverables = [] } = req.body;
    let totalWeight = 0;
    let totalCost = 0;

    const isConsecutive = () => {
      for (let i = 0; i < deliverables.length - 1; i++) {
        const currentDeliverable = deliverables[i];
        const nextDeliverable = deliverables[i + 1];

        const currentEndDate = new Date(currentDeliverable.endDate);
        const nextStartDate = new Date(nextDeliverable.startDate);

        if (currentEndDate >= nextStartDate) {
          return false;
        }
      }

      return true;
    };

    for (let i = 0; i < deliverables.length; i++) {
      const item = deliverables[i];
      const startDate = new Date(item.startDate);
      const endDate = new Date(item.endDate);

      if (startDate > projectEndDate || startDate < projectStartDate) {
        return res.status(500).json({
          success: false,
          //  result: null,
          message: `Deliverable start date is not between project's duration in row ${
            i + 1
          } . Please try again.`,
        });
      }

      if (endDate > projectEndDate || endDate < projectStartDate) {
        return res.status(500).json({
          success: false,
          //  result: null,
          message: `Deliverable end date is not between project's duration in row ${
            i + 1
          }. Please try again.`,
        });
      }

      if (new Date(item.startDate) >= new Date(item.endDate)) {
        return res.status(500).json({
          success: false,
          //  result: null,
          message: `Deliverable end date must be greater than start date in row ${
            i + 1
          } . Please try again.`,
        });
      }
      totalWeight = calculate.add(totalWeight, item.weight);
      totalCost = calculate.add(totalCost, item.cost);
    }
    if (totalCost !== parseInt(req.body.totalBudget)) {
      return res.status(500).json({
        success: false,
        //  result: null,
        message: `Sum of deliverable cost must be equal to project's total budget.`,
      });
    }
    if (totalWeight !== 100) {
      return res.status(500).json({
        success: false,
        //  result: null,
        message: 'Sum of deliverable weight must be equal to 100.',
      });
    }
    let body = req.body;

    body['deliverablesWeight'] = totalWeight;
    body['deliverables'] = deliverables;

    const result = await new Model(body).save();
    const updateResult = await Model.findOneAndUpdate(
      { _id: result._id },
      {
        new: true,
      }
    ).exec();

    return res.status(200).json({
      success: true,
      result: updateResult,
      message: 'Project is created successfully!',
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      // Human-friendly labels for each field in the Project model
      const fieldLabels = {
        title: 'Project Title',
        category: 'Project Category',
        description: 'Description',
        projectNumber: 'Project Number',
        ownerName: 'Owner Name',
        ownerContact: 'Owner Contact',
        director: 'Director',
        projectManager: 'Project Manager',
        teamLeader: 'Team Leader',
        teamMember: 'Team Member',
        methodology: 'Methodology',
        totalBudget: 'Total Budget',
        status: 'Status',
        priority: 'Priority',
        startDate: 'Start Date',
        endDate: 'End Date',
      };

      const fields = {};
      const messages = [];
      for (const [field, error] of Object.entries(err.errors)) {
        const label = fieldLabels[field] || field;
        const msg = `${label} is required.`;
        fields[field] = msg;
        messages.push(msg);
      }
      return res.status(400).json({
        success: false,
        fields,
        message: messages.join('; '),
      });
    } else {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
};
module.exports = create;
