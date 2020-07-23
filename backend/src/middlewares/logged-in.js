const { statusCodes } = require('../utils/http');

function loggedIn(req, res, next) {
  if (!req.session.user) {
    return res.status(statusCodes.unauthorized).json({
      errors: [{
        msg: 'Unauthorized. Please log in first.'
      }]
    });
  } else {
    next();
  }
}

module.exports = loggedIn;
