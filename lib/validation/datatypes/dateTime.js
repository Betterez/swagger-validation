const moment = require('moment');
const helper = require('./helper');
const {validationError, errorCodes} = require('../errors');

/**
 * There is no definitive definition in the swagger spec as to what constitutes a valid date or date-time
 * (more than likely due to the varied formats a date could have). Therefore, swagger-validation will accept a
 * 'pattern' property on the Swagger Property/Parameter Objects, which is a moment.js format string,
 * that specifies the explicit format expected for the date-time format. If no pattern property is detected,
 * moment.ISO_8601 will be used by default.
 *
 * If "nothing" was passed into the validate function and it's required with no default value,
 * then this will throw a parameter is required error.
 *
 * @memberOf Validation.Parameters
 * @method Validate_Datetime
 * @param {Object} schema The Swagger param that was created for this operation
 * @param {Object} value The value that is passed in along the req (via body, header, etc.)
 * @returns {Array} An empty Array if the <tt>value</tt> was "nothing" and not required, else an array
 * containing an object with either an error property (which contains an Array of Error objects)
 * or a value property that contains a Date object parsed from <tt>value</tt>.
 */
function validateDateTime({schema, value, models, validationContext, validationSettings}) {
  var isRequired = helper.isRequired({schema, value, validationContext, validationSettings});
  if (isRequired) {
    return isRequired;
  }

  if (value instanceof Date) {
    return helper.successReturn(value);
  }

  const datePattern = schema.pattern || moment.ISO_8601;
  const useStrictDateParsing = validationSettings.strictDateParsing;
  const date = moment(value, datePattern, useStrictDateParsing);

  if (!date.isValid()) {
    const datePatternDescription = schema.pattern || 'for moment.ISO 8601';
    return validationError({
      code: errorCodes.DATE_FORMAT_IS_INVALID,
      propertyName: schema.name,
      value,
      pattern: validationSettings.improvedErrorMessages ? datePattern : datePatternDescription,
      validationContext,
      validationSettings
    });
  }

  return helper.successReturn(date.toDate());
}

module.exports = validateDateTime;
