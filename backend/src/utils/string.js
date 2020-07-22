const emailValidator = require('email-validator');
const passwordValidator = require('password-validator');
const passwordSchema = new passwordValidator();

passwordSchema
  .is().min(6)                                    // Minimum length 6
  .is().max(20)                                   // Maximum length 20
  .has().uppercase()                              // Must have uppercase letters
  .has().lowercase()                              // Must have lowercase letters
  .has().digits()                                 // Must have digits
  .has().not().spaces()                           // Should not have spaces
  .is().not().oneOf(['Passw0rd', 'Password123']); // Blacklist these values

module.exports = {
  email: {
    validate: emailValidator.validate,
    invalidMessage: 'Please provide a valid email'
  },
  password: {
    validate: passwordSchema.validate,
    invalidMessage: `Password must:
      not contain spaces,
      not be less than 6 characters,
      not be greater than 20 characters,
      contain at least one uppercase character,
      contain at least one lowercase character,
      contain at least one digit,
      not be either of 'Passw0rd' or 'Password123'
    `
  },
};
