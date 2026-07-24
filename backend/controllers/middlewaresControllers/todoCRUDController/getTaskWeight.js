const mongoose = require('mongoose');

/**
 * Returns remaining deliverable weight that can be assigned to new tasks.
 * Excludes the task being updated (by taskId) from the total.
 */
const getTaskWeightByTaskId = async (projectId, taskId, Model) => {
  const oldResult = await Model.find(
    { _id: mongoose.Types.ObjectId(projectId), removed: false },
    {
      task: {
        $filter: {
          input: '$task',
          as: 'task',
          cond: {
            $not: { $eq: ['$$task._id', mongoose.Types.ObjectId(taskId)] },
          },
        },
      },
    }
  );

  if (!oldResult || oldResult.length === 0) return 100;

  const totalWeight = oldResult[0].task.reduce(
    (acc, obj) => acc + parseInt(obj.weight || 0),
    0
  );

  return 100 - totalWeight;
};

/**
 * Returns total remaining weight available across all tasks of a project.
 * Pass Model explicitly to avoid undefined reference.
 */
const getTaskWeight = async (projectId, Model) => {
  const oldResult = await Model.find({
    _id: mongoose.Types.ObjectId(projectId),
    removed: false,
  });

  if (!oldResult || oldResult.length === 0) return 100;

  const totalWeight = oldResult[0].task.reduce(
    (acc, obj) => acc + parseInt(obj.weight || 0),
    0
  );

  return 100 - totalWeight;
};

module.exports = { getTaskWeightByTaskId, getTaskWeight };
