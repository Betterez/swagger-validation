'use strict';

var _ = require('lodash');
var helper = require('./helper');
/**
 * Validates any object against a set of rules or a model.
 * Allows to validate a standalone object outside a request.
 *
 * @memberOf Validation.ParamTypes
 * @method Validate_RootObject
 * @param {Object} param The Swagger param that was created for this operation
 * @param {Object} obj The object that under validation
 * @param {Object} [models] Optionally, the models that are defined as part of this Swagger API definition
 * @param {Object} validationObj The validation object that is defined as part of this Swagger API definition
 * @returns {Array} An empty Array if the <tt>value</tt> was "nothing" and not required, else an array
 * containing an object with either an error property (which contains an Array of Error objects)
 * or a value property that contains the value, parsed successfully if validation knows how, else the value unmodified.
 */
var rootObject = function(param, obj, models, validationObj) {
  var hasParam = _.has(obj, param.name);
  var value = hasParam ? obj[param.name] : _.isEmpty(obj) ? undefined : obj;
  var ret = helper.paramType(param, value, models, false);

  if (!_.some(ret, function(val) { return val.hasOwnProperty('error'); })) {
    if (validationObj.replaceValues) {
       if(hasParam){
         obj[param.name] = helper.getValue(param, ret);
       }
       else{
         obj = helper.getValue(param, ret);
       }
    }
  }
  return ret;
};

module.exports = exports = rootObject;