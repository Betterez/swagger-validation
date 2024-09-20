const {expect} = require('chai');
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

  describe('when the validation settings specify that the "date" format is unsupported', () => {
    beforeEach(() => {
      validationSettings.allowStringsToHaveUnreliableDateFormat = false;
    });

    it('should not allow a string to have the "date" format', function () {
      const result = validateParameter({
        schema: {
          type: 'string',
          format: 'date'
        },
        value: '2014-01-01',
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(result, ['Swagger schema is invalid: string has "date" format, but this format is unreliable because it parses dates without considering timezones.  Use the "date-time" format instead, or define a "pattern" to validate the format of the date string, and parse it yourself.']);
    });

    describe('when the validation settings specify that an error should be thrown when there is a problem with the swagger schema', () => {
      beforeEach(() => {
        validationSettings.throwErrorsWhenSchemaIsInvalid = true;
      });

      it('should throw an error when a string has the "date" format', function () {
        expect(() => validateParameter({
          schema: {
            type: 'string',
            format: 'date'
          },
          value: '2014-01-01',
          models,
          validationContext,
          validationSettings
        })).to.throw('Swagger schema is invalid: string has "date" format, but this format is unreliable because it parses dates without considering timezones.  Use the "date-time" format instead, or define a "pattern" to validate the format of the date string, and parse it yourself.');
      });
    });
  });
});
