const _ = require('lodash');
const helper = require('./helper');
const {validationError} = require('../validationError');

/**
 * Redirects the different Integer formats to their respective validation methods. For now, all types of Integer
 * are validated the same way, with the exception of int64 as that is validated like a Number.
 *
 * @memberOf Validation.Parameters
 * @method Validate_Integer_Formats
 * @param {Object} schema The Swagger param that was created for this operation
 * @param {Object} value The value that is passed in along the req (via body, header, etc.)
 * @returns {Array} An empty Array if the <tt>value</tt> was "nothing" and not required, else an array
 * containing an object with either an error property (which contains an Array of Error objects)
 * or a value property that contains the value parsed successfully.
 */
function validateInteger({schema, value, models, validationContext, validationSettings}) {
  if (schema.format &&
    !validationSettings.allowNumberFormatsWithNoEquivalentRepresentationInJavascript &&
    validationSettings.throwErrorsWhenSchemaIsInvalid
  ) {
    throw new Error(`Swagger schema is invalid: integer has format "${schema.format}", but integer formats are not supported by this library.  Omit the format and use 'type: "integer"' instead.`);
  }

  if (schema.format && !['int32', 'int64'].includes(schema.format)) {
    if (validationSettings.throwErrorsWhenSchemaIsInvalid) {
      throw new Error(`Swagger schema is invalid: integer has unsupported format "${schema.format}"`);
    } else {
      return validationError({
        message: `Unknown param type ${schema.format}`,
        context: validationContext
      });
    }
  }

  const isRequired = helper.isRequired({schema, value, validationContext, validationSettings});
  if (isRequired) {
    return isRequired;
  }

  let isNumber = typeof value === 'number';

  if (validationSettings.allowNumbersToBeStrings) {
    // Legacy behaviour.
    // Calling Number constructor inadvertently casts empty arrays / booleans / "empty" strings
    // to 0, so checking if value is an array / boolean /  "empty" string explicitly.
    isNumber = !(_.isArray(value) || _.isBoolean(value) || (_.isString(value) && value.trim() === ''));
  }

  const type = schema.format ? schema.format : schema.type;
  const valueAsNumber = Number(value);

  if (!Number.isInteger(valueAsNumber) || !isNumber) {
    return validationError({
      message: `${schema.name} is not a type of ${type}`,
      context: validationContext
    });
  }

  if (schema.minimum !== undefined) {
    var min = Number(schema.minimum);
    if (min > valueAsNumber) {
      return validationError({
        message: `${schema.name} is below the minimum value`,
        context: validationContext
      });
    }
  }

  if (schema.maximum !== undefined) {
    var max = Number(schema.maximum);
    if (max < valueAsNumber) {
      return validationError({
        message: `${schema.name} is above the maximum value`,
        context: validationContext
      });
    }
  }

  return helper.successReturn(valueAsNumber);
}

module.exports = validateInteger;
