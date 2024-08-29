const moment = require('moment');
const helper = require('./test_helper');
const {assertValidationPassed, assertValidationFailed} = helper;
const {validateParameter} = require('../lib/validation/parameter');
const {ValidationContext} = require('../lib/validation/validationContext');

describe('string - datetime', function() {
  let models;
  let validationContext;

  beforeEach(() => {
    models = undefined;
    validationContext = new ValidationContext();
  });

  it('should validate', function() {
    var value = '2014-01-01T17:00:00-0700';
    var expected = moment('2014-01-01T17:00:00-0700').toDate();
    var ret = validateParameter(helper.makeStringParam('string', false, 'date-time'), value, models, validationContext);
    assertValidationPassed(ret, [expected]);
  });

  it('a date should always validate', function() {
    var expected = moment('2014-01-01T17:00:00-0700').toDate();
    var ret = validateParameter(helper.makeStringParam('string', false, 'date-time'), expected, models, validationContext);
    assertValidationPassed(ret, [expected]);
  });

  it('should validate with custom pattern', function() {
    var value = '1/1/2014 5:00PM';
    var expected = moment('2014-01-01T17:00:00').toDate();
    var ret = validateParameter(helper.makeStringParam('string', false, 'date-time', 'M/D/YYYY h:mmA'), value, models, validationContext);
    assertValidationPassed(ret, [expected]);
  });

  it('should not validate with random string', function() {
    var value = 'this is a string that does not match ISO 8601';
    var ret = validateParameter(helper.makeStringParam('string', false, 'date-time'), value, models, validationContext);
    assertValidationFailed(ret, ["testParam is not valid based on the pattern for moment.ISO 8601"]);
  });

  it('should not validate with required field null', function() {
    var value = null;
    var ret = validateParameter(helper.makeStringParam('string', true, 'date-time'), value, models, validationContext);
    assertValidationFailed(ret, ["testParam is required"]);
  });

  it('should not validate with required field undefined', function() {
    var ret = validateParameter(helper.makeStringParam('string', true, 'date-time'), undefined, models, validationContext);
    assertValidationFailed(ret, ["testParam is required"]);
  });

  it('should not validate with required field empty string', function() {
    var value = '';
    var ret = validateParameter(helper.makeStringParam('string', true, 'date-time'), value, models, validationContext);
    assertValidationFailed(ret, ["testParam is required"]);
  });
});
