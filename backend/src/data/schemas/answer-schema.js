const Schema = require('mongoose').Schema;
const { virtualSchemaOptions } = require('./_schema-helper.js');
const schemaDefinition = {
  body: { type: String, required: true },
  question: {
    type: Schema.ObjectId,
    ref: 'Question',
    required: true,
  },
  author: {
    type: Schema.ObjectId,
    ref: 'User',
    required: true
  },
  votes: [{
    type: Schema.ObjectId,
    ref: 'AnswerVote'
  }],
  meta: {
    created_at: {
      type: Date,
      required: true,
      'default': Date.now,
      set: function() {
        if(this.isNew) {
          return Date.now();
        } else {
          return this.meta.created_at;
        }
      },
    },
    updated_at: {
      type: Date,
      'default': Date.now
    }
  },
};

const AnswerSchema = new Schema(schemaDefinition, virtualSchemaOptions);

AnswerSchema.pre('save', function(next) {
  if(this.isNew) {
    this.meta.created_at = Date.now();
  }

  this.meta.updated_at = undefined;
  next();
});

AnswerSchema.virtual('id').get(function() {
  return this._id;
});

AnswerSchema
  .virtual('creationDate')
  .get(function() {
    return this.meta.created_at;
  });

// Create custom versions of:
// find(), count(), findOneAndUpdate(), etc
AnswerSchema.statics = {
  ...AnswerSchema.statics,
  generateQuery: function({ where = {}, page = 1, limit = 0, orderBy = {} }) {
    page = parseInt(page, 10);
    limit = parseInt(limit, 10);

    const SORT = { ASC: '1', DESC: '-1' };
    const OFFSET = ((typeof page === 'number' && page > 0) ? page - 1 : 0);
    const LIMIT = ((typeof limit === 'number' && limit > 0) ? limit : 0);
    const WHERE = (where && typeof where === 'object' ? where : {});
    const query = this.find(WHERE);

    for(let [key, val] of Object.entries(orderBy)) {
      let value = val.toUpperCase();
      query.sort({
        [key]: Object.keys(SORT).includes(value) ? SORT[value] : SORT['ASC']
        // using: sort({<FIELD>: 1/-1})
      });
    }

    // Order by most recent, unless client specifies otherwise
    if(!Reflect.has(orderBy, 'creationDate') ||
       !Object.keys(SORT).includes(orderBy.creationDate.toUpperCase())) {
      query.sort({ 'meta.created_at': SORT.DESC });
      // using: sort('[-]<FIELD>');
    } else {
      query.sort({
        'meta.created_at': orderBy.creationDate.toUpperCase() === 'ASC'
          ? SORT.ASC
          : SORT.DESC
      });
    }

    query.skip(OFFSET * LIMIT);

    if(LIMIT > 0) {
      query.limit(LIMIT);
    }

    return query;
  },
  generateSearchQuery: function(str, { page = 1, limit = 0, orderBy = {} }) {
    const regex = new RegExp(str, 'i');
    const where = { body: regex };

    return this.generateQuery({ where, page, limit, orderBy });
  },
  countAnswers: async function(where) {
    if(typeof where === 'object') {
      return await this.countDocuments(where);
    } else {
      return await this.estimatedDocumentCount();
    }
  },
  updateAnswer: async function(id, updateData) {
    return await this.findOneAndUpdate({ _id: id }, updateData);
  },
  updateAnswers: async function(where = {}, updateData) {
    return await this.update(where, updateData);
  },
  answerExists: async function(id) {
    return await this.findById(id);
  }
};

module.exports = AnswerSchema;
