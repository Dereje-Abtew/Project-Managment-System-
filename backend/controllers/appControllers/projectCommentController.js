const mongoose = require('mongoose');
const addComment = require('@/controllers/middlewaresControllers/commentController/addComment');
const deleteComment = require('@/controllers/middlewaresControllers/commentController/deleteComment');

const Model = mongoose.model('Project');

module.exports = {
  // POST /project/:id/comment
  add: (req, res) => addComment(Model, req, res),

  // DELETE /project/:id/comment/:commentId
  remove: (req, res) => deleteComment(Model, req, res),
};
