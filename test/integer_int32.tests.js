const helper = require('./test_helper');
const {validateParameter} = require('../lib/validation/parameter');
const {ValidationContext} = require('../lib/validation/validationContext');

describe('integer - int32', function() {
  let models;
  let validationContext;

  beforeEach(() => {
    models = undefined;
    validationContext = new ValidationContext();
  });

  it('should validate', function() {
    var value = 1;
    var ret = validateParameter(helper.makeNumberParam('integer', false, 'int32'), value, models, validationContext);
    helper.assertValidationPassed(ret, [value]);
  });

  it('should validate with large number', function() {
    var value = 112312234132443;
    var ret = validateParameter(helper.makeNumberParam('integer', false, 'int32'), value, models, validationContext);
    helper.assertValidationPassed(ret, [value]);
  });

  it('should validate with max number', function() {
    var value = 9007199254740991;
    var ret = validateParameter(helper.makeNumberParam('integer', false, 'int32'), value, models, validationContext);
    helper.assertValidationPassed(ret, [value]);
  });

  it('should validate with min number', function() {
    var value = -9007199254740991;
    var ret = validateParameter(helper.makeNumberParam('integer', false, 'int32'), value, models, validationContext);
    helper.assertValidationPassed(ret, [value]);
  });

  it('should validate with hex', function() {
    var value = 0x123;
    var transformedValue = 291;
    var ret = validateParameter(helper.makeNumberParam('integer', false, 'int32'), value, models, validationContext);
    helper.assertValidationPassed(ret, [transformedValue]);
  });

  it('should validate with hex as string', function() {
    var value = "0x123";
    var transformedValue = 291;
    var ret = validateParameter(helper.makeNumberParam('integer', false, 'int32'), value, models, validationContext);
    helper.assertValidationPassed(ret, [transformedValue]);
  });

  it('should validate with minimum', function() {
    var value = 1;
    var ret = validateParameter(helper.makeNumberParam('integer', false, 'int32', '0'), value, models, validationContext);
    helper.assertValidationPassed(ret, [value]);
  });

  it('should validate with maximum', function() {
    var value = 1;
    var ret = validateParameter(helper.makeNumberParam('integer', false, 'int32', null, '10'), value, models, validationContext);
    helper.assertValidationPassed(ret, [value]);
  });

  it('should validate with minimum inclusive', function() {
    var value = 0;
    var ret = validateParameter(helper.makeNumberParam('integer', false, 'int32', '0'), value, models, validationContext);
    helper.assertValidationPassed(ret, [value]);
  });

  it('should validate with maximum inclusive', function() {
    var value = 32465;
    var ret = validateParameter(helper.makeNumberParam('integer', false, 'int32', null, '32465'), value, models, validationContext);
    helper.assertValidationPassed(ret, [value]);
  });

  it('should validate with minimum and maximum', function() {
    var value = 3246;
    var ret = validateParameter(helper.makeNumberParam('integer', false, 'int32', '321', '32465'), value, models, validationContext);
    helper.assertValidationPassed(ret, [value]);
  });

  it('should not validate with minimum', function() {
    var value = -4563;
    var ret = validateParameter(helper.makeNumberParam('integer', false, 'int32', '-2'), value, models, validationContext);
    helper.assertValidationFailed(ret, ["testParam is below the minimum value"]);
  });

  it('should not validate with maximum', function() {
    var value = 11;
    var ret = validateParameter(helper.makeNumberParam('integer', false, 'int32', null, '10'), value, models, validationContext);
    helper.assertValidationFailed(ret, ["testParam is above the maximum value"]);
  });

  it('should not validate with minimum and maximum too low', function() {
    var value = 3;
    var ret = validateParameter(helper.makeNumberParam('integer', false, 'int32', '321', '32465'), value, models, validationContext);
    helper.assertValidationFailed(ret, ["testParam is below the minimum value"]);
  });

  it('should not validate with minimum and maximum too high', function() {
    var value = 324653;
    var ret = validateParameter(helper.makeNumberParam('integer', false, 'int32', '321', '32465'), value, models, validationContext);
    helper.assertValidationFailed(ret, ["testParam is above the maximum value"]);
  });

  it('should not validate with required field null', function() {
    var value = null;
    var ret = validateParameter(helper.makeNumberParam('integer', true, 'int32'), value, models, validationContext);
    helper.assertValidationFailed(ret, ["testParam is required"]);
  });

  it('should not validate with required field undefined', function() {
    var ret = validateParameter(helper.makeNumberParam('integer', true, 'int32'), undefined, models, validationContext);
    helper.assertValidationFailed(ret, ["testParam is required"]);
  });

  it('should not validate with required field empty string', function() {
    var value = '';
    var ret = validateParameter(helper.makeNumberParam('integer', true, 'int32'), value, models, validationContext);
    helper.assertValidationFailed(ret, ["testParam is required"]);
  });

  it('should not validate with true boolean', function() {
    var value = true;
    var ret = validateParameter(helper.makeNumberParam('integer', false, 'int32'), value, models, validationContext);
    helper.assertValidationFailed(ret, ["testParam is not a type of int32"]);
  });

  it('should not validate with false boolean', function() {
    var value = false;
    var ret = validateParameter(helper.makeNumberParam('integer', false, 'int32'), value, models, validationContext);
    helper.assertValidationFailed(ret, ["testParam is not a type of int32"]);
  });

  it('should not validate with too large number', function() {
    var value = 1e4500; // jshint ignore:line
    var ret = validateParameter(helper.makeNumberParam('integer', false, 'int32'), value, models, validationContext);
    helper.assertValidationFailed(ret, ["testParam is not a type of int32"]);
  });

  it('should not validate with negative too large number', function() {
    var value = -1e4500; // jshint ignore:line
    var ret = validateParameter(helper.makeNumberParam('integer', false, 'int32'), value, models, validationContext);
    helper.assertValidationFailed(ret, ["testParam is not a type of int32"]);
  });

  it('should not validate with object', function() {
    var value = {};
    var ret = validateParameter(helper.makeNumberParam('integer', false, 'int32'), value, models, validationContext);
    helper.assertValidationFailed(ret, ["testParam is not a type of int32"]);
  });

  it('should not validate with empty array', function() {
    var value = [];
    var ret = validateParameter(helper.makeNumberParam('integer', false, 'int32'), value, models, validationContext);
    helper.assertValidationFailed(ret, ["testParam is not a type of int32"]);
  });

  it('should not validate with empty array containing numbers', function() {
    var value = [1, 2];
    var ret = validateParameter(helper.makeNumberParam('integer', false, 'int32'), value, models, validationContext);
    helper.assertValidationFailed(ret, ["testParam is not a type of int32"]);
  });

  it('should not validate with string', function() {
    var value = 'string';
    var ret = validateParameter(helper.makeNumberParam('integer', false, 'int32'), value, models, validationContext);
    helper.assertValidationFailed(ret, ["testParam is not a type of int32"]);
  });
});
