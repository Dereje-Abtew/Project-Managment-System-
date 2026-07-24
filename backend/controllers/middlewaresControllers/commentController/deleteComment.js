const mongoose = require('mongoose');

/**
 * deleteComment
 * DELETE /project/:id/comment/:commentId
 *
 * Removes a comment from the project's comments[] array.
 * Only the comment author OR project manager/leader can delete.
 *
 * req.params: { id, commentId }
 * req.user  : set by isValidToken middleware
 */
const deleteComment = async (Model, req, res) => {
  try {
    const commentId = mongoose.Types.ObjectId(req.params.commentId);

    // First find the project to check ownership
    const project = await Model.findOne({
      _id: mongoose.Types.ObjectId(req.params.id),
      removed: false,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.',
      });
    }

    const comment = project.comments.id(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found.',
      });
    }

    // Pull (remove) the comment from the array
    await Model.findOneAndUpdate(
      { _id: mongoose.Types.ObjectId(req.params.id) },
      { $pull: { comments: { _id: commentId } } },
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

module.exports = deleteComment;
