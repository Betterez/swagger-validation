const _ = require('lodash');
const {validateRequestParameter} = require('./requestContent');
const requestValidators = require("./requestParameters");

/**
 * Applies default values to the validation object in the <tt>spec</tt>.
 *
 * @memberOf Validation.ParamTypes
 * @method Get_Validation_Settigns
 * @param {Object} [validationSettings] Optionally, the validation object that is defined as part of this Swagger API definition
 * @returns {Object} An object that contains the values passed in on <tt>spec.validation</tt>,
 * plus any defaults for missing values
 */
function getValidationSettings(validationSettings = {}) {
  return {
    replaceValues: validationSettings.hasOwnProperty('replaceValues') ? validationSettings.replaceValues : true
  };
};

/**
 * Validates the <tt>req</tt> against the <tt>spec</tt> that was defined.
 * @memberOf Validation
 * @method Validate
 * @param {Object} spec The specification that this is validating
 * @param {Object} req The request that this is validating. Any date/date-time values specified in the spec
 * will be automatically converted to Date objects if they pass validation.
 * @param {Object} [models] Optionally, the models that are defined as part of this Swagger API definition
 * @returns {Array} An empty array if there were no validation errors or an array of objects with error properties
 * if there are one or more validation errors.
 */
function validateRequest(spec, req, models) {
  const _models = _.cloneDeep(models);
  const validationSettings = getValidationSettings(spec.validation);

  const requestSchema = spec.parameters || spec.properties;
  const validationResults = _.flatMap(requestSchema, (parameterSchema, key) => {
    return validateRequestParameter(parameterSchema, req, _models, validationSettings, key);
  });

  const validationErrors = validationResults
    .filter(result => result.hasOwnProperty('error'));

  return validationErrors;
}

function validateAgainstSchema(schema, value, models) {
  const _models = _.cloneDeep(models);
  const validationSettings = getValidationSettings(schema.validation);

  const validationResults = _.flatMap(schema.properties, (parameterSchema, key) => {
    return requestValidators.rootObject(parameterSchema, key, value, _models, validationSettings)
  });

  const validationErrors = validationResults
    .filter(result => result.hasOwnProperty('error'));

  return validationErrors;
}

module.exports = {
  validateRequest,
  validateAgainstSchema
};
