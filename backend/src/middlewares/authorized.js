const { statusCodes } = require('../utils/http');
const { decodeAuthToken } = require('../utils/auth');
const User = require('../data/models/user-model');

async function authorized(req, res, next) {
  const errors = [{
    value: '',
    location: 'header',
    msg: 'Invalid access token!',
    param: 'authorization_token'
  }];

  try {
    const userKey = req.header('Authorization');

    if(!userKey) {
      return res.status(statusCodes.unauthorized).json({
        errors,
      });
    }

    const bearerData = userKey.split(' ');

    if(!Array.isArray(bearerData) || bearerData.length !== 2) {
      return res.status(statusCodes.unauthorized).json({
        errors,
      });
    }

    const [ bearerString, bearerToken ] = bearerData;

    if(!bearerToken || bearerString !== 'Bearer') {
      return res.status(statusCodes.unauthorized).json({
        errors,
      });
    }

    const decoded = decodeAuthToken(bearerToken);

    if(!decoded) {
      return res.status(statusCodes.unauthorized).json({
        errors,
      });
    }

    const { userId, email } = decoded;

    if(req.session.user.id !== userId || req.session.user.email !== email) {
      return res.status(statusCodes.unauthorized).json({
        errors,
      });
    }

    if(!(await User.userExists(userId))) {
      return res.status(statusCodes.unauthorized).json({
        errors,
      });
    }

    next();
  } catch(err) {
    if(err.name === 'TokenExpiredError') {
      return res.status(statusCodes.unauthorized).json({
        errors: [{
          ...(errors.pop()),
          msg: 'Access token has expired'
        }],
      });
    }

    next(err);
  }
}

module.exports = authorized;
