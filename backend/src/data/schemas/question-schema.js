const Schema = require('mongoose').Schema;
const { virtualSchemaOptions } = require('./_schema-helper.js');
const schemaDefinition = {
  title: { type: String, unique: true, required: true },
  body: { type: String, required: true },
  author: {
    type: Schema.ObjectId,
    ref: 'User',
    required: true
  },
  answers: [{
    type: Schema.ObjectId,
    ref: 'Answer'
  }],
  votes: [{
    type: Schema.ObjectId,
    ref: 'QuestionVote'
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

const QuestionSchema = new Schema(schemaDefinition, virtualSchemaOptions);

QuestionSchema.pre('save', function(next) {
  if(this.isNew) {
    this.meta.created_at = Date.now();
  }

  this.meta.updated_at = undefined;
  next();
});

QuestionSchema.virtual('id').get(function() {
  return this._id;
});

QuestionSchema
  .virtual('creationDate')
  .get(function() {
    return this.meta.created_at;
  });

// Create custom versions of:
// find(), count(), findOneAndUpdate(), etc
QuestionSchema.statics = {
  ...QuestionSchema.statics,
  generateSearchQuery: function(str, { page = 1, limit = 0, orderBy = {} }) {
    const regex = new RegExp(str, 'i');
    const where = { '$or': [ { title: regex }, { body: regex } ] };

    return this.generateQuery({ where, page, limit, orderBy });
  },
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

    // Order by most recent questions,
    // unless client specifies otherwise
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

    //return await query.exec(async (err, result) => (err) ? reject(err) : resolve(result));
  },
  countQuestions: async function(where) {
    if(typeof where === 'object') {
      return await this.count(where);
    } else {
      return await this.estimatedDocumentCount();
    }
  },
  updateQuestion: async function(id, updateData) {
    return await this.findOneAndUpdate({ _id: id }, updateData);
  },
  updateQuestions: async function(where = {}, updateData) {
    return await this.update(where, updateData);
  },
  questionExists: async function(id) {
    return await this.findById(id);
  }
};

module.exports = QuestionSchema;
