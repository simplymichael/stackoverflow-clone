const firstnameValidator = require('./firstname-validator');
const lastnameValidator = require('./lastname-validator');
const emailValidator = require('./email-validator');
const usernameValidator = require('./username-validator');
const passwordValidator = require('./password-validator');
const passwordConfirmationValidator = require('./password-confirmation-validator');
const validators = {
  firstname: firstnameValidator,
  lastname: lastnameValidator,
  username: usernameValidator,
  email: emailValidator,
  password: passwordValidator,
  confirmPassword: passwordConfirmationValidator,
};

module.exports = {
  validate: (...args) => {
    const validations = [];

    args.forEach(arg => {
      const validator = validators[arg];

      if(validator) {
        validations.push(validator());
      }
    });

    return validations;
  },
};
