const mongoose = require('mongoose');

/**
 * addComment
 * POST /project/:id/comment
 *
 * Pushes a new comment into the project's comments[] array.
 * The logged-in user is stored as postedBy.
 *
 * req.body  : { message }
 * req.params: { id }        → project _id
 * req.user  : set by isValidToken middleware
 */
const addComment = async (Model, req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Comment message cannot be empty.',
      });
    }

    const result = await Model.findOneAndUpdate(
      { _id: mongoose.Types.ObjectId(req.params.id), removed: false },
      {
        $push: {
          comments: {
            message: message.trim(),
            postedBy: req.user._id,
          },
        },
      },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.',
      });
    }

    // Return only the newly added comment (last one in the array)
    const newComment = result.comments[result.comments.length - 1];

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

module.exports = addComment;
