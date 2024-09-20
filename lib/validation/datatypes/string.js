const util = require('node:util');
const validators = require('./index');
const helper = require('./helper');
const {validationError, errorCodes} = require('../errors');

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
function validateString({schema, value, models, validationContext, validationSettings}) {
  if (!helper.isString(value)) {
    return validationError({
      code: errorCodes.VALUE_IS_NOT_A_STRING,
      propertyName: schema.name,
      value,
      validationContext,
      validationSettings
    });
  }

  if (Array.isArray(schema.enum) && !schema.enum.includes(value)) {
    return validationError({
      code: errorCodes.VALUE_IS_NOT_IN_ENUM,
      propertyName: schema.name,
      value,
      validationContext,
      validationSettings
    });
  }

  if (schema.hasOwnProperty('pattern') && schema.pattern !== null && schema.pattern !== undefined) {
    try {
      if (!helper.isString(schema.pattern)) {
        throw new Error('Invalid regular expression'); // Error will be caught locally
      }

      const isValid = new RegExp(schema.pattern).test(value);
      if (!isValid) {
        return validationError({
          code: errorCodes.STRING_DOES_NOT_MATCH_PATTERN,
          propertyName: schema.name,
          pattern: schema.pattern,
          validationContext,
          validationSettings
        });
      }
    } catch (err) {
      if (validationSettings.throwErrorsWhenSchemaIsInvalid) {
        throw new Error(`Swagger schema is invalid: bad regular expression "${util.inspect(schema.pattern)}".  Regular expressions must be provided as a string, and must have correct syntax`);
      } else {
        return validationError({
          code: errorCodes.SCHEMA_CONTAINS_BAD_REGULAR_EXPRESSION,
          propertyName: schema.name,
          pattern: schema.pattern,
          validationContext,
          validationSettings
        });
      }
    }
  }

  if (schema.hasOwnProperty('minLength') && Number.isInteger(schema.minLength) && value.length < schema.minLength) {
    return validationError({
      code: errorCodes.STRING_IS_TOO_SHORT,
      propertyName: schema.name,
      threshold: schema.minLength,
      value,
      validationContext,
      validationSettings
    });
  }

  if (schema.hasOwnProperty('maxLength') && Number.isInteger(schema.maxLength) && value.length > schema.maxLength) {
    return validationError({
      code: errorCodes.STRING_IS_TOO_LONG,
      propertyName: schema.name,
      threshold: schema.maxLength,
      value,
      validationContext,
      validationSettings
    });
  }


  return helper.successReturn(value);
}

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
var validate = function({schema, value, models, validationContext, validationSettings}) {
  var type = schema.format ? schema.format.toLowerCase() : schema.type.toLowerCase();
  switch (type) {
    case 'string':
      return validateString({schema, value, models, validationContext, validationSettings});
    case 'byte':
      return validators.byte({schema, value, models, validationContext, validationSettings});
    case 'date':
      return validators.date({schema, value, models, validationContext, validationSettings});
    case 'date-time':
      return validators.dateTime({schema, value, models, validationContext, validationSettings});
    default:
      if (validationSettings.throwErrorsWhenSchemaIsInvalid) {
        throw new Error(`Swagger schema is invalid: string has unsupported format "${type}"`);
      } else {
        return validationError({
          code: errorCodes.BAD_STRING_FORMAT,
          format: type,
          validationContext,
          validationSettings
        });
      }
  }
};

module.exports = exports = validate;
