const helper = require('./test_helper');
const {validateParameter} = require('../lib/validation/parameter');
const {ValidationContext} = require('../lib/validation/validationContext');

describe('file', function() {
  let models;
  let validationContext;

  beforeEach(() => {
    models = undefined;
    validationContext = new ValidationContext();
  });

  it('should validate', function() {
    var value = [65, 32];
    var ret = validateParameter(helper.makeParam('file', false), value, models, validationContext);
    helper.assertValidationPassed(ret, [value]);
  });

  it('should validate with random string', function() {
    var value = 'this is a string';
    var ret = validateParameter(helper.makeParam('file', false), value, models, validationContext);
    helper.assertValidationPassed(ret, [value]);
  });

  it('should not validate with required field null', function() {
    var value = null;
    var ret = validateParameter(helper.makeParam('file', true), value, models, validationContext);
    helper.assertValidationFailed(ret, ["testParam is required"]);
  });

  it('should not validate with required field undefined', function() {
    var ret = validateParameter(helper.makeParam('file', true), undefined, models, validationContext);
    helper.assertValidationFailed(ret, ['testParam is required']);
  });

  it('should not validate with required field empty string', function() {
    var value = '';
    var ret = validateParameter(helper.makeParam('file', true), value, models, validationContext);
    helper.assertValidationFailed(ret, ['testParam is required']);
  });
});
