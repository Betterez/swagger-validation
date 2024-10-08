const helper = require('./test_helper');
const {assertValidationPassed, assertValidationFailed} = helper;
const {validateParameter} = require('../lib/validation/parameter');
const {ValidationContext} = require('../lib/validation/validationContext');
const {getValidationSettings} = require('../lib/validation/validationSettings');

describe('string - byte', function () {
  let models;
  let validationContext;
  let validationSettings;

  beforeEach(() => {
    models = undefined;
    validationContext = new ValidationContext();
    validationSettings = getValidationSettings();
  });

  it('should validate', function () {
    var value = [65, 32];
    var ret = validateParameter({
      schema: helper.makeStringParam('string', false, 'byte'),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationPassed(ret, [value]);
  });

  it('should validate with random string', function () {
    var value = 'this is a string';
    var ret = validateParameter({
      schema: helper.makeStringParam('string', false, 'byte'),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationPassed(ret, [value]);
  });
});
