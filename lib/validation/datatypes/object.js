const _ = require('lodash');
const helper = require('./helper');
const {validationError, errorCodes} = require('../errors');

/**
 * Ensures that the <tt>value</tt> that is passed in is a valid Object by iterating through each property on the
 * associated model and calling out to the respective validation method to validate that property.
 *
 * If "nothing" was passed into the validate function and it's required with no default value,
 * then this will throw a parameter is required error.
 *
 * @memberOf Validation.Parameters
 * @method Validate_Object
 * @param {Object} schema The Swagger param that was created for this operation
 * @param {Object} value The value that is passed in along the req (via body, form, etc.)
 * @param {Object} models Any models that are defined for this API
 * @returns {Array} An empty Array if the <tt>value</tt> was "nothing" and not required, else an array
 * containing an object with either an error property (which contains an Array of Error objects)
 * or a value property that contains the value with JSON.stringify() called on it.
 */
function validateObject({schema, value, models, validationContext, validationSettings}) {
  // This is imported late due to a circular dependency.
  const {validateParameter} = require('../parameter');

  const isRequired = helper.isRequired({schema, value, validationContext, validationSettings});
  if (isRequired) {
    return isRequired;
  }

  if (!_.isPlainObject(value)) {
    return validationError({
      code: errorCodes.VALUE_IS_NOT_AN_OBJECT,
      propertyName: schema.name,
      value,
      validationContext,
      validationSettings
    });
  }

  const errors = [];

  const paramType = schema.$ref || schema.type;
  const model = paramType === 'object' ? schema : models[paramType];

  errors.push(..._validateAdditionalProperties(schema.name, model, value, validationContext, validationSettings));

  Object.entries(model.properties ?? {}).forEach(([propertyName, propertySchema]) => {
    const requiredProperties = Array.isArray(model.required) ? model.required : [];
    const isPropertyRequired = model.required === true || requiredProperties.includes(propertyName);

    if (isPropertyRequired && !value.hasOwnProperty(propertyName)) {
      errors.push(...validationError({
        code: errorCodes.VALUE_IS_REQUIRED,
        propertyName,
        validationContext: validationContext.descendIntoProperty(propertyName),
        validationSettings
      }));
      return;
    } else if (!isPropertyRequired && !value.hasOwnProperty(propertyName)) {
      return;
    }

    const parameterSchema = {
      ...propertySchema,
      name: propertyName,
      required: propertySchema.required ?? isPropertyRequired
    };
    const validationResults = validateParameter({
      schema: parameterSchema,
      value: value[propertyName],
      models,
      validationContext: validationContext.descendIntoProperty(propertyName),
      validationSettings
    });

    // if the return has any error properties, assume this returned errors, not values.
    const validationErrors = validationResults
      .filter(result => result.hasOwnProperty('error'))
      .map(failure => ({
        ...failure,
        path: failure.path ? `${failure.path} - ${paramType}` : `${paramType}`,
        failedValue: failure.failedValue ?? value[propertyName]
      }));

    if (validationErrors.length === 0) {
      value[propertyName] = validationResults[0].value;
    } else {
      errors.push(...validationErrors);
    }
  });

  if (errors.length) {
    return _.sortBy(errors, function(val) { return val.error.message; });
  }
  return helper.successReturn(value);
}

function _validateAdditionalProperties(parentParameterName, model, value, validationContext, validationSettings) {
  if (
    model.additionalProperties === false ||
    (!validationSettings.objectsCanHaveAnyAdditionalPropertiesByDefault && model.additionalProperties !== true)
  ) {
    const allAllowedProperties = Object.keys(model.properties ?? {});
    const allProvidedProperties = Object.keys(value);
    const disallowedProperties = _.without(allProvidedProperties, ...allAllowedProperties);

    if (disallowedProperties.length > 0) {
      return validationError({
        code: errorCodes.OBJECT_CONTAINS_INVALID_PROPERTIES,
        propertyName: parentParameterName,
        disallowedProperties,
        validationContext,
        validationSettings
      });
    }
  }

  return [];
}

/**
 * Redirects to the validate object method if this is a valid object in the model, else error.
 *
 * @memberOf Validation.Parameters
 * @method Validate_Object_Formats
 * @param {Object} schema The Swagger param that was created for this operation
 * @param {Object} value The value that is passed in along the req (via body, header, etc.)
 * @param {Object} models Any models that are defined for this API
 * @returns {Array} An empty Array if the <tt>value</tt> was "nothing" and not required, else an array
 * containing an object with either an error property (which contains an Array of Error objects)
 * or a value property that contains the value parsed successfully.
 */
function validate({schema, value, models, validationContext, validationSettings}) {
  const modelName = schema.$ref || schema.type;
  const schemaIsKnown = models.hasOwnProperty(modelName) || schema.type === 'object';

  if (schemaIsKnown) {
    return validateObject({schema, value, models, validationContext, validationSettings});
  }

  if (validationSettings.throwErrorsWhenSchemaIsInvalid) {
    throw new Error(`Swagger schema is invalid: Unknown reference to model "${modelName}"`);
  } else {
    return validationError({
      code: errorCodes.SCHEMA_REFERENCES_UNKNOWN_MODEL,
      modelName,
      validationContext,
      validationSettings
    });
  }
}

module.exports = exports = validate;
