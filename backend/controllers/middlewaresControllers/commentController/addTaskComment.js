const mongoose = require('mongoose');

/**
 * addTaskComment
 * POST /project/:id/task/:taskId/comment
 *
 * Pushes a new comment into the task's comments[] array.
 * The logged-in user is stored as postedBy.
 *
 * req.body  : { message }
 * req.params: { id, taskId }
 * req.user  : set by isValidToken middleware
 */
const addTaskComment = async (Model, req, res) => {
  try {
    const { message } = req.body;
    const { id, taskId } = req.params;

    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Comment message cannot be empty.',
      });
    }

    const comment = {
      message: message.trim(),
      postedBy: req.user._id,
    };

    const result = await Model.findOneAndUpdate(
      {
        _id: mongoose.Types.ObjectId(id),
        removed: false,
        'task._id': mongoose.Types.ObjectId(taskId),
      },
      {
        $push: { 'task.$.comments': comment },
      },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Project or task not found.',
      });
    }

    // Find the task and return only the newly added comment (last one in the array)
    const updatedTask = result.task.id(taskId);
    const newComment = updatedTask.comments[updatedTask.comments.length - 1];

    return res.status(200).json({
      success: true,
      result: newComment,
      message: 'Comment added successfully.',
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = addTaskComment;