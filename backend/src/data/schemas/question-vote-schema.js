const Schema = require('mongoose').Schema;
const QuestionVoteSchema = new Schema({
  direction: {
    type: String,
    required: true,
    lowercase: true,
    'enum': ['up', 'down'],
  },
  question: {
    type: Schema.ObjectId,
    ref: 'Question',
    required: true
  },
  voter: {
    type: Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  voteDate: {
    type: Date,
    'default': Date.now
  }
});

QuestionVoteSchema.statics = {
  ...QuestionVoteSchema.statics,
  countQuestionVotes: async function(questionId, voteDirection) {
    return (
      voteDirection
        ? await this.count({ question: questionId, direction: voteDirection })
        : await this.count({ question: questionId })
    );
  },
};

module.exports = QuestionVoteSchema;
