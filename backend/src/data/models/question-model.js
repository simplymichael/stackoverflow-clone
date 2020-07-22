const mongoose = require('mongoose');
const QuestionSchema = require('../schemas/question-schema');

module.exports = mongoose.model('Question', QuestionSchema);
