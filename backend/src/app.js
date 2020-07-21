const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const config = require('./config');
const apiVersion = config.apiVersion;

const indexRouter = require('./routes/index');
const apiRoutes = require(`./routes/api-v${apiVersion}`);

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

// Setup API routing table
for(const route in apiRoutes) {
  const regexp = route === 'index'
    ? `/api/v${apiVersion}/?`
    : `/api/v${apiVersion}/${route}/?`;

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
