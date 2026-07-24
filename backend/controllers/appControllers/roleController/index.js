const createCRUDController = require('@/controllers/middlewaresControllers/createCRUDController');
const methods = createCRUDController('Role');

const create = require('./create');
const update = require('./update');

methods.create = create;
methods.update = update;

module.exports = methods;
