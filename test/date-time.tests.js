const {expect} = require('chai');
const {validateParameter} = require('../lib/validation/parameter');
const {ValidationContext} = require("../lib/validation/validationContext");
const {getValidationSettings} = require("../lib/validation/validationSettings");
const {assertValidationPassed, assertValidationFailed} = require("./test_helper");

describe('date-time', () => {
  let models;
  let validationContext;
  let validationSettings;

  beforeEach(() => {
    models = undefined;
    validationContext = new ValidationContext();
    validationSettings = getValidationSettings();
  });

  it('should accept an ISO 8601 date string', () => {
    const iso8601DateString = '2024-01-23T12:05:39.797Z';
    const results = validateParameter({
      schema: {
        type: 'string',
        format: 'date-time'
      },
      value: iso8601DateString,
      models,
      validationContext,
      validationSettings
    });

    assertValidationPassed(results);
  });

  it('should accept a date string in YYYY-MM-DD format, even though this format does not include a time component (legacy logic)', () => {
    const dateString = '2024-01-23';
    const results = validateParameter({
      schema: {
        type: 'string',
        format: 'date-time'
      },
      value: dateString,
      models,
      validationContext,
      validationSettings
    });

    assertValidationPassed(results);
  });

  it('should return a result which matches the input date when the input date is specified in ISO 8601 format', () => {
    const iso8601DateString = '2024-01-23T12:05:39.797Z';
    const results = validateParameter({
      schema: {
        type: 'string',
        format: 'date-time'
      },
      value: iso8601DateString,
      models,
      validationContext,
      validationSettings
    });

    assertValidationPassed(results);

    expect(results[0].value).to.be.a('date');
    expect(results[0].value).to.eql(new Date(iso8601DateString));
  });

  describe('invalid dates', () => {
    it('should accept a date which is malformed (legacy logic)', () => {
      const dateString = '100110/09/2015';
      const results = validateParameter({
        schema: {
          type: 'string',
          format: 'date-time',
          pattern: 'MM/DD/YYYY'
        },
        value: dateString,
        models,
        validationContext,
        validationSettings
      });

      assertValidationPassed(results);
    });

    describe('when the validation settings specify that strict date parsing should be used', () => {
      beforeEach(() => {
        validationSettings.strictDateParsing = true;
      });

      it('should not accept a date which is malformed', () => {
        const dateString = '100110/09/2015';
        const results = validateParameter({
          schema: {
            type: 'string',
            format: 'date-time',
            pattern: 'MM/DD/YYYY'
          },
          value: dateString,
          models,
          validationContext,
          validationSettings
        });

        assertValidationFailed(results, ['undefined is not valid based on the pattern MM/DD/YYYY']);
      });
    });
  });
});
