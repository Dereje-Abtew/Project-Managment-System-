const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const mongoose = require('mongoose');

const User = mongoose.model('User');
const Role = mongoose.model('Role');
const Chief = mongoose.model('Chief');
const Department = mongoose.model('Department');
const Division = mongoose.model('Division');

require('dotenv').config({ path: '.env' });

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    const schema = Joi.object({
      email: Joi.string().email({ tlds: { allow: false } }).required(),
      password: Joi.string().required(),
    });

    const { error } = schema.validate({ email, password });
    if (error) {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Invalid/Missing credentials.',
      });
    }

    // Find user by email
    const user = await User.findOne({ email, removed: false }).populate('role');

    if (!user) {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'No account with this email has been registered.',
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Invalid credentials.',
      });
    }

    // Check user status
    if (!user.enabled) {
      return res.status(401).json({
        success: false,
        result: null,
        message: 'Your account has been deactivated.',
      });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: req.body.remember ? '7d' : '24h',
    });

    // Prepare result data based on user's role and position
    let chief, department, division, directorEmail, directorId, managerEmail, managerId;

    if (user.position === 'Professional' || user.position === 'Manager') {
      // Fetch Division details (non-fatal if missing)
      if (user.division) {
        division = await Division.findById(user.division);
        if (division && division.department) {
          department = await Department.findById(division.department);
          if (department && department.chief) {
            chief = await Chief.findById(department.chief);
          }
          if (department) {
            const director = await User.findOne({ department: department._id, position: 'Director', removed: false });
            if (director) {
              directorEmail = director.email;
              directorId = director._id;
            }
          }
        }
      }
      if (user.position === 'Professional' && user.division) {
        const manager = await User.findOne({ division: user.division, position: 'Manager', removed: false });
        if (manager) {
          managerEmail = manager.email;
          managerId = manager._id;
        }
      }
    }

    if (user.position === 'Director') {
      if (user.department) {
        department = await Department.findById(user.department);
        if (department && department.chief) {
          chief = await Chief.findById(department.chief);
        }
      }
      directorEmail = user.email;
      directorId = user._id;
    }

    // Fetch user's role details
    const role = await Role.findById(user.role._id);

    // Update user's login status
    await User.findByIdAndUpdate(user._id, { isLoggedIn: 1 });

    // Send response with user details
    res.status(200).json({
      success: true,
      result: {
        id: user._id,
        token,
        firstName: user.firstName,
        lastName: user.lastName,
        position: user.position,
        role,
        email: user.email,
        chief,
        department,
        division,
        managerEmail,
        managerId,
        directorEmail,
        directorId,
        isLoggedIn: true,
      },
      message: 'User successfully logged in.',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = login;
