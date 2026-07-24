const mongoose = require('mongoose');

const reorder = async (Model, req, res) => {
  try {
    let task = [];

    // Build list of {_id, stage} from column entries — skip non-column metadata keys
    for (const key in req.body) {
      if (key === 'effectOnWeight' || key === 'weightToBeChanged') continue;
      const column = req.body[key];
      if (!column || !Array.isArray(column.items)) continue;
      for (const index in column.items) {
        column.items[index].stage = column.name;
        task.push({
          _id: column.items[index]._id,
          stage: column.items[index].stage,
        });
      }
    }

    // Await all stage updates before computing achievement
    // For tasks being moved to 'Completed', also set actual = weight (QA confirmation)
    await Promise.all(
      task.map(async (item) => {
        const updateOp = { $set: { 'task.$.stage': item.stage } };
        // If moving to Completed, auto-confirm actual = weight
        if (item.stage === 'Completed') {
          // Fetch current task weight to set actual
          const projectDoc = await Model.findOne(
            { _id: mongoose.Types.ObjectId(req.params.id), 'task._id': mongoose.Types.ObjectId(item._id) },
            { 'task.$': 1 }
          );
          if (projectDoc && projectDoc.task && projectDoc.task[0]) {
            const taskWeight = projectDoc.task[0].weight || 0;
            updateOp.$set['task.$.actual'] = taskWeight;
          }
        }
        return Model.updateOne(
          {
            _id: mongoose.Types.ObjectId(req.params.id),
            task: { $elemMatch: { _id: mongoose.Types.ObjectId(item._id) } },
          },
          updateOp
        );
      })
    );

    // Recalculate achievement from scratch (sum of weight of all Completed tasks)
    // This is more accurate than $inc which can drift over time
    const updatedProject = await Model.findOne({ _id: req.params.id });
    const completedWeight = (updatedProject.task || [])
      .filter((t) => t.stage === 'Completed')
      .reduce((sum, t) => sum + (parseInt(t.weight) || 0), 0);

    // Clamp to 0-100
    const newAchievement = Math.min(100, Math.max(0, completedWeight));

    const result = await Model.findOneAndUpdate(
      { _id: req.params.id, removed: false },
      { $set: { achievement: newAchievement } },
      { new: true, runValidators: true }
    ).exec();

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'There is no record found. Please try again!',
      });
    }

    // Auto-close project when achievement reaches 100
    if (result.achievement >= 100 && result.status !== 'closed') {
      await Model.updateOne({ _id: req.params.id }, { $set: { status: 'closed' } });
    }

    // Return the first task's data with updated achievement (safe — task[0] always exists)
    const responseTask = task[0] || {};
    return res.json({ ...responseTask, achievement: result.achievement });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = reorder;
