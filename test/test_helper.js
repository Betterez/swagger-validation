const {expect} = require('chai');
const {ValidationContext} = require('../lib/validation/validationContext');
const {getValidationSettings} = require('../lib/validation/validationSettings');

exports = module.exports = {};

// helper method to make the basic param object
exports.makeParam = function (type, required, format, name) {
  return {
    type: type,
    required: required,
    name: name ? name : 'testParam',
    format: format ? format : undefined
  };
};

// helper method to make the string param object
exports.makeStringParam = function (type, required, format, pattern, enums, name, maxLength, minLength) {
  return {
    type: type,
    required: required,
    format: format ? format : undefined,
    'enum': enums ? enums : undefined,
    name: name ? name : 'testParam',
    pattern: pattern || pattern === false ? pattern : undefined,
    maxLength,
    minLength
  };
};

// helper method to make the number param object
exports.makeNumberParam = function (type, required, format, minimum, maximum, name) {
  return {
    type: type,
    required: required,
    format: format ? format : undefined,
    minimum: minimum !== undefined ? minimum : undefined,
    maximum: maximum !== undefined ? maximum : undefined,
    name: name ? name : 'testParam'
  };
};

// helper method to make the array / set param object
exports.makeArrayParam = function (required, itemType, itemFormat, itemPattern, uniqueItems, name, minItems, maxItems) {
  return {
    type: 'array',
    required: required,
    items: {
      type: itemType,
      format: itemFormat ? itemFormat : undefined,
      pattern: itemPattern ? itemPattern : undefined
    },
    uniqueItems: uniqueItems ? uniqueItems : undefined,
    name: name ? name : 'testParam',
    minItems: minItems ? minItems : undefined,
    maxItems: maxItems ? maxItems : undefined,
  };
};

// helper method to run all the unit test checks when it should succeed
exports.assertValidationPassed = function (validationResults, values) {
  expect(validationResults).to.exist;
  expect(validationResults).to.be.an("array");
  expect(validationResults.every((result) => !result.hasOwnProperty('error'))).to.be.true;

  // don't run this for certain checks (like the ones that convert strings to numbers)
  if (values) {
    expect(values).to.have.length(validationResults.length);

    for (var i = 0; i < values.length; i++) {
      var param = validationResults[i];
      expect(param).to.be.an('object');
      expect(param).to.have.ownProperty('value');

      var value = param.value;
      expect(value).to.eql(values[i]);
    }
  }
};

// helper method to run all the unit test checks when it should fail
exports.assertValidationFailed = function (validationResults, expectedErrorMessages) {
  expect(validationResults).to.exist;
  expect(validationResults).to.be.an("array");
  expect(validationResults).to.have.length(expectedErrorMessages.length);

  validationResults.forEach((result, index) => {
    expect(result).to.be.an('object');
    expect(result.error).to.be.an.instanceof(Error);
    expect(result.error.message).to.eql(expectedErrorMessages[index]);
    expect(result.context).to.be.an.instanceof(ValidationContext);
  });
};
