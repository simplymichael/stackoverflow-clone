const router = require('express').Router();
const { validationResult } = require('express-validator');
const debug = require('../../../config').debug;
const authorized = require('../../../middlewares/authorized');
const loggedIn = require('../../../middlewares/logged-in');
const { statusCodes } = require('../../../utils/http');
const validator = require('../../../middlewares/validators/_validator');
const Question = require('../../../data/models/question-model');

// Fields to return to the client when a new question is created
// or when question data is requested
const publicFields = ['id', 'title', 'body', 'author', 'creationDate'];

/* GET list of questions */
router.get('/', async function(req, res) {
  try {
    const questions = await Question.getQuestions({ returnFields: publicFields });

    res.status(statusCodes.ok).json({ data: questions });
  } catch(err) {
    res.status(statusCodes.serverError).json({
      errors: [{ msg: 'There was an error retrieving questions' }]
    });

    debug(`Error retrieving questions: ${err}`);
    return;
  }
});

/* GET details for question identified by ID. */
router.get('/:questionId/', async function(req, res) {
  try {
    const id = req.params.questionId;
    const question = await Question.findById(id, publicFields.join(' '));

    res.status(statusCodes.ok).json({ data: question });
  } catch(err) {
    res.status(statusCodes.serverError).json({
      errors: [{ msg: 'There was an error retrieving question' }]
    });

    debug(`Error retrieving question: ${err}`);
    return;
  }
});

router.post('/', loggedIn, authorized, validator.validate('title', 'body'),
  async function(req, res) {
    const errors = validationResult(req);
    const { title, body } = req.body;

    if (!errors.isEmpty()) {
      return res.status(statusCodes.badRequest).json({
        errors: errors.array()
      });
    }

    try {
      const questionData = { title, body, author: req.session.user.id };
      const data = await Question.create(questionData);
      const question = {};

      // Populate the user variable with values we want to return to the client
      publicFields.forEach(key => question[key] = data[key]);

      return res.status(statusCodes.ok).json({
        data: { question }
      });
    } catch(err) {
      if (err.code === 11000) {
        return res.status(statusCodes.conflict).json({
          errors: [{
            value: title,
            location: 'body',
            msg: 'A question with that title already exists',
            param: 'title',
          }]
        });
      } else {
        if (err.name === 'ValidationError') {
          const validationErrors = Object.keys(err.errors).map((field) => {
            return {
              value: err.errors[field].value,
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
            errors: [{ msg: 'There was an error creating the question' }]
          });

          debug(`Error creating question: ${err}`);
          return;
        }
      }
    }
  }
);

module.exports = router;
