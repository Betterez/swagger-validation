'use strict';

const helper = require('./helper');
const {getOwnPropertyValue} = require('./helper');
const {validateParameter} = require('../parameter');

/**
 * Validates the query string of the <tt>req</tt> that called validation. Additionally, this will honor
 * the allowMultiple flag.
 *
 * @memberOf Validation.ParamTypes
 * @method Validate_Query
 * @param {Object} schema The Swagger param that was created for this operation
 * @param {Object} req The request that this is validating
 * @param {Object} [models] Optionally, the models that are defined as part of this Swagger API definition
 * @param {Object} validationSettings The validation object that is defined as part of this Swagger API definition
 * @returns {Array} An empty Array if the <tt>value</tt> was "nothing" and not required, else an array
 * containing an object with either an error property (which contains an Array of Error objects)
 * or a value property that contains the value, parsed successfully if validation knows how, else the value unmodified.
 */
function validateRequestQueryString(schema, req, models, validationSettings) {
  const value = getOwnPropertyValue(req.query, schema.name);
  const validationResult = validateParameter(schema, value, models);

  if (!validationResult.some((result) => result.hasOwnProperty('error'))) {
    if (validationSettings.replaceValues) {
      req.query[schema.name] = helper.getTransformedValue(schema, validationResult);
    }
  }
  return validationResult;
}

module.exports = {
  validateRequestQueryString
};