'use strict';

var utils = require('../utils/writer.js');
var Front = require('../service/FrontService');

module.exports.getLoginPage = function getLoginPage (req, res, next) {
  Front.getLoginPage()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
