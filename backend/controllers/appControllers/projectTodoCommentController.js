const mongoose = require('mongoose');
const addTaskComment = require('@/controllers/middlewaresControllers/commentController/addTaskComment');
const deleteTaskComment = require('@/controllers/middlewaresControllers/commentController/deleteTaskComment');

const Model = mongoose.model('Project');

module.exports = {
  // POST /project/:id/task/:taskId/comment
  add: (req, res) => addTaskComment(Model, req, res),

  // DELETE /project/:id/task/:taskId/comment/:commentId
  remove: (req, res) => deleteTaskComment(Model, req, res),
};