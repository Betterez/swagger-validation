const _ = require('lodash');
const helper = require('./helper');
const {validationError, errorCodes} = require('../errors');

/**
 * Ensures that the <tt>value</tt> that is passed in is a valid Array as well as checking that each
 * value inside the array corresponds to the type that was specified in the <tt>param</tt> definition.
 * It doesn't check that the array contains 'empty' values, even if the array parameter is required as
 * spec doesn't have a way to say all values inside the array are required.
 *
 * While the spec says <tt>param.uniqueItems</tt> marks the array to be treated like a set instead of an array
 * (and not that this is invalid if it isn't unique), it does have the potential to lead to an
 * unintentional and unintended loss of data, so this throws a validation error that what you are passing isn't unique
 * over just allowing the non-unique data to be lost. If all the items passed their validation, check for uniqueness.
 * This only validates uniqueness after all the items in the array are validated. This allows all the individual
 * parameter methods to convert the value as they see fit so we are comparing apples to apples
 * (so '1' will get converted correctly to 1, etc.).
 *
 * If <tt>param.uniqueItems</tt> is checked, this doesn't use either the native Set (as that is part of the Harmony
 * (ECMAScript 6) proposal, {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set})
 * or a polyfill to "fill" in the missing functionality (something like {@link https://github.com/jfriend00/ES6-Set}).
 * This strictly converts everything to strings (using JSON.stringify()) and allows the _.uniq() method to compare strings.
 *
 * If "nothing" was passed into the validate function and it's required with no default value,
 * then this will throw a parameter is required error.
 *
 * @memberOf Validation.Parameters
 * @method Validate_Array
 * @param {Object} schema The Swagger param that was created for this operation
 * @param {Object} value The value that is passed in along the req (via body, header, etc.)
 * @param {Object} [models] Any models that are defined for this API
 * @returns {Array} An empty Array if the <tt>value</tt> was "nothing" and not required, else an array
 * containing an object with either an error property (which contains an Array of Error objects)
 * or a value property that contains the value parsed successfully.
 */
function validateArray({schema, value, models, validationContext, validationSettings}) {
  var type = schema.uniqueItems ? 'set' : 'array';

  if (!_.isArray(value)) {
    return validationError({
      code: type === 'set' ? errorCodes.VALUE_IS_NOT_A_SET : errorCodes.VALUE_IS_NOT_AN_ARRAY,
      propertyName: schema.name,
      value,
      validationContext,
      validationSettings
    });
  }

  var values = [];
  var errors = [];

  const {validateParameter} = require('../parameter');

  if (schema.minItems && !isNaN(schema.minItems) && value.length < schema.minItems) {
    return validationError({
      code: errorCodes.ARRAY_HAS_TOO_FEW_ITEMS,
      propertyName: schema.name,
      value,
      threshold: schema.minItems,
      validationContext,
      validationSettings
    });
  }

  if (schema.maxItems && !isNaN(schema.maxItems) && value.length > schema.maxItems) {
    return validationError({
      code: errorCodes.ARRAY_HAS_TOO_MANY_ITEMS,
      propertyName: schema.name,
      value,
      threshold: schema.maxItems,
      validationContext,
      validationSettings
    });
  }

  value.forEach((arrayItem, index) => {
    // if this is an object in the array, we have to use the type, not the name of the object
    const isObject = _.isPlainObject(arrayItem);
    const isNull = arrayItem === null;
    const paramType = schema.items.$ref || schema.items.type;
    const schemaForItems = {
      ...schema.items,
      name: (isObject || isNull) ? paramType : arrayItem
    };

    const validationResults = validateParameter({
      schema: schemaForItems,
      value: arrayItem,
      models,
      validationContext: validationContext.descendIntoProperty(index),
      validationSettings
    });

    if (_.some(validationResults, function(val) { return val.hasOwnProperty('error'); })) {
      errors = errors.concat(validationResults);
    }
    else {
      values = values.concat(_.map(validationResults, 'value'));
    }
  });

  if (errors.length === 0 && schema.uniqueItems) {
    var unique = _.uniqBy(values, JSON.stringify);
    if (unique.length !== values.length) {
      return validationError({
        code: errorCodes.ARRAY_ITEMS_ARE_NOT_UNIQUE,
        propertyName: schema.name,
        value,
        validationContext,
        validationSettings
      });
    }
  }

  return errors.length ? errors : helper.successReturn(values);
}

module.exports = validateArray;
