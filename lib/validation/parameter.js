/** @namespace Validation */
const datatypeValidators = require('./datatypes');
const helper = require('./datatypes/helper');
const {successReturn} = require("./datatypes/helper");
const {validateNullability, validateExistence, resolveSchema} = helper;

function selectValidationFunction(schema) {
  switch (schema.type?.toLowerCase()) {
    case 'array':
      return datatypeValidators.array;
    case 'boolean':
      return datatypeValidators.boolean;
    case 'file':
      return datatypeValidators.file;
    case 'integer':
      return datatypeValidators.integer;
    case 'number':
      return datatypeValidators.number;
    case 'string':
      return datatypeValidators.string;
    case 'object':
      return datatypeValidators.object;
    default:
      // Buggy legacy behaviour.  All schemas with an unknown "type" are validated as if they are objects.
      return datatypeValidators.object;
  }
}

function validateOneOf({schema, value, models = {}, validationContext, validationSettings}) {
  const validationResults = [];

  schema.oneOf.forEach((oneOf) => {
    validationResults.push(...validateParameter({
      schema: {...oneOf, name: schema.name},
      isRequired: true,
      value,
      models,
      validationContext,
      validationSettings
    }));
  });

  const success = validationResults.filter((result) => {
    return result.error === undefined;
  });

  if (success.length > 0) {
    return success;
  } else {
    return validationResults;
  }
}


/**
 * Ensures that the <tt>value</tt> that is passed in on the req is valid based upon the Swagger definition for this operation.
 * @memberOf Validation
 * @method Validate_Parameter
 * @param {Object} schema The Swagger param that was created for this operation
 * @param {Object} value The value that is passed in along the req (via body, header, etc.)
 * @param {Object} [models] Optionally, the models that are defined as part of this Swagger API definition
 * @returns {Array} An empty Array if the <tt>value</tt> was "nothing" and not required, else an array
 * containing an object with either an error property (which contains an Array of Error objects)
 * or a value property that contains the value, parsed successfully if validation knows how, else the value unmodified.
 */
function validateParameter({schema, value, isRequired = false, models = {}, validationContext, validationSettings}) {
  const {schema: resolvedSchema, validationContext: newValidationContext, error} = resolveSchema({
    schema,
    models,
    validationContext,
    validationSettings
  });
  if (error) {
    return error;
  }

  if (isRequired && schema.defaultValue !== undefined && validationSettings.throwErrorsWhenSchemaIsInvalid) {
    throw new Error(`Swagger schema is invalid: property "${newValidationContext.formatDataPath()}" is required, but also has a default value.  A required property cannot have a default value.`);
  }

  if (Array.isArray(resolvedSchema.oneOf)) {
    return validateOneOf({
      schema: resolvedSchema,
      value,
      models,
      validationContext: newValidationContext,
      validationSettings
    });
  }

  const nullabilityError = validateNullability({
    schema: resolvedSchema,
    value,
    models,
    validationContext: newValidationContext,
    validationSettings
  });
  if (nullabilityError) {
    return nullabilityError;
  }

  const propertyIsOptional = !isRequired;
  const existenceError = validateExistence({
    schema: resolvedSchema,
    value,
    models,
    validationContext: newValidationContext,
    validationSettings
  });
  if (propertyIsOptional && existenceError) {
    // The value does not exist, but it is optional.  Don't validate it any further, and return the value.
    return successReturn(value);
  } else if (existenceError) {
    return existenceError;
  }

  const validationFunction = selectValidationFunction(resolvedSchema);
  return validationFunction({
    schema: resolvedSchema,
    value,
    models,
    validationContext: newValidationContext,
    validationSettings
  });
}

module.exports = {
  validateParameter
};
