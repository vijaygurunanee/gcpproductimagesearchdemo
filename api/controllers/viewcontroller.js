'use strict';

const path = require('path');

exports.homepage = function (req, res) {
    res.header('Content-Type', 'text/html').sendFile(path.resolve('api/views') + '/index.html');
}