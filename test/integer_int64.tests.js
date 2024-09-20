const helper = require('./test_helper');
const {assertValidationPassed, assertValidationFailed} = helper;
const {validateParameter} = require('../lib/validation/parameter');
const {ValidationContext} = require('../lib/validation/validationContext');
const {getValidationSettings} = require('../lib/validation/validationSettings');

describe('integer - int64', function () {
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
      schema: helper.makeNumberParam('integer', false, 'int64'),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationPassed(ret, [value]);
  });

  it('should validate with large integer', function () {
    var value = 11231223413244388635;
    var ret = validateParameter({
      schema: helper.makeNumberParam('integer', false, 'int64'),
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
      schema: helper.makeNumberParam('integer', false, 'int64'),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationPassed(ret, [value]);
  });

  it('should validate with min number', function () {
    var value = Number.MIN_VALUE + 1;
    var ret = validateParameter({
      schema: helper.makeNumberParam('integer', false, 'int64'),
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
      schema: helper.makeNumberParam('integer', false, 'int64'),
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
      schema: helper.makeNumberParam('integer', false, 'int64'),
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
      schema: helper.makeNumberParam('integer', false, 'int64'),
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
      schema: helper.makeNumberParam('integer', false, 'int64', '0'),
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
      schema: helper.makeNumberParam('integer', false, 'int64', null, '10'),
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
      schema: helper.makeNumberParam('integer', false, 'int64', '0'),
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
      schema: helper.makeNumberParam('integer', false, 'int64', null, '32465'),
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
      schema: helper.makeNumberParam('integer', false, 'int64', '321', '32465'),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationPassed(ret, [value]);
  });

  it('should not validate with minimum', function () {
    var value = -4563451321;
    var ret = validateParameter({
      schema: helper.makeNumberParam('integer', false, 'int64', '-2'),
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
      schema: helper.makeNumberParam('integer', false, 'int64', null, '10'),
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
      schema: helper.makeNumberParam('integer', false, 'int64', '321', '32465'),
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
      schema: helper.makeNumberParam('integer', false, 'int64', '321', '32465'),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["testParam is above the maximum value"]);
  });

  it('should not validate with minimum with decimal', function () {
    var value = 1.2356;
    var ret = validateParameter({
      schema: helper.makeNumberParam('integer', false, 'int64', '1.23'),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["testParam is not a type of int64"]);
  });

  it('should not validate with maximum with decimal', function () {
    var value = 1.42;
    var ret = validateParameter({
      schema: helper.makeNumberParam('integer', false, 'int64', null, '1.426541323432'),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["testParam is not a type of int64"]);
  });

  it('should not validate with minimum inclusive with decimal', function () {
    var value = 1.2356895;
    var ret = validateParameter({
      schema: helper.makeNumberParam('integer', false, 'int64', '1.2356895'),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["testParam is not a type of int64"]);
  });

  it('should not validate with maximum inclusive with decimal', function () {
    var value = 8569.26652323;
    var ret = validateParameter({
      schema: helper.makeNumberParam('integer', false, 'int64', null, '8569.26652323'),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["testParam is not a type of int64"]);
  });

  it('should not validate with true boolean', function () {
    var value = true;
    var ret = validateParameter({
      schema: helper.makeNumberParam('integer', false, 'int64'),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["testParam is not a type of int64"]);
  });

  it('should not validate with false boolean', function () {
    var value = false;
    var ret = validateParameter({
      schema: helper.makeNumberParam('integer', false, 'int64'),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["testParam is not a type of int64"]);
  });

  it('should not validate with too large integer', function () {
    var value = 1e4500; // jshint ignore:line
    var ret = validateParameter({
      schema: helper.makeNumberParam('integer', false, 'int64'),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["testParam is not a type of int64"]);
  });

  it('should not validate with negative too large integer', function () {
    var value = -1e4500; // jshint ignore:line
    var ret = validateParameter({
      schema: helper.makeNumberParam('integer', false, 'int64'),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["testParam is not a type of int64"]);
  });

  it('should not validate with object', function () {
    var value = {};
    var ret = validateParameter({
      schema: helper.makeNumberParam('integer', false, 'int64'),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["testParam is not a type of int64"]);
  });

  it('should not validate with empty array', function () {
    var value = [];
    var ret = validateParameter({
      schema: helper.makeNumberParam('integer', false, 'int64'),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["testParam is not a type of int64"]);
  });

  it('should not validate with empty array containing numbers', function () {
    var value = [1.15233, 2];
    var ret = validateParameter({
      schema: helper.makeNumberParam('integer', false, 'int64'),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["testParam is not a type of int64"]);
  });

  it('should not validate with string', function () {
    var value = 'string';
    var ret = validateParameter({
      schema: helper.makeNumberParam('integer', false, 'int64'),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["testParam is not a type of int64"]);
  });

  describe('string validation', () => {
    it('should allow an int64 to be a string (legacy behaviour)', () => {
      const result = validateParameter({
        schema: {
          type: 'integer',
          format: 'int64'
        },
        value: "1238976",
        models,
        validationContext,
        validationSettings
      });
      assertValidationPassed(result);
    });

    it('should allow an int64 to be a number', () => {
      const result = validateParameter({
        schema: {
          type: 'integer',
          format: 'int64'
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

      it('should not allow an int64 to be a string', () => {
        const result = validateParameter({
          schema: {
            type: 'integer',
            format: 'int64'
          },
          value: "1238976",
          models,
          validationContext,
          validationSettings
        });
        assertValidationFailed(result, ['undefined is not a type of int64']);
      });

      it('should allow an int64 to be a number', () => {
        const result = validateParameter({
          schema: {
            type: 'integer',
            format: 'int64'
          },
          value: 1238976,
          models,
          validationContext,
          validationSettings
        });
        assertValidationPassed(result);
      });
    });
  });
});
