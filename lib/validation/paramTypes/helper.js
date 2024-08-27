/**
 * Gets the value to be passed back in the req if <tt>spec.validation.replaceValues === true</tt>.
 *
 * @memberOf Validation.ParamTypes
 * @method Validate_ParamType
 * @param {Object} schema The Swagger param that was created for this operation
 * @param {Object} validationResult The value that was returned from the paramType and parameter validation
 * @returns {Object} The values that was returned from the paramType and parameter validation,
 * else the defaultValue if specified, else undefined.
 */
function getValue(schema, validationResult) {
  const newValue = validationResult[0].value;
  return newValue || schema.defaultValue || undefined; // This is probably buggy.  What if 'newValue' is 'false' or '0'?
}

module.exports = {
  getValue,
};
