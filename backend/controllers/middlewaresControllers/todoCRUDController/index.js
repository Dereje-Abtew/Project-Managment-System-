const mongoose = require('mongoose');

const create = require('./create');
const read = require('./read');
const readProject = require('./readProject');
const update = require('./update');
const remove = require('./remove');
const reorder = require('./reorder');
const listAll = require('./listAll');
const listAllActive = require('./listAllActive');
const addMember = require('./addMember');
const removeMember = require('./removeMember');
const { getTaskWeightByTaskId } = require('./getTaskWeight.js');

const addQualityAssurance = require('./addQualityAssurance');
const removeQualityAssurance = require('./removeQualityAssurance');

const todoCRUDController = (modelName) => {
  const Model = mongoose.model(modelName);
  let todoCRUDMethods = {};

  todoCRUDMethods.create = async (req, res) => {
    create(Model, req, res);
  };
  todoCRUDMethods.read = async (req, res) => {
    read(Model, req, res);
  };
  todoCRUDMethods.update = async (req, res) => {
    const remainingWeight = await getTaskWeightByTaskId(req.params.id, req.params.taskId, Model);

    if (parseInt(req.body.weight) > remainingWeight) {
      return res.status(400).json({
        success: false,
        //  result: null,
        message: 'Task weight can not be greater than ' + remainingWeight,
      });
    } else {
      update(Model, req, res);
    }
  };
  todoCRUDMethods.delete = async (req, res) => {
    remove(Model, req, res);
  };
  todoCRUDMethods.listAll = async (req, res) => {
    listAll(Model, req, res);
  };
  todoCRUDMethods.listAllActive = async (req, res) => {
    listAllActive(Model, req, res);
  };
  todoCRUDMethods.reorder = async (req, res) => {
    reorder(Model, req, res);
  };

  todoCRUDMethods.readProject = async (req, res) => {
    readProject(Model, req, res);
  };

  todoCRUDMethods.addMember = async (req, res) => {
    addMember(Model, req, res);
  };

  todoCRUDMethods.removeMember = async (req, res) => {
    removeMember(Model, req, res);
  };

  todoCRUDMethods.addQualityAssurance = async (req, res) => {
    addQualityAssurance(Model, req, res);
  };

  todoCRUDMethods.removeQualityAssurance = async (req, res) => {
    removeQualityAssurance(Model, req, res);
  };

  return todoCRUDMethods;
};

module.exports = todoCRUDController;
