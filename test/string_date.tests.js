const moment = require('moment');
const helper = require('./test_helper');
const {assertValidationPassed, assertValidationFailed} = helper;
const {validateParameter} = require('../lib/validation/parameter');
const {ValidationContext} = require('../lib/validation/validationContext');
const {getValidationSettings} = require('../lib/validation/validationSettings');

describe('string - date', function () {
  let models;
  let validationContext;
  let validationSettings;

  beforeEach(() => {
    models = undefined;
    validationContext = new ValidationContext();
    validationSettings = getValidationSettings();
  });

  it('should validate', function () {
    var value = '2014-01-01';
    var expected = moment('2014-01-01', 'YYYY-MM-DD').toDate();
    var ret = validateParameter({
      schema: helper.makeStringParam('string', false, 'date'),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationPassed(ret, [expected]);
  });

  it('a date should always validate', function () {
    var expected = moment('2014-01-01', 'YYYY-MM-DD').toDate();
    var ret = validateParameter({
      schema: helper.makeStringParam('string', false, 'date'),
      value: expected,
      models,
      validationContext,
      validationSettings
    });
    assertValidationPassed(ret, [expected]);
  });

  it('should validate with custom pattern', function () {
    var value = '1/1/2014 5:00PM';
    var expected = moment('1/1/2014', 'M/D/YYYY').toDate();
    var ret = validateParameter({
      schema: helper.makeStringParam('string', false, 'date', 'M/D/YYYY'),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationPassed(ret, [expected]);
  });

  it('should not validate with random string', function () {
    var value = 'this is a string that does not match ISO 8601';
    var ret = validateParameter({
      schema: helper.makeStringParam('string', false, 'date'),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["testParam is not valid based on the pattern for moment.ISO 8601"]);
  });
});
