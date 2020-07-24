const mongoose = require('mongoose');
const QuestionVoteSchema = require('../schemas/question-vote-schema');

module.exports = mongoose.model('QuestionVote', QuestionVoteSchema);
