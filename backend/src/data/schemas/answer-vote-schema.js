const Schema = require('mongoose').Schema;
const AnswerVoteSchema = new Schema({
  direction: {
    type: String,
    required: true,
    lowercase: true,
    'enum': ['up', 'down'],
  },
  answer: {
    type: Schema.ObjectId,
    ref: 'Answer',
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

AnswerVoteSchema.statics = {
  ...AnswerVoteSchema.statics,
  countAnswerVotes: async function(answerId, voteDirection) {
    return (
      voteDirection
        ? await this.count({ answer: answerId, direction: voteDirection })
        : await this.count({ answer: answerId })
    );
  },
};

module.exports = AnswerVoteSchema;
