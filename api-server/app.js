'use strict';
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');

/**
 * BearerStrategy
 *
 * This strategy is used to authenticate users based on an access token (aka a
 * bearer token).  The user must have previously authorized a client
 * application, which is issued an access token to make requests on behalf of
 * the authorizing user.
 */
var tokens = {
    'fermat-org': {
        access_token: "561fd1a5032e0c5f7e20387d",
        scope: "*"
    }
};

var BearerStrategy = require('passport-http-bearer').Strategy;

passport.use(new BearerStrategy({
    passReqToCallback: true //allows us to pass back the entire request to the callback
}, function (req, access_token, done) {
    try {
        if (tokens['fermat-org'].access_token === access_token) {
            return done(null, true, tokens['fermat-org'].scope);
        } else {
            return done(null, false, null);
        }
    } catch (err) {
        return done(err, false, null);
    }
}));

var routes = require('./routes/index');
var users = require('./routes/users');
var repo = require('./routes/repo');
var v1 = require('./routes/v1');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(passport.initialize());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function (req, res, next) {
    //res.header("Content-Type",'application/json');
    res.header("Access-Control-Allow-Origin", '*');
    res.header("Access-Control-Allow-Methods", 'GET, POST, PUT');
    res.header("Access-Control-Allow-Headers", 'X-Requested-With, Content-Type');
    //res.header("Access-Control-Allow-Credentials", true);
    next();
});

app.use('/', routes);
//app.use('/users', users);
app.use('/repo', repo);
app.use('/v1', v1);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;