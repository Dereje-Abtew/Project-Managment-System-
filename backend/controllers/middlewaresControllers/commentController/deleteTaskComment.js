const mongoose = require('mongoose');

/**
 * deleteTaskComment
 * DELETE /project/:id/task/:taskId/comment/:commentId
 *
 * Removes a comment from the task's comments[] array.
 *
 * req.params: { id, taskId, commentId }
 * req.user  : set by isValidToken middleware
 */
const deleteTaskComment = async (Model, req, res) => {
  try {
    const { id, taskId, commentId } = req.params;

    // First find the project to check the task exists
    const project = await Model.findOne({
      _id: mongoose.Types.ObjectId(id),
      removed: false,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.',
      });
    }

    const task = project.task.id(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found.',
      });
    }

    const comment = task.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found.',
      });
    }

    // Pull (remove) the comment from the task's comments array
    await Model.findOneAndUpdate(
      {
        _id: mongoose.Types.ObjectId(id),
        'task._id': mongoose.Types.ObjectId(taskId),
      },
      {
        $pull: { 'task.$.comments': { _id: mongoose.Types.ObjectId(commentId) } },
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      result: { _id: commentId },
      message: 'Comment deleted successfully.',
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = deleteTaskComment;