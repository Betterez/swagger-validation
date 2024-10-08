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
function validateRequestBody({schema, req, models, validationContext, validationSettings, validationLogs}) {
  let value = req.body;
  const bodyContainsParameter = Object.hasOwn(req.body, schema.name);

  if (validationSettings.requestBodyCanHaveTwoContradictorySchemas) {
    value = bodyContainsParameter ? req.body[schema.name] : _.isEmpty(req.body) ? undefined : req.body;
  }

  // OpenAPI v2 allows you to declare the body's schema in the "schema" property.
  // OpenAPI v3 handles request body schemas differently, and this code would need to be changed to support the v3 spec
  const schemaForBody = {
    ...(schema.schema ?? schema),
    name: schema.name
  };

  const validationResult = validateParameter({
    schema: schemaForBody,
    value,
    isRequired: true, // Per the OpenAPI spec, a body parameter is always required when it is present
    models,
    validationContext,
    validationSettings,
    validationLogs
  });

  if (!validationResult.some((result) => result.hasOwnProperty('error'))) {
    if (validationSettings.replaceValues) {
       if (bodyContainsParameter && validationSettings.requestBodyCanHaveTwoContradictorySchemas) {
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
