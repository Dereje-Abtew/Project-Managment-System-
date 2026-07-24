const mongoose = require('mongoose');
const Chief = mongoose.model('Chief');
const Department = mongoose.model('Department');
const Division = mongoose.model('Division');

const read = async (Model, req, res) => {
  try {
    const schemaName = Model.collection.name;
    const result = await Model.findOne({ _id: req.params.id, removed: false }).select('-password');

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Record not found. Please try again!',
      });
    }

    if (schemaName === 'users') {
      let directorName, directorEmail, managerName, managerEmail, userChiefName, userChiefEmail;

      try {
        if (result.position === 'Professional' || result.position === 'Manager') {
          // Fetch Division details
          const division = result.division
            ? await Division.findById(result.division._id || result.division)
            : null;

          if (division) {
            // Fetch Department details from the Division
            const department = division.department
              ? await Department.findById(division.department._id || division.department)
              : null;

            if (department) {
              // Fetch Chief of the Department
              if (department.chief) {
                const chiefDoc = await Chief.findById(department.chief._id || department.chief);
                if (chiefDoc) {
                  const chiefUser = await Model.findOne({ chief: chiefDoc._id, position: 'Chief' });
                  if (chiefUser) {
                    userChiefName = `${chiefUser.firstName} ${chiefUser.lastName}`;
                    userChiefEmail = chiefUser.email;
                  } else {
                    // Fallback to the Chief document name
                    userChiefName = chiefDoc.chiefName;
                  }
                }
              }

              // Fetch Director of the Department
              const director = await Model.findOne({ department: department._id, position: 'Director', removed: false });
              if (director) {
                directorName = `${director.firstName} ${director.lastName}`;
                directorEmail = director.email;
              }
            }
          }

          // Fetch Manager of the Division (for Professionals)
          if (result.position === 'Professional' && result.division) {
            const divisionId = result.division._id || result.division;
            const manager = await Model.findOne({ division: divisionId, position: 'Manager', removed: false });
            if (manager) {
              managerName = `${manager.firstName} ${manager.lastName}`;
              managerEmail = manager.email;
            }
          }

          // For Managers: they are their own manager
          if (result.position === 'Manager') {
            managerName = `${result.firstName} ${result.lastName}`;
            managerEmail = result.email;
          }
        }

        if (result.position === 'Director') {
          // Fetch Department details of the Director
          const department = result.department
            ? await Department.findById(result.department._id || result.department)
            : null;

          if (department && department.chief) {
            // Fetch Chief of the Department
            const chiefDoc = await Chief.findById(department.chief._id || department.chief);
            if (chiefDoc) {
              const chiefUser = await Model.findOne({ chief: chiefDoc._id, position: 'Chief', removed: false });
              if (chiefUser) {
                userChiefName = `${chiefUser.firstName} ${chiefUser.lastName}`;
                userChiefEmail = chiefUser.email;
              } else {
                userChiefName = chiefDoc.chiefName;
              }
            }
          }

          // Directors are their own director
          directorName = `${result.firstName} ${result.lastName}`;
          directorEmail = result.email;
        }

        if (result.position === 'Chief') {
          // Chief users: their name is their own chief name
          userChiefName = `${result.firstName} ${result.lastName}`;
          userChiefEmail = result.email;
        }
      } catch (lookupErr) {
        // Non-fatal: log and continue with partial data
        console.warn('Profile lookup warning:', lookupErr.message);
      }

      // Construct the response object with all required data
      return res.status(200).json({
        success: true,
        result: {
          ...result.toObject(), // Convert Mongoose document to plain object
          directorName,
          directorEmail,
          managerName,
          managerEmail,
          userChiefName,
          userChiefEmail,
        },
        message: `Record found by ID: ${req.params.id}`,
      });
    } else {
      // If schemaName is not 'users', return the result without additional fields
      return res.status(200).json({
        success: true,
        result,
        message: `Record found by ID: ${req.params.id}`,
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching the record.',
      error: err.message,
    });
  }
};

module.exports = read;
