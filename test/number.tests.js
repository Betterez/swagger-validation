const {expect} = require("chai");
const helper = require('./test_helper');
const {assertValidationPassed, assertValidationFailed} = helper;
const {validateParameter} = require('../lib/validation/parameter');
const {ValidationContext} = require('../lib/validation/validationContext');
const {getValidationSettings} = require('../lib/validation/validationSettings');

describe('number', function () {
  let models;
  let validationContext;
  let validationSettings;

  beforeEach(() => {
    models = undefined;
    validationContext = new ValidationContext();
    validationSettings = getValidationSettings();
  });

  it('should validate', function () {
    var value = 1.5;
    var ret = validateParameter({
      schema: helper.makeNumberParam('number', false),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationPassed(ret, [value]);
  });

  it('should validate with large number', function () {
    var value = 112312234132443.88635;
    var ret = validateParameter({
      schema: helper.makeNumberParam('number', false),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationPassed(ret, [value]);
  });

  it('should validate with max number', function () {
    var value = Number.MAX_VALUE;
    var ret = validateParameter({
      schema: helper.makeNumberParam('number', false),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationPassed(ret, [value]);
  });

  it('should validate with min number', function () {
    var value = Number.MIN_VALUE;
    var ret = validateParameter({
      schema: helper.makeNumberParam('number', false),
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
      schema: helper.makeNumberParam('number', false),
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
      schema: helper.makeNumberParam('number', false),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationPassed(ret, [transformedValue]);
  });

  it('should validate with decimal of 0', function () {
    var value = 1.0;
    var ret = validateParameter({
      schema: helper.makeNumberParam('number', false),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationPassed(ret, [value]);
  });

  it('should validate with minimum', function () {
    var value = 1;
    var ret = validateParameter({
      schema: helper.makeNumberParam('number', false, null, '0'),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationPassed(ret, [value]);
  });

  it('should validate with minimum with decimal', function () {
    var value = 1.2356;
    var ret = validateParameter({
      schema: helper.makeNumberParam('number', false, null, '1.23'),
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
      schema: helper.makeNumberParam('number', false, null, null, '10'),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationPassed(ret, [value]);
  });

  it('should validate with maximum with decimal', function () {
    var value = 1.42;
    var ret = validateParameter({
      schema: helper.makeNumberParam('number', false, null, null, '1.426541323432'),
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
      schema: helper.makeNumberParam('number', false, null, '0'),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationPassed(ret, [value]);
  });

  it('should validate with minimum inclusive with decimal', function () {
    var value = 1.2356895;
    var ret = validateParameter({
      schema: helper.makeNumberParam('number', false, null, '1.2356895'),
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
      schema: helper.makeNumberParam('number', false, null, null, '32465'),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationPassed(ret, [value]);
  });

  it('should validate with maximum inclusive with decimal', function () {
    var value = 8569.26652323;
    var ret = validateParameter({
      schema: helper.makeNumberParam('number', false, null, null, '8569.26652323'),
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
      schema: helper.makeNumberParam('number', false, null, '321', '32465'),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationPassed(ret, [value]);
  });

  it('should not validate with minimum', function () {
    var value = -4563.23565632;
    var ret = validateParameter({
      schema: helper.makeNumberParam('number', false, null, '-2.32333'),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["testParam is below the minimum value"]);
  });

  it('should not validate with maximum', function () {
    var value = 11.26535;
    var ret = validateParameter({
      schema: helper.makeNumberParam('number', false, null, null, '10.278974132'),
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
      schema: helper.makeNumberParam('number', false, null, '321', '32465'),
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
      schema: helper.makeNumberParam('number', false, null, '321', '32465'),
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
      schema: helper.makeNumberParam('number', false),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["testParam is not a type of number"]);
  });

  it('should not validate with false boolean', function () {
    var value = false;
    var ret = validateParameter({
      schema: helper.makeNumberParam('number', false),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["testParam is not a type of number"]);
  });

  it('should not validate with too large number', function () {
    var value = 1e4500; // jshint ignore:line
    var ret = validateParameter({
      schema: helper.makeNumberParam('number', false),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["testParam is not a type of number"]);
  });

  it('should not validate with negative too large number', function () {
    var value = -1e4500; // jshint ignore:line
    var ret = validateParameter({
      schema: helper.makeNumberParam('number', false),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["testParam is not a type of number"]);
  });

  it('should not validate with object', function () {
    var value = {};
    var ret = validateParameter({
      schema: helper.makeNumberParam('number', false),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["testParam is not a type of number"]);
  });

  it('should not validate with empty array', function () {
    var value = [];
    var ret = validateParameter({
      schema: helper.makeNumberParam('number', false),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["testParam is not a type of number"]);
  });

  it('should not validate with empty array containing numbers', function () {
    var value = [1.15233, 2];
    var ret = validateParameter({
      schema: helper.makeNumberParam('number', false),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["testParam is not a type of number"]);
  });

  it('should not validate with string', function () {
    var value = 'string';
    var ret = validateParameter({
      schema: helper.makeNumberParam('number', false),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["testParam is not a type of number"]);
  });

  it('should not allow a null value when nullable is false, even when the number is optional', function () {
    const schema = {
      type: 'object',
      required: [],
      properties: {
        someNumber: {
          type: 'number',
          nullable: false
        }
      }
    };
    const value = {someNumber: null};
    const result = validateParameter({schema, value, models, validationContext, validationSettings});
    assertValidationFailed(result, ['someNumber cannot be null']);
  });

  describe('invalid schemas', () => {
    it('should return a validation error when a number has an unknown format', () => {
      const results = validateParameter({
        schema: {
          type: 'number',
          format: 'float16'
        },
        value: 1.5,
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(results, ['Unknown param type float16']);
    });

    describe('when the validation settings specify that an error should be thrown when there is a problem with the swagger schema', () => {
      beforeEach(() => {
        validationSettings.throwErrorsWhenSchemaIsInvalid = true;
      });

      it('should throw an error when a number has an unknown format', () => {
        expect(() => validateParameter({
          schema: {
            type: 'number',
            format: 'float16'
          },
          value: 1.5,
          models,
          validationContext,
          validationSettings
        })).to.throw('Swagger schema is invalid: number has unsupported format "float16"');
      });
    });
  });

  describe('number formats', () => {
    it('should allow a number to have a format, even though the format has no effect on the validation logic (legacy behaviour)', () => {
      const results = validateParameter({
        schema: {
          type: 'number',
          format: 'double'
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

      it('should throw an error when a number has a format', () => {
        expect(() => validateParameter({
          schema: {
            type: 'number',
            format: 'double'
          },
          value: 1,
          models,
          validationContext,
          validationSettings
        })).to.throw(`Swagger schema is invalid: number has format "double", but number formats are not supported by this library.  Omit the format and use 'type: "number"' instead.`);
      });
    });
  });

  describe('string validation', () => {
    it('should allow a number to be a string (legacy behaviour)', () => {
      const result = validateParameter({
        schema: {
          type: 'number'
        },
        value: "7389.271",
        models,
        validationContext,
        validationSettings
      });
      assertValidationPassed(result);
    });

    it('should allow a number to be a floating-point number', () => {
      const result = validateParameter({
        schema: {
          type: 'number'
        },
        value: 7389.271,
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

      it('should not allow an number to be a string', () => {
        const result = validateParameter({
          schema: {
            type: 'number'
          },
          value: "7389.271",
          models,
          validationContext,
          validationSettings
        });
        assertValidationFailed(result, ['undefined is not a type of number']);
      });

      it('should allow a number to be a floating-point number', () => {
        const result = validateParameter({
          schema: {
            type: 'number'
          },
          value: 7389.271,
          models,
          validationContext,
          validationSettings
        });
        assertValidationPassed(result);
      });
    });
  })
});
