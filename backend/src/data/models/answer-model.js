const mongoose = require('mongoose');
const AnswerSchema = require('../schemas/answer-schema');

module.exports = mongoose.model('Answer', AnswerSchema);
