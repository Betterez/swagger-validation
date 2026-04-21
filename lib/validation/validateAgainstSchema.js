const {cloneDeep, flatMapObject} = require('./native-utils');
const {getValidationSettings} = require('./validationSettings');
const {validateRootObject} = require('./requestParameters/rootObject');
const {ValidationLogs} = require('./validationLogs');

/**
 * Validates arbitrary data against a Swagger schema.
 */
function validateAgainstSchema(schema, value, models = {}, options = {}) {
  const _models = cloneDeep(models);
  const validationSettings = getValidationSettings({...schema.validation, ...options});
  const validationLogs = new ValidationLogs();

  const validationResults = flatMapObject(schema.properties, (parameterSchema, key) => {
    return validateRootObject({
      schema: parameterSchema,
      key,
      value,
      models: _models,
      validationSettings,
      validationLogs
    });
  });

  const validationErrors = validationResults
    .filter(result => result.hasOwnProperty('error'));

  return {errors: validationErrors, logs: validationLogs};
}

module.exports = {
  validateAgainstSchema
};
