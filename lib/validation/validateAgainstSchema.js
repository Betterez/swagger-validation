const _ = require('lodash');
const {getValidationSettings} = require('./validationSettings');
const {validateRootObject} = require('./requestParameters/rootObject');

/**
 * Validates arbitrary data against a Swagger schema.
 */
function validateAgainstSchema(schema, value, models) {
  const _models = _.cloneDeep(models);
  const validationSettings = getValidationSettings(schema.validation);

  const validationResults = _.flatMap(schema.properties, (parameterSchema, key) => {
    return validateRootObject({
      schema: parameterSchema,
      key,
      value,
      models: _models,
      validationSettings
    });
  });

  const validationErrors = validationResults
    .filter(result => result.hasOwnProperty('error'));

  return validationErrors;
}

module.exports = {
  validateAgainstSchema
};
