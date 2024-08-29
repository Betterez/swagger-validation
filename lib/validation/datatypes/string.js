const util = require('node:util');
const validators = require('./index');
const helper = require('./helper');
const {validationError} = require('../validationError');

/**
 * Ensures that the <tt>value</tt> that is passed in is a valid string. Additionally, if an enum is
 * defined for this <tt>param</tt> ensure that the value is inside the enum list (which is case-sensitive).
 *
 * This also ensures that the <tt>value</tt> adheres to the <tt>pattern</tt> specified on the <tt>spec</tt>,
 * if a pattern is specified.
 *
 * Additionally, if a pattern property is defined for this <tt>param</tt>, ensure that the <tt>value</tt>
 * that is passed in matches the <tt>param</tt>'s pattern property. If <tt>param</tt> does not have a pattern
 * property, pattern matching is skipped. If <tt>param</tt> has an invalid pattern property a invalid pattern
 * error is thrown.
 *
 * If "nothing" was passed into the validate function and it's required with no default value,
 * then this will throw a parameter is required error.
 *
 * @memberOf Validation.Parameters
 * @method Validate_String
 * @param {Object} schema The Swagger param that was created for this operation
 * @param {Object} value The value that is passed in along the req (via body, header, etc.)
 * @returns {Array} An empty Array if the <tt>value</tt> was "nothing" and not required, else an array
 * containing an object with either an error property (which contains an Array of Error objects)
 * or a value property that contains the value parsed successfully.
 */
function validateString(schema, value, models, validationContext) {
  var isRequired = helper.isRequired(schema, value, validationContext);
  if (isRequired) {
    return isRequired;
  }

  if (!helper.isString(value)) {
    return validationError({
      message: `${schema.name} is not a type of string`,
      context: validationContext
    });
  }

  if (schema.enum && Array.isArray(schema.enum) && !schema.enum.some(function(val) { return val === value; })) {
    return validationError({
      message: `${schema.name} is not a valid entry`,
      context: validationContext
    });
  }

  if (schema.hasOwnProperty('pattern') && schema.pattern !== null && schema.pattern !== undefined) {
    try {
      if (!helper.isString(schema.pattern)) {
        return validationError({
          message: `${schema.name} is specified with an invalid pattern ${util.inspect(schema.pattern)}`,
          context: validationContext
        });
      }

      const isValid = new RegExp(schema.pattern).test(value);
      if (!isValid) {
        return validationError({
          message: `${schema.name} is not valid based on the pattern ${schema.pattern}`,
          context: validationContext
        });
      }
    }
    catch (err) {
      return validationError({
        message: `${schema.name} is specified with an invalid pattern ${util.inspect(schema.pattern)}`,
        context: validationContext
      });
    }
  }

  if (schema.maxLength && Number.isInteger(schema.maxLength) && value.length > schema.maxLength) {
    return validationError({
      message: `${schema.name} requires a max length of ${schema.maxLength}`,
      context: validationContext
    });
  }

  if (schema.minLength && Number.isInteger(schema.minLength) && value.length < schema.minLength) {
    return validationError({
      message: `${schema.name} requires a min length of ${schema.minLength}`,
      context: validationContext
    });
  }

  return helper.successReturn(value);
};

/**
 * Redirects the different String formats to their respective validation methods.
 *
 * @memberOf Validation.Parameters
 * @method Validate_String_Formats
 * @param {Object} schema The Swagger param that was created for this operation
 * @param {Object} value The value that is passed in along the req (via body, header, etc.)
 * @returns {Array} An empty Array if the <tt>value</tt> was "nothing" and not required, else an array
 * containing an object with either an error property (which contains an Array of Error objects)
 * or a value property that contains the value parsed successfully.
 */
var validate = function(schema, value, models, validationContext) {
  var type = schema.format ? schema.format.toLowerCase() : schema.type.toLowerCase();
  switch (type) {
    case 'string':
      return validateString(schema, value, models, validationContext);
    case 'byte':
      return validators.byte(schema, value, models, validationContext);
    case 'date':
      return validators.date(schema, value, models, validationContext);
    case 'date-time':
      return validators.dateTime(schema, value, models, validationContext);
    default:
      return validationError({
        message: `Unknown param type ${type}`,
        context: validationContext
      });
  }
};
module.exports = exports = validate;
