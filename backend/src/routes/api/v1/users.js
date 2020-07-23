const router = require('express').Router();
const { validationResult } = require('express-validator');
const debug = require('../../../config').debug;
const notLoggedIn = require('../../../middlewares/not-logged-in');
const { statusCodes } = require('../../../utils/http');
const { hashPassword } = require('../../../utils/auth');
const validator = require('../../../middlewares/validators/_validator');
const User = require('../../../data/models/user-model');

// Fields to return to the client when a new user is created
// or when user data is requested
const publicFields = ['id', 'name', 'fullname', 'email', 'username', 'signupDate'];

/* GET users listing. */
router.get('/', async function(req, res) {
  try {
    const users = await User.getUsers({returnFields: publicFields});

    res.status(statusCodes.ok).json({
      data: { users }
    });
  } catch(err) {
    res.status(statusCodes.serverError).json({
      errors: [{ msg: 'There was an error retrieving users' }]
    });

    debug(`Error retrieving users: ${err}`);
    return;
  }
});

/* Create (i.e, register) a new user */
router.post('/', notLoggedIn,
  validator.validate('firstname', 'lastname', 'username', 'email', 'password', 'confirmPassword'),
  async function(req, res) {
    const { firstname, lastname, username, email, password } = req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(statusCodes.badRequest).json({
        errors: errors.array()
      });
    }

    try {
      if((await User.getUsers({ where: {email} })).length) {
        return res.status(statusCodes.badRequest).json({
          errors: [{
            value: email,
            location: 'body',
            msg: 'That email address is not available!',
            param: 'email'
          }]
        });
      }

      if((await User.getUsers({ where: {username} })).length) {
        return res.status(statusCodes.badRequest).json({
          errors: [{
            value: username,
            location: 'body',
            msg: 'That username is not available!',
            param: 'username'
          }]
        });
      }

      const hashedPassword = await hashPassword(password);
      const registrationData = {
        username: username,
        name: { first: firstname, last: lastname },
        email: email,
        password: hashedPassword,
      };
      const data = await User.create(registrationData);
      const user = {};

      // Populate the user variable with values we want to return to the client
      publicFields.forEach(key => user[key] = data[key]);

      return res.status(statusCodes.ok).json({
        data: { user }
      });
    } catch(err) {
      if (err.code === 11000) {
        return res.status(statusCodes.conflict).json({
          errors: [{
            value: '',
            location: 'body',
            msg: 'The email or username you are trying to use is not available',
            param: 'email or username',
          }]
        });
      } else {
        if (err.name === 'ValidationError') {
          const validationErrors = Object.keys(err.errors).map((field) => {
            return {
              value: field === 'password' ? password : err.errors[field].value,
              location: 'body',
              msg: err.errors[field].message,
              param: field
            };
          });

          return res.status(statusCodes.badRequest).json({
            errors: validationErrors
          });
        } else {
          res.status(statusCodes.serverError).json({
            errors: [{ msg: 'There was an error saving the user' }]
          });

          debug(`Error saving the user: ${err}`);
          return;
        }
      }
    }
  });

module.exports = router;
