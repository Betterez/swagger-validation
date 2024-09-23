const _ = require('lodash');
const {errorCodes, validationError} = require('../errors');
const {RECOGNIZED_SCHEMA_TYPES} = require('../constants');

/**
 * Used by the {@link Validation.Parameters} to indicate that a particular <tt>value</tt> passed validation.
 * Everything returns an array as object and arrays can have multiple messages returned.
 *
 * @memberOf Validation.Parameters
 * @method Return_Success
 * @param {Object} value The successfully parsed and validated value.
 * @returns {Array} An array containing an object with a value property that contains the value parsed successfully. This is done as
 * an array can validate uniqueness (but it let's each individual validation method handle it's own conversion so as not to duplicate effort).
 */
function successReturn(value) {
  return [{value}];
}

function isString(value) {
  return typeof value === 'string' || value instanceof String;
}

function validateNullability({schema, value, models, validationContext, validationSettings}) {
  const nullValuesAreNotAllowed = schema.nullable === false ||
    (!validationSettings.allPropertiesAreNullableByDefault && schema.nullable !== true);

  if (value === null && nullValuesAreNotAllowed) {
    return validationError({
      code: errorCodes.VALUE_CANNOT_BE_NULL,
      propertyName: schema.name,
      validationContext,
      validationSettings
    });
  }
}

function validateExistence({schema, value, models, validationContext, validationSettings}) {
  const treatEmptyStringsLikeUndefinedValues =
    validationSettings.treatEmptyStringsLikeUndefinedValues && typeof schema.minLength !== 'number';

  if (value === undefined || value === null || (value === '' && treatEmptyStringsLikeUndefinedValues)) {
    return validationError({
      code: errorCodes.VALUE_IS_REQUIRED,
      propertyName: schema.name,
      validationContext,
      validationSettings
    });
  }
}

function schemaHasPrimitiveType(schema) {
  return RECOGNIZED_SCHEMA_TYPES.includes(schema.type);
}

function resolveSchema({schema, models, validationContext, validationSettings}) {
  if (schema.type && schema.$ref && validationSettings.throwErrorsWhenSchemaIsInvalid) {
    throw new Error('Swagger schema is invalid: A schema can have either a "type" or a "$ref", but not both.');
  }

  if (!schema.$ref && (schemaHasPrimitiveType(schema) || schema.oneOf)) {
    // We don't need to resolve the schema any further
    return {schema, validationContext};
  }

  if (!validationSettings.allowSchemasWithInvalidTypesAndTreatThemLikeRefs && schema.type && !schemaHasPrimitiveType(schema)) {
    if (validationSettings.throwErrorsWhenSchemaIsInvalid) {
      throw new Error(`Swagger schema is invalid: ${validationContext.formatModelPath()} has bad type "${schema.type}".  Allowed types are: ${RECOGNIZED_SCHEMA_TYPES.join(", ")}`);
    } else {
      return {
        error: validationError({
          code: errorCodes.SCHEMA_HAS_INVALID_TYPE,
          schemaType: schema.type,
          validationContext,
          validationSettings
        })
      };
    }
  }

  // Legacy behaviour: The schema "type" may actually refer to another model, like a $ref
  const modelName = schema.$ref || schema.type;
  const schemaIsKnown = models.hasOwnProperty(modelName);

  if (!schemaIsKnown) {
    if (validationSettings.throwErrorsWhenSchemaIsInvalid) {
      throw new Error(`Swagger schema is invalid: ${validationContext.formatModelPath()} contains unknown reference to model "${modelName}"`);
    } else {
      return {
        error: validationError({
          code: errorCodes.SCHEMA_REFERENCES_UNKNOWN_MODEL,
          modelName,
          validationContext,
          validationSettings
        })
      };
    }
  }

  const {schema: resolvedSchema, validationContext: newValidationContext, error} = resolveSchema({
    schema: models[modelName],
    models,
    validationContext: validationContext.descendIntoModel(modelName),
    validationSettings
  });

  if (error) {
    return {error};
  }

  return {
    schema: {
      ...resolvedSchema,
      name: schema.name
    },
    validationContext: newValidationContext
  };
}

module.exports = {
  successReturn,
  isString,
  validateExistence,
  validateNullability,
  resolveSchema
};
