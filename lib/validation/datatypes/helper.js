const _ = require('lodash');
const {errorCodes, validationError} = require('../errors');

module.exports = exports = {};

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
exports.successReturn = successReturn;

/**
 * Used by the {@link Validation.Parameters} to determine whether or not a particular <tt>value</tt> is required and not present.
 *
 * @memberOf Validation.Parameters
 * @method Is_Required
 * @param {Object} schema The Swagger param that was created for this operation
 * @param {Object} value The value that is passed in along the req (via body, header, etc.)
 * @returns {Array} If <tt>value</tt> is required, is undefined, null, or an empty string, and there is no defaultValue, this will return the
 * result of {@link Validation.Parameters.Return_Error}. If there is a defaultValue, this will return an empty array, which indicates
 * that the defaultValue will be used, which is not validated. If <tt>value</tt> is not undefined, null, or an empty string,
 * this will return undefined indicating that further validation is required.
 */
function isRequired({schema, value, validationContext, validationSettings}) {
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

  const treatEmptyStringsLikeUndefinedValues =
    validationSettings.treatEmptyStringsLikeUndefinedValues && typeof schema.minLength !== 'number';

  if (_.isUndefined(value) || _.isNull(value) || (value === '' && treatEmptyStringsLikeUndefinedValues)) {
    var isParamRequired = schema.required && !schema.defaultValue;
    return isParamRequired
      ? validationError({
        code: errorCodes.VALUE_IS_REQUIRED,
        propertyName: schema.name,
        validationContext,
        validationSettings
      })
      : successReturn(schema.hasOwnProperty('defaultValue') ? schema.defaultValue : value);
  }
}

function isString(value) {
  return typeof value === 'string' || value instanceof String;
}

exports.isRequired = isRequired;
exports.isString = isString;
