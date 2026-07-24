const mongoose = require('mongoose');

const create = require('./create');
const read = require('./read');
const update = require('./update');
const remove = require('./remove');

const issueCRUDController = (modelName) => {
  const Model = mongoose.model(modelName);
  let issueCRUDMethods = {};

  issueCRUDMethods.create = async (req, res) => {
    create(Model, req, res);
  };
  issueCRUDMethods.read = async (req, res) => {
    read(Model, req, res);
  };
  issueCRUDMethods.update = async (req, res) => {
    update(Model, req, res);
  };
  issueCRUDMethods.delete = async (req, res) => {
    remove(Model, req, res);
  };

  return issueCRUDMethods;
};

module.exports = issueCRUDController;
