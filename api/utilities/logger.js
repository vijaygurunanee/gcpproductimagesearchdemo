'use strict';

const winston = require("winston");

// setting up the logger for whole application
const loggerobj = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
      //
      // - Write to all logs with level `info` and below to `combined.log` 
      // - Write all logs error (and below) to `error.log`.
      //
      new winston.transports.File({ filename: 'error.log', level: 'error' }),
      new winston.transports.File({ filename: 'combined.log' })
    ]
});

module.exports = {
    logerror : function (msg, obj) {
        msg = msg + " : %o"
        loggerobj.error(msg, JSON.stringify(obj));
    },
    
    logwarning : function (msg, obj) {
        msg = msg + " : %o"
        loggerobj.warn(msg, JSON.stringify(obj));
    },
    
    loginfo : function (msg) {
        loggerobj.info(msg);
    }
};