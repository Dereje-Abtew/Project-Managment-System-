const mongoose = require('mongoose');

const read = async (Model, req, res) => {
  try {
    let result = await Model.find(
      { _id: mongoose.Types.ObjectId(req.params.id), removed: false },
      {
        task: {
          $filter: {
            input: '$task',
            as: 'task',
            cond: {
              $in: ['$$task._id', [mongoose.Types.ObjectId(req.params.taskId)]],
            },
          },
        },
      }
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        //  result: null,
        message: 'There is no record found. Please try again!',
      });
    } else {
      const updatedTask = result[0].task.find(
        (task) => task._id.toString() === req.params.taskId.toString()
      );

      return res.status(200).json({
        success: true,
        result: updatedTask,
        message: 'The record is found by this id: ' + req.params.id,
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      //  result: null,
      message: err.message,
      // error: err,
    });
  }
};

module.exports = read;
