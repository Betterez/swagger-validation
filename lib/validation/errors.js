const util = require('node:util');
const moment = require('moment');
const {describeDataType, describeRepeatedItemsInArray, pluralize} = require('./formatting');

const errorCodes = {
  VALUE_CANNOT_BE_NULL: 'VALUE_CANNOT_BE_NULL',
  VALUE_IS_REQUIRED: 'VALUE_IS_REQUIRED',
  VALUE_IS_NOT_A_BOOLEAN: 'VALUE_IS_NOT_A_BOOLEAN',
  VALUE_IS_NOT_A_STRING: 'VALUE_IS_NOT_A_STRING',
  VALUE_IS_NOT_IN_ENUM: 'VALUE_IS_NOT_IN_ENUM',
  VALUE_IS_NOT_AN_ARRAY: 'VALUE_IS_NOT_AN_ARRAY',
  VALUE_IS_NOT_AN_OBJECT: 'VALUE_IS_NOT_AN_OBJECT',
  VALUE_IS_NOT_A_SET: 'VALUE_IS_NOT_A_SET',
  VALUE_IS_NOT_A_NUMBER: 'VALUE_IS_NOT_A_NUMBER',
  NUMBER_IS_NOT_AN_INTEGER: 'NUMBER_IS_NOT_AN_INTEGER',
  NUMBER_IS_BELOW_MINIMUM_VALUE: 'NUMBER_IS_BELOW_MINIMUM_VALUE',
  NUMBER_IS_ABOVE_MAXIMUM_VALUE: 'NUMBER_IS_ABOVE_MAXIMUM_VALUE',
  BAD_INTEGER_FORMAT: 'BAD_INTEGER_FORMAT',
  BAD_NUMBER_FORMAT: 'BAD_NUMBER_FORMAT',
  BAD_STRING_FORMAT: 'BAD_STRING_FORMAT',
  STRING_DOES_NOT_MATCH_PATTERN: 'STRING_DOES_NOT_MATCH_PATTERN',
  DATE_FORMAT_IS_INVALID: 'DATE_FORMAT_IS_INVALID',
  STRING_IS_TOO_SHORT: 'STRING_IS_TOO_SHORT',
  STRING_IS_TOO_LONG: 'STRING_IS_TOO_LONG',
  ARRAY_HAS_TOO_FEW_ITEMS: 'ARRAY_HAS_TOO_FEW_ITEMS',
  ARRAY_HAS_TOO_MANY_ITEMS: 'ARRAY_HAS_TOO_MANY_ITEMS',
  ARRAY_ITEMS_ARE_NOT_UNIQUE: 'ARRAY_ITEMS_ARE_NOT_UNIQUE',
  OBJECT_CONTAINS_INVALID_PROPERTIES: 'OBJECT_CONTAINS_INVALID_PROPERTIES',
  SCHEMA_REFERENCES_UNKNOWN_MODEL: 'SCHEMA_REFERENCE_UNKNOWN_MODEL',
  SCHEMA_CONTAINS_BAD_REGULAR_EXPRESSION: 'SCHEMA_CONTAINS_BAD_REGULAR_EXPRESSION',
};

function getLegacyErrorMessage(errorCode, stringTemplateParams) {
  const {
    propertyName,
    threshold,
    pattern,
    dataType,
    format,
    modelName,
    disallowedProperties
  } = stringTemplateParams;

  switch (errorCode) {
    case errorCodes.VALUE_CANNOT_BE_NULL:
      return `${propertyName} cannot be null`;
    case errorCodes.VALUE_IS_REQUIRED:
      return `${propertyName} is required`;
    case errorCodes.VALUE_IS_NOT_A_BOOLEAN:
      return `${propertyName} is not a type of boolean`;
    case errorCodes.VALUE_IS_NOT_A_STRING:
      return `${propertyName} is not a type of string`;
    case errorCodes.VALUE_IS_NOT_IN_ENUM:
      return `${propertyName} is not a valid entry`;
    case errorCodes.VALUE_IS_NOT_AN_ARRAY:
      return `${propertyName} is not a type of array`;
    case errorCodes.VALUE_IS_NOT_AN_OBJECT:
      return `${propertyName} is not a type of object`;
    case errorCodes.VALUE_IS_NOT_A_SET:
      return `${propertyName} is not a type of set`;
    case errorCodes.VALUE_IS_NOT_A_NUMBER:
    case errorCodes.NUMBER_IS_NOT_AN_INTEGER:
      return `${propertyName} is not a type of ${dataType}`;
    case errorCodes.NUMBER_IS_BELOW_MINIMUM_VALUE:
      return `${propertyName} is below the minimum value`;
    case errorCodes.NUMBER_IS_ABOVE_MAXIMUM_VALUE:
      return `${propertyName} is above the maximum value`;
    case errorCodes.BAD_INTEGER_FORMAT:
    case errorCodes.BAD_NUMBER_FORMAT:
    case errorCodes.BAD_STRING_FORMAT:
      return `Unknown param type ${format}`;
    case errorCodes.STRING_DOES_NOT_MATCH_PATTERN:
    case errorCodes.DATE_FORMAT_IS_INVALID:
      return `${propertyName} is not valid based on the pattern ${pattern}`;
    case errorCodes.STRING_IS_TOO_SHORT:
      return `${propertyName} requires a min length of ${threshold}`;
    case errorCodes.STRING_IS_TOO_LONG:
      return `${propertyName} requires a max length of ${threshold}`;
    case errorCodes.ARRAY_HAS_TOO_FEW_ITEMS:
      return `${propertyName} should have at least ${threshold} item(s)`;
    case errorCodes.ARRAY_HAS_TOO_MANY_ITEMS:
      return `${propertyName} should have at most ${threshold} item(s)`;
    case errorCodes.ARRAY_ITEMS_ARE_NOT_UNIQUE:
      return `${propertyName} is not unique. This may lead to an unintended loss of data`;
    case errorCodes.OBJECT_CONTAINS_INVALID_PROPERTIES:
      return `${propertyName ?? 'object'} contains invalid properties: ${disallowedProperties.join(", ")}`
    case errorCodes.SCHEMA_REFERENCES_UNKNOWN_MODEL:
      return `Unknown param type ${modelName}`;
    case errorCodes.SCHEMA_CONTAINS_BAD_REGULAR_EXPRESSION:
      return `${propertyName} is specified with an invalid pattern ${util.inspect(pattern)}`;
    default:
      throw new Error(`Unknown error code: "${errorCode}"`);
  }
}

function getErrorMessage(errorCode, stringTemplateParams) {
  const {
    value,
    threshold,
    pattern,
    format,
    disallowedProperties,
    modelName,
    validationContext
  } = stringTemplateParams;

  switch (errorCode) {
    case errorCodes.VALUE_CANNOT_BE_NULL:
      return `${validationContext.formatDataSource()} is invalid: ${validationContext.formatDataPath()} cannot be null`;
    case errorCodes.VALUE_IS_REQUIRED:
      return `${validationContext.formatDataSource()} is invalid: ${validationContext.formatDataPath()} is required but is missing`;
    case errorCodes.VALUE_IS_NOT_A_BOOLEAN:
      return `${validationContext.formatDataSource()} is invalid: expected ${validationContext.formatDataPath()} to be a boolean, but it is ${describeDataType(value)}`;
    case errorCodes.VALUE_IS_NOT_A_STRING:
      return `${validationContext.formatDataSource()} is invalid: expected ${validationContext.formatDataPath()} to be a string, but it is ${describeDataType(value)}`;
    case errorCodes.VALUE_IS_NOT_IN_ENUM:
      return `${validationContext.formatDataSource()} is invalid: ${validationContext.formatDataPath()} only allows a specific set of values, and "${value}" is not one of the allowed values`;
    case errorCodes.VALUE_IS_NOT_AN_ARRAY:
    case errorCodes.VALUE_IS_NOT_A_SET:
      return `${validationContext.formatDataSource()} is invalid: expected ${validationContext.formatDataPath()} to be an array, but it is ${describeDataType(value)}`;
    case errorCodes.VALUE_IS_NOT_AN_OBJECT:
      return `${validationContext.formatDataSource()} is invalid: expected ${validationContext.formatDataPath()} to be an object, but it is ${describeDataType(value)}`;
    case errorCodes.VALUE_IS_NOT_A_NUMBER:
      return `${validationContext.formatDataSource()} is invalid: expected ${validationContext.formatDataPath()} to be a number, but it is ${describeDataType(value)}`;
    case errorCodes.NUMBER_IS_NOT_AN_INTEGER:
      return `${validationContext.formatDataSource()} is invalid: expected ${validationContext.formatDataPath()} to be an integer, but it is a floating-point number`;
    case errorCodes.NUMBER_IS_BELOW_MINIMUM_VALUE:
      return `${validationContext.formatDataSource()} is invalid: expected ${validationContext.formatDataPath()} to have a value of ${threshold} or greater, but it has a value of ${value}`;
    case errorCodes.NUMBER_IS_ABOVE_MAXIMUM_VALUE:
      return `${validationContext.formatDataSource()} is invalid: expected ${validationContext.formatDataPath()} to have a value of ${threshold} or lower, but it has a value of ${value}`;
    case errorCodes.BAD_INTEGER_FORMAT:
      return `Swagger schema is invalid: integer has unsupported format "${format}"`;
    case errorCodes.BAD_NUMBER_FORMAT:
      return `Swagger schema is invalid: number has unsupported format "${format}"`;
    case errorCodes.BAD_STRING_FORMAT:
      return `Swagger schema is invalid: string has unsupported format "${format}"`;
    case errorCodes.STRING_DOES_NOT_MATCH_PATTERN:
      return `${validationContext.formatDataSource()} is invalid: expected ${validationContext.formatDataPath()} to match the regular expression ${util.inspect(new RegExp(pattern))}`
    case errorCodes.DATE_FORMAT_IS_INVALID:
      const isISO8601Date = pattern === moment.ISO_8601;
      return `${validationContext.formatDataSource()} is invalid: expected ${validationContext.formatDataPath()} to be a date ${isISO8601Date ? 'in ISO 8601 format' : `matching the pattern ${pattern}`}`;
    case errorCodes.STRING_IS_TOO_SHORT:
      return `${validationContext.formatDataSource()} is invalid: expected ${validationContext.formatDataPath()} to be at least ${pluralize`${threshold} character`} long, but it has a length of ${value.length}`;
    case errorCodes.STRING_IS_TOO_LONG:
      return `${validationContext.formatDataSource()} is invalid: expected ${validationContext.formatDataPath()} to be at most ${pluralize`${threshold} character`} long, but it has a length of ${value.length}`;
    case errorCodes.ARRAY_HAS_TOO_FEW_ITEMS:
      return `${validationContext.formatDataSource()} is invalid: expected ${validationContext.formatDataPath()} to have at least ${pluralize`${threshold} item`}, but it has ${pluralize`${value.length} item`}`;
    case errorCodes.ARRAY_HAS_TOO_MANY_ITEMS:
      return `${validationContext.formatDataSource()} is invalid: expected ${validationContext.formatDataPath()} to have at most ${pluralize`${threshold} item`}, but it has ${pluralize`${value.length} item`}`;
    case errorCodes.ARRAY_ITEMS_ARE_NOT_UNIQUE:
      return `${validationContext.formatDataSource()} is invalid: expected items in ${validationContext.formatDataPath()} to be unique, but the following items appear more than once: ${describeRepeatedItemsInArray(value)}`;
    case errorCodes.OBJECT_CONTAINS_INVALID_PROPERTIES:
      return `${validationContext.formatDataSource()} is invalid: ${validationContext.formatDataPath() || validationContext.formatDataSource().toLowerCase()} contains unrecognized ${disallowedProperties.length > 1 ? 'properties' : 'property'} ${disallowedProperties.map(property => `"${property}"`).join(', ')}`;
    case errorCodes.SCHEMA_REFERENCES_UNKNOWN_MODEL:
      return `Swagger schema is invalid: unknown reference to model "${modelName}"`;
    case errorCodes.SCHEMA_CONTAINS_BAD_REGULAR_EXPRESSION:
      return `Swagger schema is invalid: bad regular expression "${util.inspect(pattern)}".  Regular expressions must be provided as a string, and must have correct syntax`
    default:
      throw new Error(`Unknown error code: "${errorCode}"`);
  }
}

function validationError(props) {
  const {message, code: errorCode, validationContext, validationSettings} = props;

  if (message) {
    return [{error: new Error(message), context: validationContext}];
  } else if (errorCode) {
    const errorMessage = validationSettings.improvedErrorMessages ?
      getErrorMessage(errorCode, props) :
      getLegacyErrorMessage(errorCode, props);
    return [{error: new Error(errorMessage), context: validationContext}];
  } else {
    throw new Error('A validation error must have either a "message" or a "code"');
  }
}

module.exports = {
  validationError,
  errorCodes,
};
