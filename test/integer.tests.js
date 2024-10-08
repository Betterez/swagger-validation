const {expect} = require('chai');
const helper = require('./test_helper');
const {assertValidationPassed, assertValidationFailed} = helper;
const {validateParameter} = require('../lib/validation/parameter');
const {ValidationContext} = require('../lib/validation/validationContext');
const {getValidationSettings} = require('../lib/validation/validationSettings');

describe('integer', function () {
  let models;
  let validationContext;
  let validationSettings;

  beforeEach(() => {
    models = undefined;
    validationContext = new ValidationContext();
    validationSettings = getValidationSettings();
  });

  it('should validate', function () {
    var value = 1;
    var ret = validateParameter({
      schema: helper.makeNumberParam('integer', false),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationPassed(ret, [value]);
  });

  it('should validate with large number', function () {
    var value = 112312234132443;
    var ret = validateParameter({
      schema: helper.makeNumberParam('integer', false),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationPassed(ret, [value]);
  });

  it('should validate with hex', function () {
    var value = 0x123;
    var transformedValue = 291;
    var ret = validateParameter({
      schema: helper.makeNumberParam('integer', false),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationPassed(ret, [transformedValue]);
  });

  it('should validate with hex as string', function () {
    var value = "0x123";
    var transformedValue = 291;
    var ret = validateParameter({
      schema: helper.makeNumberParam('integer', false),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationPassed(ret, [transformedValue]);
  });

  it('should validate with minimum', function () {
    var value = 1;
    var ret = validateParameter({
      schema: helper.makeNumberParam('integer', false, null, '0'),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationPassed(ret, [value]);
  });

  it('should validate with maximum', function () {
    var value = 1;
    var ret = validateParameter({
      schema: helper.makeNumberParam('integer', false, null, null, '10'),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationPassed(ret, [value]);
  });

  it('should validate with minimum inclusive', function () {
    var value = 0;
    var ret = validateParameter({
      schema: helper.makeNumberParam('integer', false, null, '0'),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationPassed(ret, [value]);
  });

  it('should validate with maximum inclusive', function () {
    var value = 32465;
    var ret = validateParameter({
      schema: helper.makeNumberParam('integer', false, null, null, '32465'),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationPassed(ret, [value]);
  });

  it('should validate with minimum and maximum', function () {
    var value = 3246;
    var ret = validateParameter({
      schema: helper.makeNumberParam('integer', false, null, '321', '32465'),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationPassed(ret, [value]);
  });

  it('should not validate with minimum', function () {
    var value = -4563;
    var ret = validateParameter({
      schema: helper.makeNumberParam('integer', false, null, '-2'),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["testParam is below the minimum value"]);
  });

  it('should not validate with maximum', function () {
    var value = 11;
    var ret = validateParameter({
      schema: helper.makeNumberParam('integer', false, null, null, '10'),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["testParam is above the maximum value"]);
  });

  it('should not validate with minimum and maximum too low', function () {
    var value = 3;
    var ret = validateParameter({
      schema: helper.makeNumberParam('integer', false, null, '321', '32465'),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["testParam is below the minimum value"]);
  });

  it('should not validate with minimum and maximum too high', function () {
    var value = 324653;
    var ret = validateParameter({
      schema: helper.makeNumberParam('integer', false, null, '321', '32465'),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["testParam is above the maximum value"]);
  });

  it('should not validate with true boolean', function () {
    var value = true;
    var ret = validateParameter({
      schema: helper.makeNumberParam('integer', false),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["testParam is not a type of integer"]);
  });

  it('should not validate with false boolean', function () {
    var value = false;
    var ret = validateParameter({
      schema: helper.makeNumberParam('integer', false),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["testParam is not a type of integer"]);
  });

  it('should not validate with too large number', function () {
    var value = 1e4500; // jshint ignore:line
    var ret = validateParameter({
      schema: helper.makeNumberParam('integer', false),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["testParam is not a type of integer"]);
  });

  it('should not validate with negative too large number', function () {
    var value = -1e4500; // jshint ignore:line
    var ret = validateParameter({
      schema: helper.makeNumberParam('integer', false),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["testParam is not a type of integer"]);
  });

  it('should not validate with object', function () {
    var value = {};
    var ret = validateParameter({
      schema: helper.makeNumberParam('integer', false),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["testParam is not a type of integer"]);
  });

  it('should not validate with empty array', function () {
    var value = [];
    var ret = validateParameter({
      schema: helper.makeNumberParam('integer', false),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["testParam is not a type of integer"]);
  });

  it('should not validate with empty array containing numbers', function () {
    var value = [1, 2];
    var ret = validateParameter({
      schema: helper.makeNumberParam('integer', false),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["testParam is not a type of integer"]);
  });

  it('should not validate with string', function () {
    var value = 'string';
    var ret = validateParameter({
      schema: helper.makeNumberParam('integer', false),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["testParam is not a type of integer"]);
  });

  describe('invalid schemas', () => {
    it('should return a validation error when an integer has an unknown format', () => {
      const results = validateParameter({
        schema: {
          type: 'integer',
          format: 'int99'
        },
        value: 1,
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(results, ['Unknown param type int99']);
    });

    describe('when the validation settings specify that an error should be thrown when there is a problem with the swagger schema', () => {
      beforeEach(() => {
        validationSettings.throwErrorsWhenSchemaIsInvalid = true;
      });

      it('should throw an error when an integer has an unknown format', () => {
        expect(() => validateParameter({
          schema: {
            type: 'integer',
            format: 'int99'
          },
          value: 1,
          models,
          validationContext,
          validationSettings
        })).to.throw('Swagger schema is invalid: integer has unsupported format "int99"');
      });
    });
  });

  describe('integers with an extremely large magnitude', () => {
    it('should allow an integer to be a very large negative number which cannot be represented as a Number in Javascript (legacy behaviour)', () => {
      const results = validateParameter({
        schema: {
          type: 'integer'
        },
        value: -9007199254740993,
        models,
        validationContext,
        validationSettings
      });
      // Note that the value below differs from the input
      assertValidationPassed(results, [-9007199254740992]);
    });

    it('should allow an integer to be a very large positive number which cannot be represented as a Number in Javascript (legacy behaviour)', () => {
      const results = validateParameter({
        schema: {
          type: 'integer'
        },
        value: 9007199254740993,
        models,
        validationContext,
        validationSettings
      });
      // Note that the value below differs from the input
      assertValidationPassed(results, [9007199254740992]);
    });

    describe('when the validation settings specify that integers which cannot be parsed correctly in Javascript are disallowed', () => {
      beforeEach(() => {
        validationSettings.allowIntegerValuesWhichMayBeParsedIncorrectly = false;
        validationSettings.improvedErrorMessages = true;
      });

      it('should not allow an integer to be a very large negative number which cannot be represented as a Number in Javascript', () => {
        const results = validateParameter({
          schema: {
            type: 'integer'
          },
          value: -9007199254740993,
          models,
          validationContext,
          validationSettings
        });
        // Note that the value below differs from the input
        assertValidationFailed(results, ["Input is invalid: input has a value of -9007199254740992 which is below the minimum possible value for an integer (-9007199254740991)"]);
      });

      it('should not allow an integer to be a very large positive number which cannot be represented as a Number in Javascript', () => {
        const results = validateParameter({
          schema: {
            type: 'integer'
          },
          value: 9007199254740993,
          models,
          validationContext,
          validationSettings
        });
        // Note that the value below differs from the input
        assertValidationFailed(results, ["Input is invalid: input has a value of 9007199254740992 which is above the maximum possible value for an integer (9007199254740991)"]);
      });
    });
  });

  describe('number formats', () => {
    it('should allow an integer to have a format which has no equivalent representation in Javascript (legacy behaviour)', () => {
      const results = validateParameter({
        schema: {
          type: 'integer',
          format: 'int64' // Javascript does not support 64-bit integers
        },
        value: 1,
        models,
        validationContext,
        validationSettings
      });
      assertValidationPassed(results);
    });

    describe('when the validation settings specify that number formats with no equivalent representation in Javascript are disallowed', () => {
      beforeEach(() => {
        validationSettings.allowNumberFormatsWithNoEquivalentRepresentationInJavascript = false;
        validationSettings.throwErrorsWhenSchemaIsInvalid = true;
      });

      it('should throw an error when an integer has an unknown format', () => {
        expect(() => validateParameter({
          schema: {
            type: 'integer',
            format: 'int64'
          },
          value: 1,
          models,
          validationContext,
          validationSettings
        })).to.throw(`Swagger schema is invalid: integer has format "int64", but integer formats are not supported by this library.  Omit the format and use 'type: "integer"' instead.`);
      });
    });
  });

  describe('string validation', () => {
    it('should allow an integer to be a string (legacy behaviour)', () => {
      const result = validateParameter({
        schema: {
          type: 'integer'
        },
        value: "1238976",
        models,
        validationContext,
        validationSettings
      });
      assertValidationPassed(result);
    });

    it('should allow an integer to be a number', () => {
      const result = validateParameter({
        schema: {
          type: 'integer'
        },
        value: 1238976,
        models,
        validationContext,
        validationSettings
      });
      assertValidationPassed(result);
    });

    describe('when the validation settings specify that numbers cannot be strings', () => {
      beforeEach(() => {
        validationSettings.allowNumbersToBeStrings = false;
      });

      it('should not allow an integer to be a string', () => {
        const result = validateParameter({
          schema: {
            type: 'integer'
          },
          value: "1238976",
          models,
          validationContext,
          validationSettings
        });
        assertValidationFailed(result, ['undefined is not a type of integer']);
      });

      it('should allow an integer to be a number', () => {
        const result = validateParameter({
          schema: {
            type: 'integer'
          },
          value: 1238976,
          models,
          validationContext,
          validationSettings
        });
        assertValidationPassed(result);
      });
    });
  })
});
