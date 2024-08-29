const helper = require('./test_helper');
const {assertValidationPassed, assertValidationFailed} = helper;
const {validateParameter} = require('../lib/validation/parameter');
const {expect} = require('chai');
const {ValidationContext} = require('../lib/validation/validationContext');

describe('string', function () {
  let models;
  let validationContext;

  beforeEach(() => {
    models = undefined;
    validationContext = new ValidationContext();
  });

  it('should validate', function () {
    var value = 'Hi';
    var ret = validateParameter({
      schema: helper.makeStringParam('string', false),
      value,
      models,
      validationContext
    });
    assertValidationPassed(ret, [value]);
  });

  it('should validate with large string', function () {
    var value = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';
    var ret = validateParameter({
      schema: helper.makeStringParam('string', false),
      value,
      models,
      validationContext
    });
    assertValidationPassed(ret, [value]);
  });

  it('should validate with enum', function () {
    var value = 'Hi';
    var ret = validateParameter({
      schema: helper.makeStringParam('string', false, undefined, undefined, ['Hi', 'Hello']),
      value,
      models,
      validationContext
    });
    assertValidationPassed(ret, [value]);
  });

  it('should validate maxLength', function () {
    var value = "ASDF";
    var ret = validateParameter({
      schema: helper.makeStringParam('string', false, undefined, undefined, undefined, undefined, 3),
      value,
      models,
      validationContext
    });
    assertValidationFailed(ret, ["testParam requires a max length of 3"]);
  });

  it('should validate minLength', function () {
    var value = "A";
    var ret = validateParameter({
      schema: helper.makeStringParam('string', false, undefined, undefined, undefined, undefined, undefined, 2),
      value,
      models,
      validationContext
    });
    assertValidationFailed(ret, ["testParam requires a min length of 2"]);
  });

  it('should validate when pattern does match', function () {
    var value = 'Heya';
    var ret = validateParameter({
      schema: helper.makeStringParam('string', false, null, '^Heya$'),
      value,
      models,
      validationContext
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
      validationContext
    });
    assertValidationFailed(ret, ["testParam is not valid based on the pattern ^/dev/[^/]+(/[^/]+)*$"]);
  });

  it('should detect when complex patterns do match', function () {
    var value = '/dev/sda';
    var ret = validateParameter({
      schema: helper.makeStringParam('string', false, null, complexPattern),
      value,
      models,
      validationContext
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
      validationContext
    });
    assertValidationFailed(ret, ["testParam is not valid based on the pattern ^((https?|ftp|file)://[-a-zA-Z0-9+&@#%?=~_|!:,.;]+)?(/?[-a-zA-Z0-9+&@#%=~_|?]+)*$"]);
  });

  it('should detect when more complex patterns do match', function () {
    var value = 'http://foo@#';
    var ret = validateParameter({
      schema: helper.makeStringParam('string', false, null, basicUrlPattern),
      value,
      models,
      validationContext
    });
    assertValidationPassed(ret, [value]);
  });

  it('should not validate with string with true boolean passed in for pattern', function () {
    var ret = validateParameter({
      schema: helper.makeStringParam('string', false, null, true),
      value: 'Does not matter',
      models,
      validationContext
    });
    assertValidationFailed(ret, ['testParam is specified with an invalid pattern true']);
  });

  it('should not validate with string with false boolean passed in for pattern', function () {
    var ret = validateParameter({
      schema: helper.makeStringParam('string', false, null, false),
      value: 'Does not matter',
      models,
      validationContext
    });
    assertValidationFailed(ret, ['testParam is specified with an invalid pattern false']);
  });

  it('should not validate with string with object passed in for pattern', function () {
    var ret = validateParameter({
      schema: helper.makeStringParam('string', false, null, {}),
      value: 'Does not matter',
      models,
      validationContext
    });
    assertValidationFailed(ret, ['testParam is specified with an invalid pattern {}']);
  });

  it('should not validate with string with random string passed in for pattern', function () {
    var ret = validateParameter({
      schema: helper.makeStringParam('string', false, null, 'paosdaksnjkdashdjgad'),
      value: 'Does not matter',
      models,
      validationContext
    });
    assertValidationFailed(ret, ['testParam is not valid based on the pattern paosdaksnjkdashdjgad']);
  });

  it('should not validate with required field null', function () {
    var value = null;
    var ret = validateParameter({
      schema: helper.makeStringParam('string', true),
      value,
      models,
      validationContext
    });
    assertValidationFailed(ret, ["testParam is required"]);
  });

  it('should not validate with required field undefined', function () {
    var ret = validateParameter({
      schema: helper.makeStringParam('string', true),
      value: undefined,
      models,
      validationContext
    });
    assertValidationFailed(ret, ["testParam is required"]);
  });

  it('should not validate with required field empty string', function () {
    var value = '';
    var ret = validateParameter({
      schema: helper.makeStringParam('string', true),
      value,
      models,
      validationContext
    });
    assertValidationFailed(ret, ["testParam is required"]);
  });

  it('should not validate with enum', function () {
    var value = 'Hola';
    var ret = validateParameter({
      schema: helper.makeStringParam('string', false, undefined, undefined, ['Hi', 'Hello']),
      value,
      models,
      validationContext
    });
    assertValidationFailed(ret, ["testParam is not a valid entry"]);
  });

  it('should not validate with enum case-sensitive', function () {
    var value = 'HI';
    var ret = validateParameter({
      schema: helper.makeStringParam('string', false, undefined, undefined, ['Hi', 'Hello']),
      value,
      models,
      validationContext
    });
    assertValidationFailed(ret, ["testParam is not a valid entry"]);
  });

  it('should not validate with number', function () {
    var value = 1;
    var ret = validateParameter({
      schema: helper.makeStringParam('string', false),
      value,
      models,
      validationContext
    });
    assertValidationFailed(ret, ["testParam is not a type of string"]);
  });

  it('should not validate with boolean', function () {
    var value = true;
    var ret = validateParameter({
      schema: helper.makeStringParam('string', false),
      value,
      models,
      validationContext
    });
    assertValidationFailed(ret, ["testParam is not a type of string"]);
  });

  it('should not validate with empty object', function () {
    var value = {};
    var ret = validateParameter({
      schema: helper.makeStringParam('string', false),
      value,
      models,
      validationContext
    });
    assertValidationFailed(ret, ["testParam is not a type of string"]);
  });
  it('should not validate with empty array', function () {
    var value = [];
    var ret = validateParameter({
      schema: helper.makeStringParam('string', false),
      value,
      models,
      validationContext
    });
    assertValidationFailed(ret, ["testParam is not a type of string"]);
  });

  it('should not validate with array full of strings', function () {
    var value = ['this', 'is', 'a', 'string'];
    var ret = validateParameter({
      schema: helper.makeStringParam('string', false),
      value,
      models,
      validationContext
    });
    assertValidationFailed(ret, ["testParam is not a type of string"]);
  });

  it('should not validate when pattern does not match', function () {
    var value = 'Heya';
    var ret = validateParameter({
      schema: helper.makeStringParam('string', false, null, '/^Goodbye$/i'),
      value,
      models,
      validationContext
    });
    assertValidationFailed(ret, ["testParam is not valid based on the pattern /^Goodbye$/i"]);
  });


  describe('string - when required is false and an empty string is provided', function () {
    it('should allow an empty string when no "minLength" is specified', function () {
      const value = '';
      const schema = {
        type: 'string',
        required: false,
        name: 'testParam'
      };
      const result = validateParameter({schema, value, models, validationContext});
      expect(result).to.eql([{value: ''}]);
    });

    it('should allow an empty string when a "minLength" of 0 is specified', function () {
      const value = '';
      const schema = {
        type: 'string',
        required: false,
        name: 'testParam',
        minLength: 0
      };
      const result = validateParameter({schema, value, models, validationContext});
      expect(result).to.eql([{value: ''}]);
    });

    it('should not validate an empty string if a minLength greater than 0 is given', function () {
      var value = '';
      var schema = {
        type: 'string',
        required: false,
        name: 'testParam',
        minLength: 1
      };
      var ret = validateParameter({schema, value, models, validationContext});
      assertValidationFailed(ret, ['testParam requires a min length of 1']);
    });

    it('should not validate a null if nullable is false', function () {
      const schema = {
        type: 'string',
        required: false,
        name: 'testParam',
        nullable: false
      };

      const result = validateParameter({schema, value: null, models, validationContext});
      assertValidationFailed(result, ['testParam cannot be null']);
    });
  });
});
