'use strict';

exports.registerroutes = function (application) {
  var productsetroutes = require('../controllers/productsetcontroller');
  var productroutes = require('../controllers/productcontroller');
  var viewroutes = require('../controllers/viewcontroller');

  // API Routes
  application.route('/createproductset')
    .get(productsetroutes.createproductset);

  application.route('/listproductset')
    .get(productsetroutes.listproductset);

  application.route('/deleteproductset')
    .get(productsetroutes.deleteproductset);

  application.route('/uploadproduct')
    .post(productroutes.uploadproduct);

  application.route('/listgoogleproducts')
    .get(productroutes.listgoogleproducts);

  application.route('/deleteproduct')
    .get(productroutes.deleteproduct);

  application.route('/searchproduct')
    .post(productroutes.searchproduct);
  
  application.route('/getallproducts')
    .get(productroutes.getallproducts);
  
  application.route('/')
    .get(viewroutes.homepage);
};