const helper = require('./test_helper');
const {assertValidationPassed, assertValidationFailed} = helper;
const {validateParameter} = require('../lib/validation/parameter');
const {ValidationContext} = require('../lib/validation/validationContext');

describe('string - byte', function() {
  let models;
  let validationContext;

  beforeEach(() => {
    models = undefined;
    validationContext = new ValidationContext();
  });

  it('should validate', function() {
    var value = [65, 32];
    var ret = validateParameter(helper.makeStringParam('string', false, 'byte'), value, models, validationContext);
    assertValidationPassed(ret, [value]);
  });

  it('should validate with random string', function() {
    var value = 'this is a string';
    var ret = validateParameter(helper.makeStringParam('string', false, 'byte'), value, models, validationContext);
    assertValidationPassed(ret, [value]);
  });

  it('should not validate with required field null', function() {
    var value = null;
    var ret = validateParameter(helper.makeStringParam('string', true, 'byte'), value, models, validationContext);
    assertValidationFailed(ret, ["testParam is required"]);
  });

  it('should not validate with required field undefined', function() {
    var ret = validateParameter(helper.makeStringParam('string', true, 'byte'), undefined, models, validationContext);
    assertValidationFailed(ret, ["testParam is required"]);
  });

  it('should not validate with required field empty string', function() {
    var value = '';
    var ret = validateParameter(helper.makeStringParam('string', true, 'byte'), value, models, validationContext);
    assertValidationFailed(ret, ["testParam is required"]);
  });
});
