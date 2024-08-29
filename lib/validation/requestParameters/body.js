const _ = require('lodash');
const helper = require('./helper');
const {validateParameter} = require('../parameter');

/**
 * Validates the body of the <tt>req</tt> that called validation.
 *
 * @memberOf Validation.ParamTypes
 * @method Validate_Body
 * @param {Object} schema The Swagger param that was created for this operation
 * @param {Object} req The request that this is validating
 * @param {Object} [models] Optionally, the models that are defined as part of this Swagger API definition
 * @param {Object} validationSettings The validation object that is defined as part of this Swagger API definition
 * @returns {Array} An empty Array if the <tt>value</tt> was "nothing" and not required, else an array
 * containing an object with either an error property (which contains an Array of Error objects)
 * or a value property that contains the value, parsed successfully if validation knows how, else the value unmodified.
 */
function validateRequestBody({schema, req, models, validationSettings, validationContext}) {
  const bodyContainsParameter = Object.hasOwn(req.body, schema.name);

  //TODO: We should not look for the request body in two places
  const value = bodyContainsParameter ? req.body[schema.name] : _.isEmpty(req.body) ? undefined : req.body ;
  const validationResult = validateParameter({schema, value, models, validationContext});

  if (!validationResult.some((result) => result.hasOwnProperty('error'))) {
    if (validationSettings.replaceValues) {
        //TODO: We should not look for the request body in two places
       if (bodyContainsParameter) {
         req.body[schema.name] = helper.getTransformedValue(schema, validationResult);
       }
       else {
         req.body = helper.getTransformedValue(schema, validationResult);
       }
    }
  }

  return validationResult;
}

module.exports = {
  validateRequestBody
};
