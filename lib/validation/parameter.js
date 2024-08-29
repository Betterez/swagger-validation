/** @namespace Validation */
const datatypeValidators = require('./datatypes');

function noopValidator() {
  return [];
}

function selectValidationFunction(schema) {
  switch (schema.$ref || schema.type?.toLowerCase()) {
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
    case 'void':
      return noopValidator;
    default:
      return datatypeValidators.object;
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
function validateParameter(schema, value, models, validationContext) {
  if (Array.isArray(schema.oneOf)) {
    const validationResults = [];

    schema.oneOf.forEach((oneOf) => {
      const schemaForType = {
        ...schema,
        type: oneOf.type
      }
      const validationFunction = selectValidationFunction(schemaForType);
      validationResults.push(...validationFunction(schemaForType, value, models, validationContext));
    });

    const success = validationResults.filter((result) => {
      return result.error === undefined;
    });

    if (success.length > 0) {
      return success;
    } else {
      return validationResults;
    }
  } else {
    const validationFunction = selectValidationFunction(schema);
    return validationFunction(schema, value, models, validationContext);
  }
}

module.exports = {
  validateParameter
};
