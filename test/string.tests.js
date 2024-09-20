const helper = require('./test_helper');
const {assertValidationPassed, assertValidationFailed} = helper;
const {validateParameter} = require('../lib/validation/parameter');
const {expect} = require('chai');
const {ValidationContext} = require('../lib/validation/validationContext');
const {getValidationSettings} = require('../lib/validation/validationSettings');

describe('string', function () {
  let models;
  let validationContext;
  let validationSettings;

  beforeEach(() => {
    models = undefined;
    validationContext = new ValidationContext();
    validationSettings = getValidationSettings();
  });

  it('should validate', function () {
    var value = 'Hi';
    var ret = validateParameter({
      schema: helper.makeStringParam('string', false),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationPassed(ret, [value]);
  });

  it('should validate with large string', function () {
    var value = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';
    var ret = validateParameter({
      schema: helper.makeStringParam('string', false),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationPassed(ret, [value]);
  });

  it('should validate with enum', function () {
    var value = 'Hi';
    var ret = validateParameter({
      schema: helper.makeStringParam('string', false, undefined, undefined, ['Hi', 'Hello']),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationPassed(ret, [value]);
  });

  it('should validate maxLength', function () {
    var value = "ASDF";
    var ret = validateParameter({
      schema: helper.makeStringParam('string', false, undefined, undefined, undefined, undefined, 3),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["testParam requires a max length of 3"]);
  });

  it('should validate minLength', function () {
    var value = "A";
    var ret = validateParameter({
      schema: helper.makeStringParam('string', false, undefined, undefined, undefined, undefined, undefined, 2),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["testParam requires a min length of 2"]);
  });

  it('should validate when pattern does match', function () {
    var value = 'Heya';
    var ret = validateParameter({
      schema: helper.makeStringParam('string', false, null, '^Heya$'),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationPassed(ret, [value]);
  });

  var complexPattern = '^/dev/[^/]+(/[^/]+)*$';
  it('should detect when complex patterns do not match', function () {
    var value = 'should not match';
    var ret = validateParameter({
      schema: helper.makeStringParam('string', false, null, complexPattern),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["testParam is not valid based on the pattern ^/dev/[^/]+(/[^/]+)*$"]);
  });

  it('should detect when complex patterns do match', function () {
    var value = '/dev/sda';
    var ret = validateParameter({
      schema: helper.makeStringParam('string', false, null, complexPattern),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationPassed(ret, [value]);
  });

  var basicUrlPattern = '^((https?|ftp|file):\/\/[-a-zA-Z0-9+&@#%?=~_|!:,.;]+)?(\/?[-a-zA-Z0-9+&@#%=~_|?]+)*$';
  it('should detect when more complex patterns do not match', function () {
    var value = 'http://foo@#$';
    var ret = validateParameter({
      schema: helper.makeStringParam('string', false, null, basicUrlPattern),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["testParam is not valid based on the pattern ^((https?|ftp|file)://[-a-zA-Z0-9+&@#%?=~_|!:,.;]+)?(/?[-a-zA-Z0-9+&@#%=~_|?]+)*$"]);
  });

  it('should detect when more complex patterns do match', function () {
    var value = 'http://foo@#';
    var ret = validateParameter({
      schema: helper.makeStringParam('string', false, null, basicUrlPattern),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationPassed(ret, [value]);
  });

  it('should not validate with string with true boolean passed in for pattern', function () {
    var ret = validateParameter({
      schema: helper.makeStringParam('string', false, null, true),
      value: 'Does not matter',
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ['testParam is specified with an invalid pattern true']);
  });

  it('should not validate with string with false boolean passed in for pattern', function () {
    var ret = validateParameter({
      schema: helper.makeStringParam('string', false, null, false),
      value: 'Does not matter',
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ['testParam is specified with an invalid pattern false']);
  });

  it('should not validate with string with object passed in for pattern', function () {
    var ret = validateParameter({
      schema: helper.makeStringParam('string', false, null, {}),
      value: 'Does not matter',
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ['testParam is specified with an invalid pattern {}']);
  });

  it('should not validate with string with random string passed in for pattern', function () {
    var ret = validateParameter({
      schema: helper.makeStringParam('string', false, null, 'paosdaksnjkdashdjgad'),
      value: 'Does not matter',
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ['testParam is not valid based on the pattern paosdaksnjkdashdjgad']);
  });

  it('should not validate with enum', function () {
    var value = 'Hola';
    var ret = validateParameter({
      schema: helper.makeStringParam('string', false, undefined, undefined, ['Hi', 'Hello']),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["testParam is not a valid entry"]);
  });

  it('should not validate with enum case-sensitive', function () {
    var value = 'HI';
    var ret = validateParameter({
      schema: helper.makeStringParam('string', false, undefined, undefined, ['Hi', 'Hello']),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["testParam is not a valid entry"]);
  });

  it('should not validate with number', function () {
    var value = 1;
    var ret = validateParameter({
      schema: helper.makeStringParam('string', false),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["testParam is not a type of string"]);
  });

  it('should not validate with boolean', function () {
    var value = true;
    var ret = validateParameter({
      schema: helper.makeStringParam('string', false),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["testParam is not a type of string"]);
  });

  it('should not validate with empty object', function () {
    var value = {};
    var ret = validateParameter({
      schema: helper.makeStringParam('string', false),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["testParam is not a type of string"]);
  });
  it('should not validate with empty array', function () {
    var value = [];
    var ret = validateParameter({
      schema: helper.makeStringParam('string', false),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["testParam is not a type of string"]);
  });

  it('should not validate with array full of strings', function () {
    var value = ['this', 'is', 'a', 'string'];
    var ret = validateParameter({
      schema: helper.makeStringParam('string', false),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["testParam is not a type of string"]);
  });

  it('should not validate when pattern does not match', function () {
    var value = 'Heya';
    var ret = validateParameter({
      schema: helper.makeStringParam('string', false, null, '/^Goodbye$/i'),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["testParam is not valid based on the pattern /^Goodbye$/i"]);
  });

  describe('when the string is not required and an empty string is provided', function () {
    it('should allow an empty string when no "minLength" is specified', function () {
      const schema = {
        type: 'object',
        required: [],
        properties: {
          someString: {
            type: 'string'
          }
        }
      };
      const value = {someString: ''};
      const result = validateParameter({schema, value, models, validationContext, validationSettings});
      expect(result).to.eql([{value: {someString: ''}}]);
    });

    it('should allow an empty string when a "minLength" of 0 is specified', function () {
      const schema = {
        type: 'object',
        required: [],
        properties: {
          someString: {
            type: 'string',
            minLength: 0
          }
        }
      };
      const value = {someString: ''};
      const result = validateParameter({schema, value, models, validationContext, validationSettings});
      expect(result).to.eql([{value: {someString: ''}}]);
    });

    it('should not validate an empty string if a minLength greater than 0 is given', function () {
      const schema = {
        type: 'object',
        required: [],
        properties: {
          someString: {
            type: 'string',
            minLength: 1
          }
        }
      };
      const value = {someString: ''};
      var ret = validateParameter({schema, value, models, validationContext, validationSettings});
      assertValidationFailed(ret, ['someString requires a min length of 1']);
    });

    it('should not allow a null value if nullable is false, even when the string is optional', function () {
      const schema = {
        type: 'object',
        required: [],
        properties: {
          someString: {
            type: 'string',
            nullable: false
          }
        }
      };
      const value = {someString: null};
      const result = validateParameter({schema, value, models, validationContext, validationSettings});
      assertValidationFailed(result, ['someString cannot be null']);
    });
  });

  describe('invalid schemas', () => {
    it('should return a validation error when a string has an unknown format', () => {
      const results = validateParameter({
        schema: {
          type: 'string',
          format: 'day-of-week'
        },
        value: 'Some string',
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(results, ['Unknown param type day-of-week']);
    });

    it('should return a validation error when a string has a "pattern" which is not a string', () => {
      const results = validateParameter({
        schema: {
          type: 'string',
          pattern: /.*/,
        },
        value: 'Some string',
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(results, ['undefined is specified with an invalid pattern /.*/']);
    });

    it('should return a validation error when a string has a "pattern" which is not a parseable regular expression', () => {
      const results = validateParameter({
        schema: {
          type: 'string',
          pattern: '****',
        },
        value: 'Some string',
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(results, ["undefined is specified with an invalid pattern '****'"]);
    });

    describe('when the validation settings specify that an error should be thrown when there is a problem with the swagger schema', () => {
      beforeEach(() => {
        validationSettings.throwErrorsWhenSchemaIsInvalid = true;
      });

      it('should throw an error when a string has an unknown format', () => {
        expect(() => validateParameter({
          schema: {
            type: 'string',
            format: 'day-of-week'
          },
          value: 'Some string',
          models,
          validationContext,
          validationSettings
        })).to.throw('Swagger schema is invalid: string has unsupported format "day-of-week"');
      });

      it('should throw an error when a string has a "pattern" which is not a string', () => {
        expect(() => validateParameter({
          schema: {
            type: 'string',
            pattern: /.*/,
          },
          value: 'Some string',
          models,
          validationContext,
          validationSettings
        })).to.throw('Swagger schema is invalid: bad regular expression "/.*/".  Regular expressions must be provided as a string, and must have correct syntax')
      });

      it('should throw an error when a string has a "pattern" which is not a parseable regular expression', () => {
        expect(() => validateParameter({
          schema: {
            type: 'string',
            pattern: '****',
          },
          value: 'Some string',
          models,
          validationContext,
          validationSettings
        })).to.throw(`Swagger schema is invalid: bad regular expression "'****'".  Regular expressions must be provided as a string, and must have correct syntax`);
      });
    });
  });
});
