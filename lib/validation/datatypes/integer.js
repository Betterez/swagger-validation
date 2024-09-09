const _ = require('lodash');
const helper = require('./helper');
const {validationError, errorCodes} = require('../errors');

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
        code: errorCodes.BAD_INTEGER_FORMAT,
        format: schema.format,
        validationContext,
        validationSettings
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

  if (!isNumber) {
    return validationError({
      code: errorCodes.VALUE_IS_NOT_A_NUMBER,
      propertyName: schema.name,
      value,
      dataType: type,
      validationContext,
      validationSettings
    });
  }

  const valueAsNumber = Number(value);

  if (!Number.isInteger(valueAsNumber)) {
    return validationError({
      code: errorCodes.NUMBER_IS_NOT_AN_INTEGER,
      propertyName: schema.name,
      value,
      dataType: type,
      validationContext,
      validationSettings
    });
  }

  if (schema.minimum !== undefined) {
    const minimumValue = Number(schema.minimum);
    if (valueAsNumber < minimumValue) {
      return validationError({
        code: errorCodes.NUMBER_IS_BELOW_MINIMUM_VALUE,
        propertyName: schema.name,
        value,
        threshold: minimumValue,
        validationContext,
        validationSettings
      });
    }
  }

  if (schema.maximum !== undefined) {
    const maximumValue = Number(schema.maximum);
    if (valueAsNumber > maximumValue) {
      return validationError({
        code: errorCodes.NUMBER_IS_ABOVE_MAXIMUM_VALUE,
        propertyName: schema.name,
        value,
        threshold: maximumValue,
        validationContext,
        validationSettings
      });
    }
  }

  return helper.successReturn(valueAsNumber);
}

module.exports = validateInteger;
