const helper = require('./helper');

/**
 * There is no validation to be done for this type, but it is valid.
 *
 * If "nothing" was passed into the validate function and it's required with no default value,
 * then this will throw a parameter is required error.
 *
 * @memberOf Validation.Parameters
 * @method Validate_Byte
 * @param {Object} schema The Swagger param that was created for this operation
 * @param {Object} value The value that is passed in along the req (via body, header, etc.)
 * @returns {Array} An empty Array if the <tt>value</tt> was "nothing" and not required, else an array
 * containing an object with either an error property (which contains an Array of Error objects)
 * or a value property that contains the value passed in unmodified.
 */
function validateByte({schema, value, models, validationContext, validationSettings}) {
  return helper.successReturn(value);
}

module.exports = validateByte;
