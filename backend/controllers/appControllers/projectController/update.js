const mongoose = require('mongoose');

const Model = mongoose.model('Project');

const { calculate } = require('@/utils/helpers');

const update = async (req, res) => {
  try {
    const { deliverables = [] } = req.body;

    if (deliverables.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Project deliverables cannot be empty',
      });
    }

    let totalWeight = 0;
    let totalCost = 0;

    for (const item of deliverables) {
      totalWeight = calculate.add(totalWeight, item.weight);
      totalCost = calculate.add(totalCost, item.cost || 0);
    }

    if (totalWeight !== 100) {
      return res.status(400).json({
        success: false,
        message: 'Sum of deliverable weight must be equal to 100.',
      });
    }

    if (totalCost !== parseInt(req.body.totalBudget)) {
      return res.status(400).json({
        success: false,
        message: `Sum of deliverable cost must be equal to project's total budget.`,
      });
    }

    let body = req.body;

    body['deliverablesWeight'] = totalWeight;
    body['deliverables'] = deliverables;

    const result = await Model.findOneAndUpdate({ _id: req.params.id, removed: false }, body, {
      new: true,
      runValidators: true,
    }).exec();

    return res.status(200).json({
      success: true,
      result,
      message: 'The record is updated successfully!',
    });
  } catch (err) {
    if (err.name == 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Required fields are not supplied',
      });
    } else {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
};
module.exports = update;