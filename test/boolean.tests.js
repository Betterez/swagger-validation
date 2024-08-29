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

  it('should validate with true string', function () {
    var value = 'true';
    var transformedValue = true;
    var ret = validateParameter({
      schema: helper.makeParam('boolean', false),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationPassed(ret, [transformedValue]);
  });

  it('should validate with false string', function () {
    var value = 'false';
    var transformedValue = false;
    var ret = validateParameter({
      schema: helper.makeParam('boolean', false),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationPassed(ret, [transformedValue]);
  });

  it('should not validate with required field null', function () {
    var value = null;
    var ret = validateParameter({
      schema: helper.makeParam('boolean', true),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["testParam is required"]);
  });

  it('should not validate with required field undefined', function () {
    var ret = validateParameter({
      schema: helper.makeParam('boolean', true),
      value: undefined,
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["testParam is required"]);
  });

  it('should not validate with required field empty string', function () {
    var value = '';
    var ret = validateParameter({
      schema: helper.makeParam('boolean', true),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["testParam is required"]);
  });

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

  it('should not validate with null if nullable is false', function () {
    const schema = {
      type: 'boolean',
      required: false,
      name: 'testParam',
      nullable: false
    };

    const result = validateParameter({schema, value: null, models, validationContext, validationSettings});
    assertValidationFailed(result, ['testParam cannot be null']);
  });
});
