const router = require('express').Router();
const { validationResult } = require('express-validator');
const emailValidator = require('email-validator');
const debug = require('../../../config').debug;
const notLoggedIn = require('../../../middlewares/not-logged-in');
const { statusCodes } = require('../../../utils/http');
const { checkPassword, generateAuthToken } = require('../../../utils/auth');
const validator = require('../../../middlewares/validators/_validator');
const User = require('../../../data/models/user-model');

// Fields to return to the client when a new user is created
// or when user data is requested
const publicFields = [
  'id', 'firstname', 'lastname', 'fullname',
  'email', 'username', 'signupDate'
];

router.post('/', notLoggedIn, validator.validate('login', 'password'),
  async function(req, res) {
    try {
      const errors = validationResult(req);
      const { login, password } = req.body;
      const isEmail = emailValidator.validate(login);
      const whereField = isEmail ? 'email' : 'username';
      const where = {
        [whereField]: login,
      };

      if (!errors.isEmpty()) {
        return res.status(statusCodes.badRequest).json({
          errors: errors.array()
        });
      }

      const users = await User.generateQuery({ where }).exec();

      if(!users.length) {
        return res.status(statusCodes.notFound).json({
          errors: [{
            msg: 'User not found!',
          }]
        });
      }

      const userData = users[0];

      if(!(await checkPassword(password, userData.password))) {
        return res.status(statusCodes.notFound).json({
          errors: [{
            msg: 'The username or password you have provided is invalid',
            param: 'password'
          }]
        });
      }

      const user = {};

      // Populate the user variable with values we want to return to the client
      publicFields.forEach(key => user[key] = userData[key]);

      req.session.user = user; // Maintain the user's data in current session

      // Create an auth token for the user so we can validate future requests
      const { token, expiry } = generateAuthToken(user.id, user.email);
      const authorization = { token: `Bearer ${token}`, expiresIn: expiry };

      return res.status(statusCodes.ok).json({
        data: { user,  authorization }
      });
    } catch(err) {
      res.status(statusCodes.serverError).json({
        errors: [{ msg: 'There was an error logging in the user' }]
      });

      debug(`Error authenticating user: ${err}`);
      return;
    }
  });

module.exports = router;
