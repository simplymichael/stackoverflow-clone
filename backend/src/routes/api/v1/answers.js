const router = require('express').Router();
const debug = require('../../../config').debug;
const authorized = require('../../../middlewares/authorized');
const loggedIn = require('../../../middlewares/logged-in');
const { statusCodes } = require('../../../utils/http');
const Answer = require('../../../data/models/answer-model');
const AnswerVote = require('../../../data/models/answer-vote-model');

// Fields to return to the client when a new answer is created
// or when answer data is requested
const publicFields = ['id', 'body', 'question', 'author', 'votes', 'creationDate'];
const questionPublicFields = ['id', 'title', 'body', 'author', 'answers', 'votes', 'creationDate'];
const userPublicFields = ['id', 'name', 'fullname', 'email', 'username', 'signupDate'];

/* Search for answers */
router.get('/search', async (req, res) => {
  try {
    let { query, page = 1, limit = 20, sort } = req.query;
    let orderBy = {};

    if(!query || query.trim().length === 0) {
      return res.status(statusCodes.badRequest).json({
        errors: [{
          location: 'query',
          msg: 'Please specify the query to search for',
          param: 'query'
        }]
      });
    }

    // body:desc=creationDate:asc
    if(sort && sort.trim().length > 0) {
      sort = sort.trim();
      const sortData = sort.split('=');

      orderBy = sortData.reduce((acc, val) => {
        const data = val.split(':');
        const orderKey = data[0].toLowerCase();

        acc[orderKey] = ((data.length > 1) ? data[1] : '');

        return acc;
      }, {});
    }

    query = query.trim();

    const queryParams = { page, limit, orderBy };
    const regex = new RegExp(query, 'i');
    const where = { body: regex };
    const allAnswersCount = await Answer.countAnswers(where);
    const results = await Answer.generateSearchQuery(query, queryParams)
      .populate('author', userPublicFields)
      .populate('question', questionPublicFields)
      .populate('votes')
      .exec();

    const answers = [];

    results.forEach(answer => {
      const currAnswer = {};

      // Populate the user variable with values we want to return to the client
      publicFields.forEach(key => {
        currAnswer[key] = answer[key];
      });

      answers.push(currAnswer);
    });

    return res.status(statusCodes.ok).json({
      data: {
        total: allAnswersCount,
        length: results.length,
        answers,
      }
    });
  } catch(err) {
    debug(`Answer search error: ${err}`);

    return res.status(statusCodes.serverError).json({
      errors: [{
        msg: 'There was an error processing your request. Please, try again',
      }]
    });
  }
});

/* GET details for answer identified by ID. */
router.get('/:answerId/', async function(req, res) {
  try {
    const id = req.params.answerId;
    const answer = await Answer.findById(id, publicFields.join(' '))
      .populate('author', userPublicFields.join(' '))
      .populate('question', questionPublicFields.join(' '))
      .populate('votes')
      .exec();

    res.status(statusCodes.ok).json({
      data: { answer }
    });
  } catch(err) {
    res.status(statusCodes.serverError).json({
      errors: [{ msg: 'There was an error retrieving answer' }]
    });

    debug(`Error retrieving answer: ${err}`);
    return;
  }
});

/* Vote on an question */
router.post('/:answerId/votes', loggedIn, authorized, async function(req, res) {
  const { answerId } = req.params;
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

  try {
    if(!(await Answer.answerExists(answerId))) {
      return res.status(statusCodes.notFound).json({
        errors: [{
          value: answerId,
          location: 'param',
          msg: 'Answer does not exist',
          param: 'answerId',
        }]
      });
    }

    const userVoteOnAnswer = await AnswerVote.findOne({
      answer: answerId, voter: currUserId
    });

    // If user alread voted on answer,
    // they cannot cast another vote
    if(userVoteOnAnswer) {
      return res.status(statusCodes.forbidden).json({
        errors: [{
          'msg': 'You already voted on this answer',
        }]
      });
    }

    const voteData = { direction, answer: answerId, voter: currUserId };
    const vote = await AnswerVote.create(voteData);

    // Add the vote (id) as an embedded document in the answer
    await Answer.updateAnswer(answerId, { $push: { votes: vote._id } });

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
        errors: [{ msg: 'There was an error voting on the answer' }]
      });

      debug(`Error voting on answer: ${err}`);
      return;
    }
  }
});

module.exports = router;
