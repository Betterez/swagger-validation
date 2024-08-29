const _ = require('lodash');
const requestValidators = require('./requestParameters');
const {getValidationSettings} = require('./validationSettings');
const {ValidationContext} = require('./validationContext');

function selectValidationFunctionForRequestParameter(parameterType) {
  switch (parameterType) {
    case 'q':
    case 'query':
      return requestValidators.query;
    case 'path':
      return requestValidators.path;
    case 'body':
      return requestValidators.body;
    case 'form':
    case 'formdata':
      return requestValidators.form;
    case 'header':
      return requestValidators.header;
    default:
      throw new Error(`Unrecognized request parameter: "${parameterType}"`);
  }
}

/**
 * Validates the <tt>req</tt> against the <tt>spec</tt> that was defined.
 * @memberOf Validation
 * @method Validate
 * @param {Object} requestSchema The specification that this is validating
 * @param {Object} req The request that this is validating. Any date/date-time values specified in the spec
 * will be automatically converted to Date objects if they pass validation.
 * @param {Object} [models] Optionally, the models that are defined as part of this Swagger API definition
 * @returns {Array} An empty array if there were no validation errors or an array of objects with error properties
 * if there are one or more validation errors.
 */
function validateRequest(requestSchema, req, models) {
  const _models = _.cloneDeep(models);
  const validationSettings = getValidationSettings(requestSchema.validation);

  const requestParameters = requestSchema.parameters;
  const validationResults = _.flatMap(requestParameters, (schemaForRequestParameter, key) => {
    const parameterType = (schemaForRequestParameter.paramType || schemaForRequestParameter.in || '').toLowerCase();
    const validationFunction = selectValidationFunctionForRequestParameter(parameterType);
    return validationFunction({
      schema: schemaForRequestParameter,
      req,
      models: _models,
      validationSettings,
      validationContext: new ValidationContext([parameterType]),
    });
  });

  const validationErrors = validationResults
    .filter(result => result.hasOwnProperty('error'));

  return validationErrors;
}

module.exports = {
  validateRequest
};
