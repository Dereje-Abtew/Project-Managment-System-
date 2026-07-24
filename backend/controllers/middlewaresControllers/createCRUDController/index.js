const mongoose = require('mongoose');

const create = require('./create');
const read = require('./read');
const update = require('./update');
const remove = require('./remove');
const search = require('./search');
const filter = require('./filter');
const listAll = require('./listAll');
const changePassword = require('./changePassword');
const status = require('./status');
const summary = require('./summary');
const paginatedList = require('./paginatedList');


const createCRUDController = (modelName) => {
  const Model = mongoose.model(modelName);
  let crudMethods = {};

  crudMethods.create = async (req, res) => {
    return create(Model, req, res);
  };
  crudMethods.read = async (req, res) => {
    return read(Model, req, res);
  };
  crudMethods.update = async (req, res) => {
    return update(Model, req, res);
  };
  crudMethods.delete = async (req, res) => {
    return remove(Model, req, res);
  };
  crudMethods.list = async (req, res) => {
    return paginatedList(Model, req, res);
  };
  crudMethods.listAll = async (req, res) => {
    return listAll(Model, req, res);
  };
  crudMethods.search = async (req, res) => {
    return search(Model, req, res);
  };

  crudMethods.filter = async (req, res) => {
    return filter(Model, req, res);
  };
  crudMethods.changePassword = async (req, res) => {
    return changePassword(Model, req, res);
  };
  crudMethods.status = async (req, res) => {
    return status(Model, req, res);
  };
  crudMethods.summary = async (req, res) => {
    return summary(Model, req, res);
  };


  return crudMethods;
};

module.exports = createCRUDController;
