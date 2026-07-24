const User = require('../../../models/coreModels/User');

const create = async (Model, req, res) => {
  try {
    const schemaName = Model.collection.name;
    if (schemaName === 'users') {
      req.body.firstName = req.body.firstName ? String(req.body.firstName).trim() : req.body.firstName;
      req.body.lastName = req.body.lastName ? String(req.body.lastName).trim() : req.body.lastName;
      req.body.email = req.body.email ? String(req.body.email).trim().toLowerCase() : req.body.email;
      req.body.phone = req.body.phone ? String(req.body.phone).trim() : req.body.phone;
      req.body.position = req.body.position ? String(req.body.position).trim() : req.body.position;
      req.body.role = req.body.role || req.body.roleId || req.body.role_id;
      req.body.enabled = req.body.enabled !== false;

      if (!req.body.firstName || !req.body.lastName || !req.body.email || !req.body.phone || !req.body.role || !req.body.position) {
        return res.status(400).json({
          success: false,
          message: 'Please provide first name, last name, email, phone, role, and position.',
        });
      }

      const existingUser = await Model.findOne({ email: req.body.email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email already exists.',
        });
      }

      const position = req.body.position;
      if (position === 'Chief' && !req.body.chief) {
        return res.status(400).json({
          success: false,
          message: 'Chief selection is required for a Chief position.',
        });
      }
      if (position === 'Director' && !req.body.department) {
        return res.status(400).json({
          success: false,
          message: 'Department selection is required for a Director position.',
        });
      }
      if ((position === 'Manager' || position === 'Professional') && !req.body.division) {
        return res.status(400).json({
          success: false,
          message: 'Division selection is required for this position.',
        });
      }

      if (position === 'Manager') {
        const existingManager = await Model.findOne({
          division: req.body.division,
          position: 'Manager',
        });
        if (existingManager) {
          return res.status(400).json({
            success: false,
            message: 'A Manager already exists in this division.',
          });
        }
      }

      if (position === 'Director') {
        const existingDirector = await Model.findOne({
          department: req.body.department,
          position: 'Director',
        });
        if (existingDirector) {
          return res.status(400).json({
            success: false,
            message: 'A Director already exists in this department.',
          });
        }
      }

      if (position === 'Chief') {
        const existingChief = await Model.findOne({
          chief: req.body.chief,
          position: 'Chief',
        });
        if (existingChief) {
          return res.status(400).json({
            success: false,
            message: 'A Chief is already assigned to this chief.',
          });
        }
      }
    }

    if (Model.schema.paths.password) {
      const passwordToHash = req.body.password && req.body.password.trim() !== '' ? req.body.password : 'changeme';
      const newUser = new User();
      req.body.password = newUser.generateHash(passwordToHash);
    }

    const result = await new Model(req.body).save();
    if (result && result.password) {
      result.password = undefined;
    }
    return res.status(200).json({
      success: true,
      result,
      message: 'You have successfully inserted the record.',
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const fields = Object.keys(err.errors).reduce((acc, key) => {
        acc[key] = err.errors[key].message;
        return acc;
      }, {});
      return res.status(400).json({
        success: false,
        message: 'Validation failed. Please check required fields.',
        fields,
      });
    }

    if (err.code === 11000) {
      const duplicatedFields = Object.keys(err.keyValue || {}).join(', ');
      return res.status(400).json({
        success: false,
        message: `Duplicate value found for: ${duplicatedFields}`,
      });
    }

    return res.status(500).json({
      success: false,
      message: err.message || 'Oops there is an Error',
    });
  }
};

module.exports = create;
