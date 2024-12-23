/** @namespace Validation */
const datatypeValidators = require('./datatypes');
const {validateNullability, validateExistence, resolveSchema, successReturn} = require('./datatypes/helper');

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

function validateOneOf({schema, value, models = {}, validationContext, validationSettings, validationLogs}) {
  const validationResultsForAllSchemas = schema.oneOf.map((oneOf) => {
    return validateParameter({
      schema: {...oneOf, name: schema.name},
      isRequired: true,
      value,
      models,
      validationContext,
      validationSettings: {
        ...validationSettings,
        // Turn off settings which might mutate data.  We do not want to mutate data while testing if the value
        // conforms to one of the schemas
        replaceValues: false,
        removeUnrecognizedPropertiesFromObjects: false
      },
      validationLogs
    });
  });

  const indexOfSchemaWhichSucceeded = validationResultsForAllSchemas.findIndex((validationResults) => {
    return validationResults.every(result => result.error === undefined);
  });

  if (indexOfSchemaWhichSucceeded !== -1) {
    return validateParameter({
      schema: {...schema.oneOf[indexOfSchemaWhichSucceeded], name: schema.name},
      isRequired: true,
      value,
      models,
      validationContext,
      validationSettings,
      validationLogs
    });
  } else {
    return validationResultsForAllSchemas.flat();
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
function validateParameter({schema, value, isRequired = false, models = {}, validationContext, validationSettings, validationLogs}) {
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
      validationSettings,
      validationLogs
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

  const valueIsOptional = !isRequired;
  const existenceError = validateExistence({
    schema: resolvedSchema,
    value,
    models,
    validationContext: newValidationContext,
    validationSettings
  });
  if (valueIsOptional && existenceError) {
    // The value does not exist, but it is optional.  Don't validate it any further, and return the value.
    return successReturn(value);
  } else if (existenceError) {
    return existenceError;
  }

  const valueIsExplicitlyNullable = resolvedSchema.nullable === true;
  const valueIsNull = value === null;
  if (valueIsExplicitlyNullable && valueIsNull) {
    return successReturn(value);
  }

  const validationFunction = selectValidationFunction(resolvedSchema);
  return validationFunction({
    schema: resolvedSchema,
    value,
    models,
    validationContext: newValidationContext,
    validationSettings,
    validationLogs
  });
}

module.exports = {
  validateParameter
};
