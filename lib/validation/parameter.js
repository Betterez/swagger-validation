/** @namespace Validation */
const parameters = require('./parameters');

function noopValidator() {
  return [];
}

function selectValidationFunction(schema) {
  switch (schema.$ref || schema.type?.toLowerCase()) {
    case "array":
      return parameters.array;
    case "boolean":
      return parameters.boolean;
    case "file":
      return parameters.file;
    case 'integer':
      return parameters.integer;
    case "number":
      return parameters.number;
    case 'string':
      return parameters.string;
    case 'void':
      return noopValidator;
    default:
      return parameters.object;
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
function validateParameter(schema, value, models) {
  if (Array.isArray(schema.oneOf)) {
    const results = [];
    schema.oneOf.forEach((oneOf) => {
      schema.type = oneOf.type;
      const validationFunction = selectValidationFunction(schema);
      results.push(...validationFunction(schema, value, models));
    });
    const success = results.filter((result) => {
      return result.error === undefined;
    });
    if (success.length > 0) {
      return success;
    } else {
      return results;
    }
  } else {
    const validationFunction = selectValidationFunction(schema);
    return validationFunction(schema, value, models);
  }
}

module.exports = {
  validateParameter
};
