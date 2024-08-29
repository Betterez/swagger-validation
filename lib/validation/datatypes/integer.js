const _ = require('lodash');
const helper = require('./helper');
const {validationError} = require('../validationError');

/**
 * Checks if something is an int64.
 * @method isInt64
 * @param {Object} nVal The value to be checked
 * @returns {Boolean} True if <tt>nVal</tt> can successfully be parsed as an int64, else false.
 */
function isInt64(nVal) {
  return typeof nVal === "number" && isFinite(nVal) && Math.floor(nVal) === nVal;
}

/**
 * Ensures that the <tt>value</tt> that is passed in is a valid integer with a format of int64.
 * This allows all forms of a number (so 2, 2.0, 2e0, 0x2). As a hex value COULD be the hex representation
 * of an actual integer (and JavaScript parses it for us anyway), allow JavaScript to treat hex numbers in the
 * way it wants to. Additionally, if a minimum or maximum is defined for this <tt>param</tt> ensure that the
 * value is greater than the minimum (if minimum defined) or less than the maximum (if maximum defined).
 *
 * This allows numbers between <tt>Number.MIN_VALUE</tt> (exclusive) and <tt>Number.MAX_VALUE</tt> (inclusive).
 * This does have issues with edge cases, however, (such as Number.MAX_VALUE + 1) as, per IEEE-754 2008 §4.3.1 spec,
 * JavaScript does rounding during addition, so essentially, Number.MAX_VALUE + 1 will equal Number.MAX_VALUE not
 * Number.Infinity. There isn't anything we can do about this as it is correct, per spec, but it isn't intuitive.
 *
 * If "nothing" was passed into the validate function and it's required with no default value,
 * then this will throw a parameter is required error.
 *
 * @memberOf Validation.Parameters
 * @method Validate_Int64
 * @param {Object} schema The Swagger param that was created for this operation
 * @param {Object} value The value that is passed in along the req (via body, header, etc.)
 * @returns {Array} An empty Array if the <tt>value</tt> was "nothing" and not required, else an array
 * containing an object with either an error property (which contains an Array of Error objects)
 * or a value property that contains the value parsed successfully.
 */
function validateInt64(schema, value, models, validationContext) {
  var type = schema.format ? schema.format : schema.type;
  var isRequired = helper.isRequired(schema, value, validationContext);
  if (isRequired) {
    return isRequired;
  }

  // Calling Number constructor inadvertently casts empty arrays / booleans / "empty" strings
  // to 0, so checking if value is an array / boolean /  "empty" string explicitly.
  var val = Number(value);
  if (!isInt64(val) || _.isArray(value) || _.isBoolean(value) || (_.isString(value) && value.trim() === '')) {
    return validationError({
      message: `${schema.name} is not a type of ${type}`,
      context: validationContext
    });
  }

  if (schema.minimum !== undefined) {
    var min = Number(schema.minimum);
    if (min > val) {
      return validationError({
        message: `${schema.name} is below the minimum value`,
        context: validationContext
      });
    }
  }

  if (schema.maximum !== undefined) {
    var max = Number(schema.maximum);
    if (max < val) {
      return validationError({
        message: `${schema.name} is above the maximum value`,
        context: validationContext
      });
    }
  }

  return helper.successReturn(val);
};

/**
 * Ensures that the <tt>value</tt> that is passed in is a valid integer (or an integer with a format of int32).
 * This allows all forms of a number (so 2, 2.0, 2e0, 0x2). As a hex value COULD be the hex representation
 * of an actual integer (and JavaScript parses it for us anyway), allow JavaScript to treat hex numbers in the
 * way it wants to. Additionally, if a minimum or maximum is defined for this <tt>param</tt> ensure that the
 * value is greater than the minimum (if minimum defined) or less than the maximum (if maximum defined).
 *
 * This allows numbers between -9007199254740991 and +9007199254740991 (both inclusive) per
 * (@link http://people.mozilla.org/~jorendorff/es6-draft.html#sec-number.isinteger).
 *
 * If "nothing" was passed into the validate function and it's required with no default value,
 * then this will throw a parameter is required error.
 *
 * @memberOf Validation.Parameters
 * @method Validate_Integer
 * @param {Object} schema The Swagger param that was created for this operation
 * @param {Object} value The value that is passed in along the req (via body, header, etc.)
 * @returns {Array} An empty Array if the <tt>value</tt> was "nothing" and not required, else an array
 * containing an object with either an error property (which contains an Array of Error objects)
 * or a value property that contains the value parsed successfully.
 */
function validateInt32(schema, value, models, validationContext) {
  var type = schema.format ? schema.format : schema.type;
  var isRequired = helper.isRequired(schema, value, validationContext);
  if (isRequired) {
    return isRequired;
  }

  // Calling Number constructor inadvertently casts empty arrays / booleans / "empty" strings
  // to 0, so checking if value is an array / boolean /  "empty" string explicitly.
  var val = Number(value);
  if (!Number.isInteger(val) || _.isArray(value) || _.isBoolean(value) || (_.isString(value) && value.trim() === '')) {
    return validationError({
      message: `${schema.name} is not a type of ${type}`,
      context: validationContext
    });
  }

  if (schema.minimum !== undefined) {
    var min = Number(schema.minimum);
    if (min > val) {
      return validationError({
        message: `${schema.name} is below the minimum value`,
        context: validationContext
      });
    }
  }

  if (schema.maximum !== undefined) {
    var max = Number(schema.maximum);
    if (max < val) {
      return validationError({
        message: `${schema.name} is above the maximum value`,
        context: validationContext
      });
    }
  }

  return helper.successReturn(val);
}

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
function validateInteger(schema, value, models, validationContext) {
  var type = schema.format ? schema.format.toLowerCase() : schema.type.toLowerCase();
  switch (type) {
    case 'int32':
    case 'integer':
      return validateInt32(schema, value, models, validationContext);
    case 'int64':
      return validateInt64(schema, value, models, validationContext);
    default:
      return validationError({
        message: `Unknown param type ${type}`,
        context: validationContext
      });
  }
}

module.exports = validateInteger;
