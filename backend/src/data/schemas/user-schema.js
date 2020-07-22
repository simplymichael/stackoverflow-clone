const Schema = require('mongoose').Schema;
const emailValidator = require('email-validator');
const { virtualSchemaOptions } = require('./_schema-helper.js');
const schemaDefinition = {
  username: {
    type: String,
    unique: true,
    lowercase: true,
    required: true,
  },
  name: {
    first: { type: String, required: true },
    last: { type: String, required: true },
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    validate: [
      (email) => emailValidator.validate(email),
      'Please provide a valid email'
    ],
  },
  password: {
    type: String,
    required: true
  },
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

const UserSchema = new Schema(schemaDefinition, virtualSchemaOptions);

UserSchema.pre('save', function(next) {
  if(this.isNew) {
    this.meta.created_at = Date.now();
  }

  this.meta.updated_at = undefined;
  next();
});

UserSchema.virtual('id').get(function() {
  return this._id;
});

UserSchema
  .virtual('fullname')
  .get(function() {
    return [this.name.first, this.name.last].join(' ');
  })
  .set(function(fullName) {
    var nameParts = fullName.split(' ');
    this.name.last = nameParts.pop();
    this.name.first = nameParts.join(' ');
  });

UserSchema
  .virtual('signupDate')
  .get(function() {
    return this.meta.created_at;
  });

// Create custom promise(-ified) versions of:
// create()/save(), find(), count() findOne()
UserSchema.statics = {
  ...UserSchema.statics,
  insert: async function(data) {
    return new Promise((resolve, reject) => {
      this.create(data, (err, user) => err ? reject(err) : resolve(user));
    });
  },
  search: async function(str, { page = 1, limit = 0, orderBy = {} }) {
    const regex = new RegExp(str, 'i');
    const where = {
      '$or': [
        { username: regex },
        { 'name.first': regex },
        { 'name.last': regex }
      ]
    };

    return await this.getUsers({ where, page, limit, orderBy });
  },
  countUsers: async function(where) {
    where = (typeof where === 'object' ? where : {});

    return new Promise((resolve, reject) => {
      this.countDocuments(where, (err, count) => err
        ? reject(err)
        : resolve(count)
      );
    });
  },
  getUsers: async function({ where = {}, page = 1, limit = 0, orderBy = {} }) {
    page = parseInt(page, 10);
    limit = parseInt(limit, 10);

    const SORT = { ASC: '1', DESC: '-1' };
    const OFFSET = ((typeof page === 'number' && page > 0) ? page - 1 : 0);
    const LIMIT = ((typeof limit === 'number' && limit > 0) ? limit : 0);
    const WHERE = (where && typeof where === 'object' ? where : {});

    return new Promise((resolve, reject) => {
      const query = this.find(WHERE);

      for(let [key, val] of Object.entries(orderBy)) {
        let value = val.toUpperCase();
        query.sort({
          [key]: Object.keys(SORT).includes(value) ? SORT[value] : SORT['ASC']
          // using: sort({<FIELD>: 1/-1})
        });
      }

      // Order by most recent registrations by default,
      // unless client specifies otherwise
      if(!Reflect.has(orderBy, 'signupDate') ||
         !Object.keys(SORT).includes(orderBy.signupDate.toUpperCase())) {
        query.sort({ 'meta.created_at': SORT.DESC });
        // using: sort('[-]<FIELD>');
      } else {
        query.sort({
          'meta.created_at': orderBy.signupDate.toUpperCase() === 'ASC'
            ? SORT.ASC
            : SORT.DESC
        });
      }

      query.skip(OFFSET * LIMIT);

      if(LIMIT > 0) {
        query.limit(LIMIT);
      }

      query.exec(async (err, users) => (err) ? reject(err) : resolve(users));
    });
  },
  getUser: async function(id) {
    return new Promise((resolve, reject) => {
      this.findById(id, async (err, user) =>
        err ? reject(err) : resolve(user));
    });
  },
  updateUser: async function(id, updateData) {
    return new Promise((resolve, reject) => {
      this.findOneAndUpdate({ id }, updateData, (err, user) =>
        err ? reject(err) : resolve(user));
    });
  },
  updateUsers: async function(where = {}, updateData) {
    return new Promise((resolve, reject) => {
      this.updateMany(where, updateData, (err, users) =>
        err ? reject(err) : resolve(users));
    });
  },
  userExists: async function(id) {
    return await this.getUser(id);
  }
};

UserSchema.methods = {
  ...UserSchema.methods,
  getQuestions: async function({ where = {}, page= 1, limit= 0, orderBy= {} }) {
    where = (typeof where === 'object' ? where : {});
    where.author = this._id;

    return (
      await this.model('Question')
        .getQuestions({ where, page, limit, orderBy })
    );
  },

  getAnswers: async function({ where = {}, page= 1, limit= 0, orderBy= {} }) {
    where = (typeof where === 'object' ? where : {});
    where.author = this._id;

    return (
      await this.model('Answer')
        .getAnswers({ where, page, limit, orderBy })
    );
  },
};

module.exports = UserSchema;
