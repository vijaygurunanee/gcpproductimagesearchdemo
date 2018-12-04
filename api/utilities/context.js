'use strict';

const uuidv4 = require('uuid/v4');

exports.new = function (req, res) {

    var uuid = uuidv4();

    res.set("Content-Type", 'application/json');
    req.header('contextid', uuid);

}