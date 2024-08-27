const _ = require('lodash');
const helper = require('./helper');
const {validateParameter} = require("../parameter");

/**
 * Validates any object against a set of rules or a model.
 * Allows to validate a standalone object outside a request.
 *
 * @memberOf Validation.ParamTypes
 * @method Validate_RootObject
 * @param {Object} schema The Swagger param that was created for this operation
 * @param {Object} value The object that under validation
 * @param {Object} [models] Optionally, the models that are defined as part of this Swagger API definition
 * @param {Object} validationSettings The validation settings that are defined as part of this Swagger API definition
 * @returns {Array} An empty Array if the <tt>value</tt> was "nothing" and not required, else an array
 * containing an object with either an error property (which contains an Array of Error objects)
 * or a value property that contains the value, parsed successfully if validation knows how, else the value unmodified.
 */
function validateRootObject({schema, key, value, models, validationSettings}) {
  if (!schema.name) {
    schema.name = key;
  }

  const hasParam = _.has(value, schema.name);
  const parameterValue = hasParam ? value[schema.name] : _.isEmpty(value) ? undefined : value;
  const validationResult = validateParameter(schema, parameterValue, models);

  if (!_.some(validationResult, function(val) { return val.hasOwnProperty('error'); })) {
    if (validationSettings.replaceValues) {
       if (hasParam) {
         value[schema.name] = helper.getTransformedValue(schema, validationResult);
       }
    }
  }

  return validationResult;
}

module.exports = {
  validateRootObject
};
