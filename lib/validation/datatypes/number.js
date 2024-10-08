const _ = require('lodash');
const helper = require('./helper');
const {validationError, errorCodes} = require('../errors');

/**
 * Ensures that the <tt>value</tt> that is passed in is a valid number (or a number with a formats of int32, double, float, or long
 * or a integer with a format of int64). This allows all forms of a number (so 2, 2.0, 2.2, 2e0, 0x2). As a hex
 * value COULD be the hex representation of an actual number (and JavaScript parses it for us anyway), allow JavaScript
 * to treat hex numbers in the way it wants to. Additionally, if a minimum or maximum is defined for this <tt>param</tt>
 * ensure that the value is greater than the minimum (if minimum defined) or less than the maximum (if maximum defined).
 *
 * This allows numbers between <tt>Number.MIN_VALUE</tt> and <tt>Number.MAX_VALUE</tt> (both inclusive).
 * This does have issues with edge cases, however, (such as Number.MAX_VALUE + 1) as, per IEEE-754 2008 §4.3.1 spec,
 * JavaScript does rounding during addition, so essentially, Number.MAX_VALUE + 1 will equal Number.MAX_VALUE not
 * Number.Infinity. There isn't anything we can do about this as it is correct, per spec, but it isn't intuitive.
 *
 * If "nothing" was passed into the validate function and it's required with no default value,
 * then this will throw a parameter is required error.
 *
 * @memberOf Validation.Parameters
 * @method Validate_Number
 * @param {Object} schema The Swagger param that was created for this operation
 * @param {Object} value The value that is passed in along the req (via body, header, etc.)
 * @returns {Array} An empty Array if the <tt>value</tt> was "nothing" and not required, else an array
 * containing an object with either an error property (which contains an Array of Error objects)
 * or a value property that contains the value parsed successfully.
 */
function validateNumber({schema, value, models, validationContext, validationSettings}) {
  if (schema.format &&
    !validationSettings.allowNumberFormatsWithNoEquivalentRepresentationInJavascript &&
    validationSettings.throwErrorsWhenSchemaIsInvalid
  ) {
    throw new Error(`Swagger schema is invalid: number has format "${schema.format}", but number formats are not supported by this library.  Omit the format and use 'type: "number"' instead.`);
  }

  if (schema.format && !['float', 'double'].includes(schema.format)) {
    if (validationSettings.throwErrorsWhenSchemaIsInvalid) {
      throw new Error(`Swagger schema is invalid: number has unsupported format "${schema.format}"`);
    } else {
      return validationError({
        code: errorCodes.BAD_NUMBER_FORMAT,
        format: schema.format,
        validationContext,
        validationSettings
      });
    }
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

  if (!isNumber || isNaN(valueAsNumber) || !isFinite(valueAsNumber)) {
    return validationError({
      code: errorCodes.VALUE_IS_NOT_A_NUMBER,
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

module.exports = validateNumber;
