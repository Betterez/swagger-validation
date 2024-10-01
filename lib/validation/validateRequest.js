const _ = require('lodash');
const requestValidators = require('./requestParameters');
const {getValidationSettings} = require('./validationSettings');
const {ValidationContext} = require('./validationContext');
const {ValidationLogs} = require('./validationLogs');
const {dataSource} = require('./dataSource');

function selectValidationFunctionForDataSource(parameterType) {
  switch (parameterType) {
    case dataSource.QUERY:
      return requestValidators.query;
    case dataSource.PATH:
      return requestValidators.path;
    case dataSource.BODY:
      return requestValidators.body;
    case dataSource.FORM:
    case dataSource.FORM_DATA:
      return requestValidators.form;
    case dataSource.HEADER:
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
function validateRequest(requestSchema, req, models = {}, options = {}) {
  const _models = _.cloneDeep(models);
  const validationSettings = getValidationSettings({...requestSchema.validation, ...options});
  const validationLogs = new ValidationLogs();

  const requestParameters = requestSchema.parameters;
  const validationResults = _.flatMap(requestParameters, (schemaForRequestParameter, key) => {
    if (validationSettings.throwErrorsWhenSchemaIsInvalid &&
      schemaForRequestParameter.hasOwnProperty('type') &&
      schemaForRequestParameter.hasOwnProperty('schema')) {
      throw new Error(`Swagger schema is invalid: request parameter "${schemaForRequestParameter.name}" can have either a "type" or a "schema", but not both.`);
    }

    const dataSource = (schemaForRequestParameter.paramType || schemaForRequestParameter.in || '').toLowerCase();
    const validationFunction = selectValidationFunctionForDataSource(dataSource);
    return validationFunction({
      schema: schemaForRequestParameter,
      req,
      models: _models,
      validationContext: new ValidationContext({dataSource}),
      validationSettings,
      validationLogs
    });
  });

  const validationErrors = validationResults
    .filter(result => result.hasOwnProperty('error'));

  return {errors: validationErrors, logs: validationLogs};
}

module.exports = {
  validateRequest
};
