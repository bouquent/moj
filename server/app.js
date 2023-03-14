var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var judgeRouter = require('./routes/judge');
var cgiRouter = require('./routes/cgi');
var app = express();

app.all('*', function(req, res, next){
  res.header('Access-Control-Allow-Origin',  '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With, yourHeaderFeild, timestamp, encoded-str, rand-str');
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
  if (req.method === 'OPTIONS'){
    res.sendStatus(200);
  } else{
    next();
  }
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));

app.use('/judge', judgeRouter);
app.use('/cgi', cgiRouter);

// catch 404 and forward to error handler
app.use(function(req, res) {
  res.status(404);
  res.end('bad request');
});


module.exports = app;
