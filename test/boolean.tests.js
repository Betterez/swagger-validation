const helper = require('./test_helper');
const {assertValidationPassed, assertValidationFailed} = helper;
const {validateParameter} = require('../lib/validation/parameter');
const {ValidationContext} = require('../lib/validation/validationContext');
const {getValidationSettings} = require('../lib/validation/validationSettings');

describe('boolean', function () {
  let models;
  let validationContext;
  let validationSettings;

  beforeEach(() => {
    models = undefined;
    validationContext = new ValidationContext();
    validationSettings = getValidationSettings();
  });

  it('should validate with true', function () {
    var value = true;
    var ret = validateParameter({
      schema: helper.makeParam('boolean', false),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationPassed(ret, [value]);
  });

  it('should validate with false', function () {
    var value = false;
    var ret = validateParameter({
      schema: helper.makeParam('boolean', false),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationPassed(ret, [value]);
  });

  describe('handling of string values', () => {
    it('should allow a boolean to have the string value "true" (legacy behaviour)', function () {
      const result = validateParameter({
        schema: {
          type: 'boolean'
        },
        value: 'true',
        models,
        validationContext,
        validationSettings
      });
      assertValidationPassed(result, [true]);
    });

    it('should allow a boolean to have the string value "false" (legacy behaviour)', function () {
      const result = validateParameter({
        schema: {
          type: 'boolean'
        },
        value: 'false',
        models,
        validationContext,
        validationSettings
      });
      assertValidationPassed(result, [false]);
    });

    describe('when the validation settings specify that booleans cannot have string representations', () => {
      beforeEach(() => {
        validationSettings.allowStringRepresentationsOfBooleans = false;
      });

      it('should not allow a boolean to have the string value "true" (legacy behaviour)', function () {
        const result = validateParameter({
          schema: {
            type: 'boolean'
          },
          value: 'true',
          models,
          validationContext,
          validationSettings
        });
        assertValidationFailed(result, ['undefined is not a type of boolean']);
      });

      it('should not allow a boolean to have the string value "false" (legacy behaviour)', function () {
        const result = validateParameter({
          schema: {
            type: 'boolean'
          },
          value: 'false',
          models,
          validationContext,
          validationSettings
        });
        assertValidationFailed(result, ['undefined is not a type of boolean']);
      });
    });
  })

  it('should not validate with empty object', function () {
    var value = {};
    var ret = validateParameter({
      schema: helper.makeParam('boolean', false),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["testParam is not a type of boolean"]);
  });

  it('should not validate with number', function () {
    var value = 1;
    var ret = validateParameter({
      schema: helper.makeParam('boolean', false),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["testParam is not a type of boolean"]);
  });

  it('should not validate with True string', function () {
    var value = 'True';
    var ret = validateParameter({
      schema: helper.makeParam('boolean', false),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["testParam is not a type of boolean"]);
  });

  it('should not validate with False string', function () {
    var value = 'False';
    var ret = validateParameter({
      schema: helper.makeParam('boolean', false),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["testParam is not a type of boolean"]);
  });

  it('should not validate with random string', function () {
    var value = 'Hello World';
    var ret = validateParameter({
      schema: helper.makeParam('boolean', false),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["testParam is not a type of boolean"]);
  });

  it('should not validate with empty array', function () {
    var value = [];
    var ret = validateParameter({
      schema: helper.makeParam('boolean', false),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["testParam is not a type of boolean"]);
  });

  it('should not validate with empty array containing booleans', function () {
    var value = [true, false];
    var ret = validateParameter({
      schema: helper.makeParam('boolean', false),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["testParam is not a type of boolean"]);
  });

  it('should not allow a null value if nullable is false, even if the boolean is optional', function () {
    const schema = {
      type: 'object',
      required: [],
      properties: {
        someBoolean: {
          type: 'boolean',
          nullable: false
        }
      }
    };
    const value = {someBoolean: null};
    const result = validateParameter({schema, value, models, validationContext, validationSettings});
    assertValidationFailed(result, ['someBoolean cannot be null']);
  });
});
