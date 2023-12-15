'use strict';

var utils = require('../utils/writer.js');
var Query = require('../service/QueryService');

module.exports.loginPOST = function loginPOST (req, res, next) {
  Query.loginPOST()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
