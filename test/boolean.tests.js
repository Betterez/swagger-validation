'use strict';

var helper = require('./test_helper');
var {validateParameter} = require('../lib/validation/parameter');

describe('boolean', function() {
  it('should validate with true', function() {
    var value = true;
    var ret = validateParameter(helper.makeParam('boolean', false), value);
    helper.validateSuccess(ret, 1, [value]);
  });

  it('should validate with false', function() {
    var value = false;
    var ret = validateParameter(helper.makeParam('boolean', false), value);
    helper.validateSuccess(ret, 1, [value]);
  });

  it('should validate with true string', function() {
    var value = 'true';
    var transformedValue = true;
    var ret = validateParameter(helper.makeParam('boolean', false), value);
    helper.validateSuccess(ret, 1, [transformedValue]);
  });

  it('should validate with false string', function() {
    var value = 'false';
    var transformedValue = false;
    var ret = validateParameter(helper.makeParam('boolean', false), value);
    helper.validateSuccess(ret, 1, [transformedValue]);
  });

  it('should not validate with required field null', function() {
    var value = null;
    var ret = validateParameter(helper.makeParam('boolean', true), value);
    helper.validateError(ret, 1, ["testParam is required"]);
  });

  it('should not validate with required field undefined', function() {
    var ret = validateParameter(helper.makeParam('boolean', true), undefined);
    helper.validateError(ret, 1, ["testParam is required"]);
  });

  it('should not validate with required field empty string', function() {
    var value = '';
    var ret = validateParameter(helper.makeParam('boolean', true), value);
    helper.validateError(ret, 1, ["testParam is required"]);
  });

  it('should not validate with empty object', function() {
    var value = {};
    var ret = validateParameter(helper.makeParam('boolean', false), value);
    helper.validateError(ret, 1, ["testParam is not a type of boolean"]);
  });

  it('should not validate with number', function() {
    var value = 1;
    var ret = validateParameter(helper.makeParam('boolean', false), value);
    helper.validateError(ret, 1, ["testParam is not a type of boolean"]);
  });

  it('should not validate with True string', function() {
    var value = 'True';
    var ret = validateParameter(helper.makeParam('boolean', false), value);
    helper.validateError(ret, 1, ["testParam is not a type of boolean"]);
  });

  it('should not validate with False string', function() {
    var value = 'False';
    var ret = validateParameter(helper.makeParam('boolean', false), value);
    helper.validateError(ret, 1, ["testParam is not a type of boolean"]);
  });

  it('should not validate with random string', function() {
    var value = 'Hello World';
    var ret = validateParameter(helper.makeParam('boolean', false), value);
    helper.validateError(ret, 1, ["testParam is not a type of boolean"]);
  });

  it('should not validate with empty array', function() {
    var value = [];
    var ret = validateParameter(helper.makeParam('boolean', false), value);
    helper.validateError(ret, 1, ["testParam is not a type of boolean"]);
  });

  it('should not validate with empty array containing booleans', function() {
    var value = [true, false];
    var ret = validateParameter(helper.makeParam('boolean', false), value);
    helper.validateError(ret, 1, ["testParam is not a type of boolean"]);
  });

  it('should not validate with null if nullable is false', function () {
    const param = {
      type: 'boolean',
      required: false,
      name: 'testParam',
      nullable: false
    };

    const result = validateParameter(param, null);
    helper.validateError(result, 1, ['testParam cannot be null']);
  });
});
