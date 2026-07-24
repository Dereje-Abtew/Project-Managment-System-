const express = require('express');

const router = express.Router();

const { catchErrors } = require('@/handlers/errorHandlers');
const { login } = require('@/controllers/coreControllers/authJwtController');

router.route('/login').post(catchErrors(login));

module.exports = router;
