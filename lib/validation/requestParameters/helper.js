/**
 * Gets the value to be passed back in the req if <tt>spec.validation.replaceValues === true</tt>.
 *
 * @memberOf Validation.ParamTypes
 * @method Validate_ParamType
 * @param {Object} schema The Swagger param that was created for this operation
 * @param {Object} validationResults The value that was returned from the paramType and parameter validation
 * @returns {Object} The values that was returned from the paramType and parameter validation,
 * else the default value if specified, else undefined.
 */
function getTransformedValue(schema, validationResults) {
  const newValue = validationResults[0]?.value;
  return newValue || schema.defaultValue || undefined; // This is probably buggy.  What if 'newValue' is 'false' or '0'?
}

function getOwnPropertyValue(object, propertyName) {
  return Object.hasOwn(object, propertyName) ? object[propertyName] : undefined;
}

module.exports = {
  getTransformedValue,
  getOwnPropertyValue
};
