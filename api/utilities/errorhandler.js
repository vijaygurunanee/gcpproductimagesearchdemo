'use strict';

module.exports = function(err, req, res, next) {

    var logger = require('../utilities/logger');
    
    logger.logerror(err.message,err);

    res.status(500)
    res.render('error', { error: err })

};