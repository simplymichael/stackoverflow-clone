const mongoose = require('mongoose');
const AnswerVoteSchema = require('../schemas/answer-vote-schema');

module.exports = mongoose.model('AnswerVote', AnswerVoteSchema);
