const router = require('express').Router();
const { validationResult } = require('express-validator');
const debug = require('../../../config').debug;
const authorized = require('../../../middlewares/authorized');
const loggedIn = require('../../../middlewares/logged-in');
const { statusCodes } = require('../../../utils/http');
const validator = require('../../../middlewares/validators/_validator');
const Question = require('../../../data/models/question-model');
const Answer = require('../../../data/models/answer-model');
const QuestionVote = require('../../../data/models/question-vote-model');

// Fields to return to the client when a new question is created
// or when question data is requested
const publicFields = ['id', 'title', 'body', 'author', 'answers', 'votes', 'creationDate'];
const answerPublicFields = ['id', 'body', 'question', 'author', 'creationDate'];
const userPublicFields = ['id', 'name', 'fullname', 'email', 'username', 'signupDate'];

/* GET list of questions */
router.get('/', async function(req, res) {
  try {
    const questions = await Question.getQuestions({ returnFields: publicFields });

    res.status(statusCodes.ok).json({
      data: { questions }
    });
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
    const question = await Question.findById(id, publicFields.join(' '))
      .populate('author', userPublicFields.join(' '))
      .populate('answers', answerPublicFields.join(' '))
      .populate('votes')
      .exec();

    res.status(statusCodes.ok).json({
      data: { question }
    });
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

router.post('/:questionId/answers', loggedIn, authorized, validator.validate('body'),
  async function(req, res) {
    const errors = validationResult(req);
    const { questionId } = req.params;
    const { body } = req.body;

    if (!errors.isEmpty()) {
      return res.status(statusCodes.badRequest).json({
        errors: errors.array()
      });
    }

    try {
      const answerData = { body, question: questionId, author: req.session.user.id };
      const data = await Answer.create(answerData);
      const answer = {};

      // Populate the user variable with values we want to return to the client
      answerPublicFields.forEach(key => answer[key] = data[key]);

      // Add the answer (id) as an embedded document in the question
      await Question.updateQuestion(questionId, { $push: { answers: answer.id } });

      return res.status(statusCodes.ok).json({
        data: { answer }
      });
    } catch(err) {
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
          errors: [{ msg: 'There was an error creating the answer' }]
        });

        debug(`Error creating answer: ${err}`);
        return;
      }
    }
  }
);

router.post('/:questionId/votes', loggedIn, authorized, async function(req, res) {
  const { questionId } = req.params;
  const { direction } = req.body;
  const currUserId = req.session.user.id;

  if (!direction) {
    return res.status(statusCodes.badRequest).json({
      errors: [{
        'location': 'body',
        'msg': 'The direction field is required',
        'param': 'direction',
      }]
    });
  }

  if(!['up', 'down'].includes(direction.toLowerCase())) {
    return res.status(statusCodes.badRequest).json({
      errors: [{
        'location': 'body',
        'msg': 'The value of the direction field can only be either of "up" or "down"',
        'param': 'direction',
      }]
    });
  }

  const userVoteOnQuestion = await QuestionVote.findOne({
    question: questionId, voter: currUserId
  });

  // If user alread voted on question,
  // they cannot cast another vote
  if(userVoteOnQuestion) {
    return res.status(statusCodes.forbidden).json({
      errors: [{
        'msg': 'You already voted on this question',
      }]
    });
  }

  try {
    const voteData = { direction, question: questionId, voter: currUserId };
    const vote = await QuestionVote.create(voteData);

    // Add the vote (id) as an embedded document in the question
    await Question.updateQuestion(questionId, { $push: { votes: vote._id } });

    return res.status(statusCodes.ok).json({
      data: { vote }
    });
  } catch(err) {
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
        errors: [{ msg: 'There was an error creating the answer' }]
      });

      debug(`Error creating answer: ${err}`);
      return;
    }
  }
});

module.exports = router;
