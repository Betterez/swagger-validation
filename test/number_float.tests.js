const helper = require('./test_helper');
const {assertValidationPassed, assertValidationFailed} = helper;
const {validateParameter} = require('../lib/validation/parameter');
const {ValidationContext} = require('../lib/validation/validationContext');
const {getValidationSettings} = require('../lib/validation/validationSettings');

describe('number - float', function () {
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
      schema: helper.makeNumberParam('number', false, 'float'),
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
      schema: helper.makeNumberParam('number', false, 'float'),
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
      schema: helper.makeNumberParam('number', false, 'float'),
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
      schema: helper.makeNumberParam('number', false, 'float'),
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
      schema: helper.makeNumberParam('number', false, 'float'),
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
      schema: helper.makeNumberParam('number', false, 'float'),
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
      schema: helper.makeNumberParam('number', false, 'float'),
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
      schema: helper.makeNumberParam('number', false, 'float', '0'),
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
      schema: helper.makeNumberParam('number', false, 'float', '1.23'),
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
      schema: helper.makeNumberParam('number', false, 'float', null, '10'),
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
      schema: helper.makeNumberParam('number', false, 'float', null, '1.426541323432'),
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
      schema: helper.makeNumberParam('number', false, 'float', '0'),
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
      schema: helper.makeNumberParam('number', false, 'float', '1.2356895'),
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
      schema: helper.makeNumberParam('number', false, 'float', null, '32465'),
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
      schema: helper.makeNumberParam('number', false, 'float', null, '8569.26652323'),
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
      schema: helper.makeNumberParam('number', false, 'float', '321', '32465'),
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
      schema: helper.makeNumberParam('number', false, 'float', '-2.32333'),
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
      schema: helper.makeNumberParam('number', false, 'float', null, '10.278974132'),
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
      schema: helper.makeNumberParam('number', false, 'float', '321', '32465'),
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
      schema: helper.makeNumberParam('number', false, 'float', '321', '32465'),
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
      schema: helper.makeNumberParam('number', false, 'float'),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["testParam is not a type of float"]);
  });

  it('should not validate with false boolean', function () {
    var value = false;
    var ret = validateParameter({
      schema: helper.makeNumberParam('number', false, 'float'),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["testParam is not a type of float"]);
  });

  it('should not validate with too large number', function () {
    var value = 1e4500; // jshint ignore:line
    var ret = validateParameter({
      schema: helper.makeNumberParam('number', false, 'float'),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["testParam is not a type of float"]);
  });

  it('should not validate with negative too large number', function () {
    var value = -1e4500; // jshint ignore:line
    var ret = validateParameter({
      schema: helper.makeNumberParam('number', false, 'float'),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["testParam is not a type of float"]);
  });

  it('should not validate with object', function () {
    var value = {};
    var ret = validateParameter({
      schema: helper.makeNumberParam('number', false, 'float'),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["testParam is not a type of float"]);
  });

  it('should not validate with empty array', function () {
    var value = [];
    var ret = validateParameter({
      schema: helper.makeNumberParam('number', false, 'float'),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["testParam is not a type of float"]);
  });

  it('should not validate with empty array containing numbers', function () {
    var value = [1.15233, 2];
    var ret = validateParameter({
      schema: helper.makeNumberParam('number', false, 'float'),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["testParam is not a type of float"]);
  });

  it('should not validate with string', function () {
    var value = 'string';
    var ret = validateParameter({
      schema: helper.makeNumberParam('number', false, 'float'),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["testParam is not a type of float"]);
  });
});
