'use strict';

// Imports the Google Cloud client library
const vision = require('@google-cloud/vision').v1p3beta1;
const context = require('../utilities/context');
const config = require('../utilities/config');

const projectId = config.projectId;
const location = config.location;

// Creates a client
var client = new vision.ProductSearchClient({
  projectId: projectId,
  keyFilename: config.authkeyfile
});;

// Resource path that represents Google Cloud Platform location.
const locationPath = client.locationPath(projectId, location);

// Function to create the product set.
exports.createproductset = function (req, res, next) {

  context.new(req, res);

  if(req.query.productsetname == '') {
    next(new Error('please pass productsetname.'));
  }

  if(req.query.productsetid == '') {
    next(new Error('please pass productSetId.'));
  }

  var productSetDisplayName = req.query.productsetname;
  var productSetId = req.query.productsetid;

  var productSet = {
    displayName: productSetDisplayName,
  };

  var request = {
    parent: locationPath,
    productSet: productSet,
    productSetId: productSetId,
  };

  client
    .createProductSet(request)
    .then(results => {
      res.json(results[0]);
    })
    .catch(err => {next(err)});
  };

  // function to retrive the available product sets
exports.listproductset = function (req, res, next) {

  context.new(req, res);

  client
    .listProductSets({parent: locationPath})
    .then(results => {
      res.json(results[0]);
    })
    .catch(err => {next(err)});
};

// Function to delete the product set.
exports.deleteproductset = function (req, res, next) {

  context.new(req, res);

  if(req.query.productSetId == '') {
    next(new Error('please pass productSetId.'));
  }

  var productSetId = req.query.productSetId;

  // Resource path that represents full path to the product set.
  var productSetPath = client.productSetPath(
    projectId,
    location,
    productSetId
  );

  client
    .deleteProductSet({name: productSetPath})
    .then(() => {
      res.send(true);
    })
    .catch(err => {next(err)});
  };