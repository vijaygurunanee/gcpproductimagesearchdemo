'use strict';

// Imports the Google Cloud client library
const vision = require('@google-cloud/vision').v1p3beta1;
const Storage = require('@google-cloud/storage');
const context = require('../utilities/context');
const config = require('../utilities/config');
const stream = require('stream');
const util = require('util');
const mimeTypes = require('mimetypes');
const fs = require('fs');

const projectId = config.projectId;
const location = config.location;

// Creates a productsearch client
const client = new vision.ProductSearchClient({
  projectId: projectId,
  keyFilename: config.authkeyfile
});

// Creates an image-annotator client
const imageAnnotatorClient = new vision.ImageAnnotatorClient({
  projectId: projectId,
  keyFilename: config.authkeyfile
});

// Resource path that represents Google Cloud Platform location.
const locationPath = client.locationPath(projectId, location);

// endpoint for uploading a product to gc-vision
exports.uploadproduct = function (req, res, next) {

  process.on('unhandledRejection', up => { throw up });

  context.new(req, res);

  var err = isvalidrequest(req);
  
  if(err) {
    res.status(err.status || 500);
    res.json({
      message: err.message,
      error: err
    });
    return res;
  }

  var product = req.body;
  
  var uploadProductTasks = uploadimages(product, next);

  var createTask = createproduct(product, next);
  createTask.then(()=>{
    var associateTask =  associateproductset(product, next);
    uploadProductTasks.push(associateTask);
  });

  Promise.all(uploadProductTasks)
    .then(() => {  
      addreferencetoimages(product, res, next);
    });
};

// endpoint to list the products
exports.listgoogleproducts = function (req, res, next) {
  context.new(req, res);

  client
  .listProducts({parent: locationPath})
  .then(results => {
    return res.json(results[0]);
  })
  .catch(err => {
    next(err);
  });
}

exports.getallproducts = function (req, res, next) {
  context.new(req, res);
  var productlist = extractallproductsfromfolder();
  
  var products = [];
  for (var key in productlist) {
      products.push(productlist[key]);
  }

  return res.json(products);
}

function extractallproductsfromfolder() {
  var productlist = {};
  var files = fs.readdirSync('../product-search-api/api/views/product-images/');
  
  for(var i=0;i<files.length;i++) {

      var filename = files[i].split("-")[1];
      var productname = filename.split(".")[0];

      var image = {
          filename: files[i]
      };

      if(!productlist[productname]) {
          var product = {
              productid: productname,
              productdisplayname: productname,
              images:[]
          };
          product.images.push(image);
          productlist[productname] = product;
      } else {
          productlist[productname].images.push(image);
      }
  }

  return productlist;
}

// endpoint to delete the product.
exports.deleteproduct = function (req, res, next) {
  context.new(req, res);

  if(req.query.productid == '') {
    next(new Error('please pass productid.'));
  }

  // Resource path that represents full path to the product.
  const productPath = client.productPath(projectId, location, productid);
  
  client
    .deleteProduct({name: productPath})
    .then(() => {
      return res.json(true);
    })
    .catch(err => {
      next(err);
    });
}

// endpoint for searching a product to gc-vision
exports.searchproduct = function (req, res, next) {

  context.new(req, res);
    
  if(req.body.constructor === Object && Object.keys(req.body).length === 0) {
    return new Error("Please pass the body to search the product.");
  }

  if(!req.body.data) {
    return new Error("Please pass the image-data to search the product.");
  }
  
  var productSetId = config.defaultproductsetid;
  if(req.query.productsetid) {
    productSetId = req.query.productsetid;
  }

  var productSetPath = client.productSetPath(
    projectId,
    location,
    productSetId
  );

  var content = req.body.data;
  var request = {
    image: {content: content},
    features: [{type: 'PRODUCT_SEARCH'}],
    imageContext: {
      productSearchParams: {
        productSet: productSetPath,
        productCategories: [config.defaultproductcategory],
      },
    },
  };
  
  imageAnnotatorClient
    .batchAnnotateImages({requests: [request]})
    .then(searchresponses => {
      
      var searchresults = [];

      // check if search response has something to show
      if(
          !searchresponses ||
          searchresponses.length == 0 ||
          !searchresponses[0] ||
          !searchresponses[0].responses ||
          searchresponses[0].responses.length == 0
        ) {
          return res.json(searchresults);
        }
        
        var availableproduct = extractallproductsfromfolder();

        searchresponses[0].responses.forEach(response => {

          if(
              !response ||
              !response.productSearchResults ||
              !response.productSearchResults.results ||
              response.productSearchResults.results.length == 0
            ) {
            return;
          }
          
          response.productSearchResults.results.forEach(result => {
            if(!result || !result.product) {
              return;
            }
            
            var product = availableproduct[result.product.displayName];

            searchresults.push(product);

          });
        });

      return res.json(searchresults);
    })
    .catch(err => {
      next(err);
    });
}

// This function will create a product entry in google-cloud-products
function createproduct(product, next) {
  var request = {
    parent: locationPath,
    product: {
                displayName: product.productdisplayname,
                productCategory: config.defaultproductcategory,
              },
    productId: product.productid,
  };

  return new Promise((resolve, reject) => {
    client
      .createProduct(request)
      .then(resolve)
      .catch(err => {
        if(err.message.indexOf('ALREADY_EXISTS') > -1){
          resolve();
        } else {
          next(err);
        }
      });
  });
}

// this function create reference of image to product.
function addreferencetoimages(product, res, next) {

  var formattedparent = client.productPath(projectId, location, product.productid);

  var referenceTasks = product.images.map(
    (image) => new Promise((resolve, reject) => {

      var bucketfile = 'product-images/' + image.filename;
      
      var referenceimage = {
        uri: util.format(config.bucketfileformat, config.bucket, bucketfile)
      };
  
      var request = {
        parent: formattedparent,
        referenceImage: referenceimage,
        referenceImageId: image.filename,
      };
      
      client
        .createReferenceImage(request)
        .then(resolve)
        .catch(err => {
          next(err);
      });
  }));

  Promise.all(referenceTasks)
    .then(() => {
      
      for (var i = 0; i < product.images.length; i++) {
        // strip off the data: url prefix to get just the base64-encoded bytes
        var data = product.images[i].data.replace(/^data:image\/\w+;base64,/, "");
        var buf = new Buffer(data, 'base64');
        var path = './api/views/product-images/' + product.images[i].filename;
        fs.writeFile(path, buf);
        product.images[i].src = '/product-images/' + product.images[i].filename;
      }

      return res.json(product);
    });
}

// this function associate the created product with product-set
function associateproductset(product, next) {
  var productPath = client.productPath(projectId, location, product.productid);
  var productSetPath = client.productSetPath(
    projectId,
    location,
    config.defaultproductsetid
  );

  var request = {
    name: productSetPath,
    product: productPath,
  };

  return new Promise((resolve, reject) => {
    client
      .addProductToProductSet(request)
      .then(resolve)
      .catch(err => {
        next(err);
      });
  });
}

// this function upload images to google-cloud storage bucket.
function uploadimages(product, next) {

  // create google-cloud storage connection object.
  const storage = new Storage.Storage({
    projectId: projectId,
    keyFilename: config.authkeyfile
  });

  // bucket object where file will be stored.
  const bucket = storage.bucket(config.bucket);

  var uploadTasks = product.images.map(
    (image) => new Promise((resolve, reject) => { 
    
      var img = image.data,
          extention = image.filename.split("."),
          mimetype = mimeTypes.detectMimeType(extention[extention.length - 1]),
          gcfile = bucket.file('product-images/' + image.filename);
    
      var bufferStream = new stream.PassThrough();
      bufferStream.end(new Buffer(image.data, 'base64'));
      
      bufferStream.pipe(gcfile.createWriteStream({
        metadata: {
          contentType: mimetype,
        },
        public: true,
        validation: "md5"
      }))
      .on('error', function(err) {
        next(err);
      })
      .on('finish', resolve);
  }));

  return uploadTasks;
}

// this function checks the complete body elements and verify if the values are proper.
function isvalidrequest(req) {
    
  if(req.body.constructor === Object && Object.keys(req.body).length === 0) {
    return new Error("Please pass the body to upload the product.");
  }
  
  var product = req.body;
  
  var invalidorempty = '';
  if(product.productid == '') {
    invalidorempty += 'productid';
  }

  if(product.productdisplayname == '') {
    invalidorempty += ' productdisplayname'
  }

  if(!Array.isArray(product.images) || !product.images.length) {
    invalidorempty += ' images';
  }
  else {
    product.images.forEach(image => {
      if(image.filename == '') {
        invalidorempty += ' filename';
      }
      if(image.type == '') {
        invalidorempty += ' image-type';
      }
      if(image.data == '') {
        invalidorempty += ' imagebytes';
      }
    });
  }
  
  if(invalidorempty != '') {
    return new Error("request body doesn't have : ", invalidorempty);
  }
}