require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const config = require('./config');
const apiVersion = config.apiVersion;

const indexRouter = require('./routes/index');
const apiRoutes = require(`./routes/api-v${apiVersion}`);

const app = express();
const { env } = process;
const sessionOptions = {
  secret: env.SESSION_TOKEN_KEY,
  resave: false,
  saveUninitialized: false,
  cookie: {}
};

if (app.get('env') === 'production') {
  app.set('trust proxy', 1); // trust first proxy
  sessionOptions.cookie.secure = true; // serve secure cookies
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session(sessionOptions));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

// Setup API routing table
for(const route in apiRoutes) {
  const regexp = route === 'index'
    ? `/api/v${apiVersion}/?`
    : `/api/v${apiVersion}/${route}`;

  app.use(new RegExp(regexp, 'i'), apiRoutes[route]);
}

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500).json({error: err.message});
  //res.render('error');
});

module.exports = app;
