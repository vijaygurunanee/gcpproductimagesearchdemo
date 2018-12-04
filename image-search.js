/* Application starting point */
var express = require('express');
var apiroutes = require('./api/routes/apiroutes');
var bodyparser = require('body-parser');
var errorhandler = require('./api/utilities/errorhandler');
var morgan = require('morgan');
var fs = require('fs');
var rfs = require('rotating-file-stream');
var path = require('path');

// main server object
var application = express();

application.use(express.static(path.resolve('api/views')));

/***********request logging set-up**************/
// create a write stream (in append mode)
var logDirectory = 'logs';

// ensure log directory exists
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

// create a rotating write stream
var accessLogStream = rfs('access.log', {
  interval: '1d', // rotate daily
  path: logDirectory
});

morgan.token('uuid', function (req, res) { return req.headers['contextid'] });

var logformat = ":uuid | :date | :method | :url | :status | :remote-addr | :user-agent | :res[content-length] | :response-time";

// setup the logger
application.use(morgan(logformat, { stream: accessLogStream }));
/***********request logging set-up**************/

// body parser registration
application.use(bodyparser.urlencoded({ extended: true }));
application.use(bodyparser.json());

// error handler registration
application.use(errorhandler);

// routes registration
apiroutes.registerroutes(application);

// port registration and starting the server
var port = process.env.PORT || 4000;
application.listen(port);

console.log('image-search server started on: ' + port);