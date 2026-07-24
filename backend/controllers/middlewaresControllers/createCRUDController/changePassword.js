const changePassword = async (Model, req, res) => {
  try {
    let { password } = req.body;

    if (!password) return res.status(400).json({ msg: 'Not all fields have been entered.' });

    if (password.length < 8)
      return res.status(400).json({
        msg: 'The password needs to be at least 8 characters long.',
      });

    var newUser = new Model();
    const passwordHash = newUser.generateHash(password);
    let updates = {
      password: passwordHash,
    };

    const result = await Model.findOneAndUpdate(
      { _id: req.params.id, removed: false },
      { $set: updates },
      {
        new: true,
      }
    ).exec();
    if (!result) {
      return res.status(404).json({
        success: false,
        //  result: null,
        message: 'There is no record found. Please try again!',
      });
    }
    return res.status(200).json({
      success: true,
      result: {
        _id: result._id,
        enabled: result.enabled,
        email: result.email,
        firstName: result.firstName,
        lastName: result.lastName,
        role: result.role,
      },
      message: 'Password is updated successfully!',
    });
  } catch (error) {
    // console.log('error:', error);
    return res.status(500).json({
      success: false,
      //  result: null,
      message: 'Oops there is an Error',
      error,
    });
  }
};

module.exports = changePassword;
