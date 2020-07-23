/**
 * Validate and sanitize question title
 */
 
const { body } = require('express-validator');

module.exports = () => {
  return [
    body('title').trim()
      .isLength({ min: 3 })
      .withMessage('The title field is required')
      .escape()
  ];
};
