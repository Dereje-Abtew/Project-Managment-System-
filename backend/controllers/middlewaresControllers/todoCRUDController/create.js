const mongoose = require('mongoose');

const create = async (Model, req, res) => {
  try {
    const deliverableId = mongoose.Types.ObjectId(req.body.deliverable);
    const oldResult = await Model.findOne(
      {
        _id: req.params.id,
        removed: false,
      },
      {
        task: {
          $filter: {
            input: '$task',
            as: 'task',
            cond: {
              $and: [
                { $eq: ['$$task.assignedStatus', 'active'] },
                { $eq: ['$$task.deliverable', deliverableId] },
              ],
            },
          },
        },
      },
      {
        $project: {},
      }
    );

    let deliverableResult = await Model.aggregate([
      {
        $match: {
          _id: mongoose.Types.ObjectId(req.params.id),
          removed: false,
        },
      },
      {
        $project: {
          deliverables: {
            $filter: {
              input: '$deliverables',
              as: 'deliverable',
              cond: { $eq: ['$$deliverable._id', deliverableId] },
            },
          },
        },
      },
    ]);
    const taskDeliverable = deliverableResult[0].deliverables[0];

    const submissionDate = req.body.submissionDate;
    const assignedDate = req.body.assignedDate;
    if (new Date(submissionDate) < new Date(assignedDate)) {
      return res.status(400).json({
        success: false,
        //  result: null,
        message: `Task submission date should be greater than it's start date.`,
      });
    }

    if (req.body.dependOnTask !== undefined) {
      const dependOnTask = mongoose.Types.ObjectId(req.body.dependOnTask);
      let taskResult = await Model.aggregate([
        {
          $match: {
            _id: mongoose.Types.ObjectId(req.params.id),
            removed: false,
          },
        },
        {
          $project: {
            task: {
              $filter: {
                input: '$task',
                as: 'task',
                cond: { $eq: ['$$task._id', dependOnTask] },
              },
            },
          },
        },
      ]);
      if (new Date(req.body.assignedDate) < new Date(taskResult[0].task[0].submissionDate)) {
        return res.status(400).json({
          success: false,
          //  result: null,
          message: `Task start date should be greater than it's dependent task submission date(${taskResult[0].task[0].submissionDate})`,
        });
      }
      if (new Date(req.body.assignedDate) > new Date(req.body.submissionDate)) {
        return res.status(400).json({
          success: false,
          //  result: null,
          message: `Task start date should be less than it's submission date(${req.body.submissionDate})`,
        });
      }
    }
    if (new Date(submissionDate) < new Date(taskDeliverable.startDate)) {
      return res.status(400).json({
        success: false,
        //  result: null,
        message: `Task submission date should be greater than deliverable's start date(${taskDeliverable.startDate})`,
      });
    }
    if (new Date(submissionDate) > new Date(taskDeliverable.endDate)) {
      return res.status(400).json({
        success: false,
        //  result: null,
        message: `Task submission date should be less than deliverable's end date(${taskDeliverable.endDate})`,
      });
    }
    if (oldResult.task.length > 0) {
      var totalWeight = oldResult.task.reduce(function (accumulator, obj) {
        return accumulator + parseInt(obj.weight);
      }, 0);

      const remainingWeight = parseInt(taskDeliverable.weight) - totalWeight;
      if (parseInt(req.body.weight) > remainingWeight) {
        return res.status(400).json({
          success: false,
          //  result: null,
          message: 'Task weight can not be greater than ' + remainingWeight,
        });
      }
    } else {
      if (parseInt(req.body.weight) > parseInt(taskDeliverable.weight)) {
        return res.status(400).json({
          success: false,
          //  result: null,
          message:
            'Task weight can not be greater than deliverable weight(' +
            taskDeliverable.weight +
            ').',
        });
      }
    }

    const [{ task }] = await Model.find(
      { _id: mongoose.Types.ObjectId(req.params.id) },
      { 'task.index': 1 }
    ).sort({ 'task.index': 1 });

    let countTaskLength = [
      task.length,
      task.length > 0 ? Math.max(...task.map((o) => o.index)) : task.length,
    ];
    const result = await Model.findOneAndUpdate(
      { _id: mongoose.Types.ObjectId(req.params.id) },
      {
        $push: {
          task: {
            title: req.body.title,
            remark: req.body.remark || '',
            description: req.body.description,
            deliverable: req.body.deliverable,
            assignedBy: req.body.assignedBy || req.body.assignedTo,
            assignedTo: req.body.assignedTo,
            assuredBy: req.body.assuredBy,
            submissionDate: req.body.submissionDate,
            assignedDate: req.body.assignedDate,
            dependOnTask: req.body.dependOnTask,
            weight: req.body.weight,
            cost: req.body.cost,
            actualCost: req.body.actualCost || 0,
            actual: req.body.actual || 0,
            stage: req.body.stage || 'Backlog',
            priority: req.body.priority || 'medium',
            assignedStatus: 'active',
            order: countTaskLength[0],
            index: countTaskLength[1] + 1,
          },
        },
      },
      {
        new: true,
      }
    );

    const newlyAddedtask = result.task[result.task.length - 1];

    return res.status(200).json({
      success: true,
      result: newlyAddedtask,
      message: 'You have successfully inserted the record.',
    });
  } catch (err) {
    if (err.name == 'ValidationError') {
      return res.status(400).json({
        success: false,
        //  result: null,
        message: 'Required fields are not supplied',
        // error: err,
      });
    } else {
      return res.status(500).json({
        success: false,
        //  result: null,

        message: err.message,
        // error: err,
      });
    }
  }
};

module.exports = create;
