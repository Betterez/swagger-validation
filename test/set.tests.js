const moment = require('moment');
const helper = require('./test_helper');
const {validateParameter} = require('../lib/validation/parameter');
const {ValidationContext} = require('../lib/validation/validationContext');

describe('set', function() {
  let models;
  let validationContext;

  beforeEach(() => {
    models = undefined;
    validationContext = new ValidationContext();
  });

  it('should validate with number with no format', function() {
    var ret = validateParameter(helper.makeArrayParam(false, 'number', null, true), ['1', '2'], models, validationContext);
    helper.assertValidationPassed(ret, [
      [1, 2]
    ]);
  });

  it('should validate with number with float format', function() {
    var ret = validateParameter(helper.makeArrayParam(false, 'number', 'float', null, true), [1, '2.0'], models, validationContext);
    helper.assertValidationPassed(ret, [
      [1, 2.0]
    ]);
  });

  it('should validate with number with double format', function() {
    var ret = validateParameter(helper.makeArrayParam(false, 'number', 'double', null, true), [1.265, '2.2352', 2e0, 0x88], models, validationContext);
    helper.assertValidationPassed(ret, [
      [1.265, 2.2352, 2e0, 0x88]
    ]);
  });

  it('should validate with integer with no format', function() {
    var ret = validateParameter(helper.makeArrayParam(false, 'integer', null, null, true), ['1', '2'], models, validationContext);
    helper.assertValidationPassed(ret, [
      [1, 2]
    ]);
  });

  it('should validate with integer with int32 format', function() {
    var ret = validateParameter(helper.makeArrayParam(false, 'integer', 'int32', null, true), [1, '2.0'], models, validationContext);
    helper.assertValidationPassed(ret, [
      [1, 2.0]
    ]);
  });

  it('should validate with integer with int64 format', function() {
    var ret = validateParameter(helper.makeArrayParam(false, 'integer', 'int64', null, true), [123132, 2e0, 0x88], models, validationContext);
    helper.assertValidationPassed(ret, [
      [123132, 2e0, 0x88]
    ]);
  });

  it('should validate with string with no format', function() {
    var ret = validateParameter(helper.makeArrayParam(false, 'string', null, null, true), ['These', 'are', 'a', 'lot', 'of', 'strings'], models, validationContext);
    helper.assertValidationPassed(ret, [
      ['These', 'are', 'a', 'lot', 'of', 'strings']
    ]);
  });

  it('should validate with string with byte format', function() {
    var ret = validateParameter(helper.makeArrayParam(false, 'string', 'byte', null, true), [65, 35, 23], models, validationContext);
    helper.assertValidationPassed(ret, [
      [65, 35, 23]
    ]);
  });

  it('should validate with string with date format', function() {
    var ret = validateParameter(helper.makeArrayParam(false, 'string', 'date', 'M-D-YYYY', true), ['8-9-2014', '1-1-1970'], models, validationContext);
    helper.assertValidationPassed(ret, [
      [moment('2014-08-09').toDate(), moment('1970-01-01').toDate()]
    ]);
  });

  it('should validate with string with date-time format', function() {
    var ret = validateParameter(helper.makeArrayParam(false, 'string', 'date-time', 'M-D-YYYY h:mmA', true), ['8-9-2014 12:00AM', '1-1-1970 1:32PM'], models, validationContext);
    helper.assertValidationPassed(ret, [
      [moment('2014-08-09T00:00:00').toDate(), moment('1970-01-01T13:32:00').toDate()]
    ]);
  });

  it('should validate with simple objects', function() {
    var model = {
      Test: {
        id: 'Test',
        name: 'Test',
        properties: {
          id: {type: 'number'}
        }
      }
    };

    var ret = validateParameter(helper.makeArrayParam(false, 'Test', null, null, true), [
      {id: 1.23},
      {id: 1.24},
      {id: 1.25}
    ], model, validationContext);
    helper.assertValidationPassed(ret, [
      [
        {id: 1.23},
        {id: 1.24},
        {id: 1.25}
      ]
    ]);
  });

  it('should validate with complex objects', function() {
    var model = {
      Test: {
        id: 'Test',
        name: 'Test',
        properties: {
          test1: {type: 'integer'},
          test2: {type: 'string'},
          test3: {type: 'boolean'}
        }
      }
    };

    var ret = validateParameter(helper.makeArrayParam(false, 'Test', null, null, true), [
      {test1: 1, test2: 'string', test3: true},
      {test1: 1, test2: 'string', test3: false}
    ], model, validationContext);
    helper.assertValidationPassed(ret, [
      [
        {test1: 1, test2: 'string', test3: true},
        {test1: 1, test2: 'string', test3: false}
      ]
    ]);
  });

  it('should not validate with required field null', function() {
    var ret = validateParameter(helper.makeArrayParam(true, 'string', null, null, true), null, models, validationContext);
    helper.assertValidationFailed(ret, ["testParam is required"]);
  });

  it('should not validate with required field undefined', function() {
    var ret = validateParameter(helper.makeArrayParam(true, 'number', null, null, true), undefined, models, validationContext);
    helper.assertValidationFailed(ret, ["testParam is required"]);
  });

  it('should not validate with required field empty string', function() {
    var ret = validateParameter(helper.makeArrayParam(true, 'integer', null, null, true), '', models, validationContext);
    helper.assertValidationFailed(ret, ["testParam is required"]);
  });

  it('should not validate with empty object', function() {
    var ret = validateParameter(helper.makeArrayParam(false, 'boolean', null, null, true), {}, models, validationContext);
    helper.assertValidationFailed(ret, ["testParam is not a type of set"]);
  });

  it('should not validate with one error with number with no format', function() {
    var ret = validateParameter(helper.makeArrayParam(false, 'number', null, null, true), ['1', 'thisisastring'], models, validationContext);
    helper.assertValidationFailed(ret, ["thisisastring is not a type of number"]);
  });

  it('should not validate with one error with number with float format', function() {
    var ret = validateParameter(helper.makeArrayParam(false, 'number', 'float', null, true), [1, 'thisisastring'], models, validationContext);
    helper.assertValidationFailed(ret, ["thisisastring is not a type of float"]);
  });

  it('should not validate with one error with number with double format', function() {
    var ret = validateParameter(helper.makeArrayParam(false, 'number', 'double', null, true), [1.265, '2.2352', 2e0, 0x88, 'thisisastring'], models, validationContext);
    helper.assertValidationFailed(ret, ["thisisastring is not a type of double"]);
  });

  it('should not validate with one error with integer with no format', function() {
    var ret = validateParameter(helper.makeArrayParam(false, 'integer', null, null, true), ['1', '2', 'thisisastring'], models, validationContext);
    helper.assertValidationFailed(ret, ["thisisastring is not a type of integer"]);
  });

  it('should not validate with one error with integer with int32 format', function() {
    var ret = validateParameter(helper.makeArrayParam(false, 'integer', 'int32', null, true), [1, '2.0', 'thisisastring'], models, validationContext);
    helper.assertValidationFailed(ret, ["thisisastring is not a type of int32"]);
  });

  it('should not validate with one error with integer with int64 format', function() {
    var ret = validateParameter(helper.makeArrayParam(false, 'integer', 'int64', null, true), [2e0, 0x88, 'thisisastring'], models, validationContext);
    helper.assertValidationFailed(ret, ["thisisastring is not a type of int64"]);
  });

  it('should not validate with one error with string with no format', function() {
    var ret = validateParameter(helper.makeArrayParam(false, 'string', null, null, true), ['These', 'are', 'a', 'lot', 'of', 'strings', 1], models, validationContext);
    helper.assertValidationFailed(ret, ["1 is not a type of string"]);
  });

  it('should not validate with two errors with number with no format', function() {
    var ret = validateParameter(helper.makeArrayParam(false, 'number', null, null, true), ['1', 'thisisastring', 'thisisalsoastring'], models, validationContext);
    helper.assertValidationFailed(ret, ["thisisastring is not a type of number", "thisisalsoastring is not a type of number"]);
  });

  it('should not validate with two errors with number with float format', function() {
    var ret = validateParameter(helper.makeArrayParam(false, 'number', 'float', null, true), [1, 'thisisastring', 'thisisalsoastring'], models, validationContext);
    helper.assertValidationFailed(ret, ["thisisastring is not a type of float", "thisisalsoastring is not a type of float"]);
  });

  it('should not validate with two errors with number with double format', function() {
    var ret = validateParameter(helper.makeArrayParam(false, 'number', 'double', null, true), [1.265, '2.2352', 2e0, 0x88, 'thisisastring', 'thisisalsoastring'], models, validationContext);
    helper.assertValidationFailed(ret, ["thisisastring is not a type of double", "thisisalsoastring is not a type of double"]);
  });

  it('should not validate with two errors with integer with no format', function() {
    var ret = validateParameter(helper.makeArrayParam(false, 'integer', null, null, true), ['1', '2', 'thisisastring', 'thisisalsoastring'], models, validationContext);
    helper.assertValidationFailed(ret, ["thisisastring is not a type of integer", "thisisalsoastring is not a type of integer"]);
  });

  it('should not validate with two errors with integer with int32 format', function() {
    var ret = validateParameter(helper.makeArrayParam(false, 'integer', 'int32', null, true), [1, '2.0', 'thisisastring', 'thisisalsoastring'], models, validationContext);
    helper.assertValidationFailed(ret, ["thisisastring is not a type of int32", "thisisalsoastring is not a type of int32"]);
  });

  it('should not validate with two errors with integer with int64 format', function() {
    var ret = validateParameter(helper.makeArrayParam(false, 'integer', 'int64', null, true), [2e0, 0x88, 'thisisastring', 'thisisalsoastring'], models, validationContext);
    helper.assertValidationFailed(ret, ["thisisastring is not a type of int64", "thisisalsoastring is not a type of int64"]);
  });

  it('should not validate with two errors with string with no format', function() {
    var ret = validateParameter(helper.makeArrayParam(false, 'string', null, null, true), ['These', 'are', 'a', 'lot', 'of', 1, true, 'strings'], models, validationContext);
    helper.assertValidationFailed(ret, ["1 is not a type of string", "true is not a type of string"]);
  });

  it('should not validate with non-uniqueness with number with no format', function() {
    var ret = validateParameter(helper.makeArrayParam(false, 'number', null, null, true), ['1', 1], models, validationContext);
    helper.assertValidationFailed(ret, ["testParam is not unique. This may lead to an unintended loss of data"]);
  });

  it('should not validate with non-uniqueness with number with float format', function() {
    var ret = validateParameter(helper.makeArrayParam(false, 'number', 'float', null, true), [11.23213, '11.23213'], models, validationContext);
    helper.assertValidationFailed(ret, ["testParam is not unique. This may lead to an unintended loss of data"]);
  });

  it('should not validate with non-uniqueness with number with double format', function() {
    var ret = validateParameter(helper.makeArrayParam(false, 'number', 'double', null, true), [1.265, '2.2352', 2e0, 0x88, 2], models, validationContext);
    helper.assertValidationFailed(ret, ["testParam is not unique. This may lead to an unintended loss of data"]);
  });

  it('should not validate with non-uniqueness with integer with no format', function() {
    var ret = validateParameter(helper.makeArrayParam(false, 'integer', null, null, true), ['1', '2', 1], models, validationContext);
    helper.assertValidationFailed(ret, ["testParam is not unique. This may lead to an unintended loss of data"]);
  });

  it('should not validate with non-uniqueness with integer with int32 format', function() {
    var ret = validateParameter(helper.makeArrayParam(false, 'integer', 'int32', null, true), [1, '2.0', 2e0], models, validationContext);
    helper.assertValidationFailed(ret, ["testParam is not unique. This may lead to an unintended loss of data"]);
  });

  it('should not validate with non-uniqueness with integer with int64 format', function() {
    var ret = validateParameter(helper.makeArrayParam(false, 'integer', 'int64', null, true), [Number.MAX_VALUE, 2e0, 0x88, Number.MAX_VALUE], models, validationContext);
    helper.assertValidationFailed(ret, ["testParam is not unique. This may lead to an unintended loss of data"]);
  });

  it('should not validate with non-uniqueness with string with no format', function() {
    var ret = validateParameter(helper.makeArrayParam(false, 'string', null, null, true), ['These', 'are', 'a', 'lot', 'of', 'strings', 'strings'], models, validationContext);
    helper.assertValidationFailed(ret, ["testParam is not unique. This may lead to an unintended loss of data"]);
  });

  it('should not validate with simple objects', function() {
    var model = {
      Test: {
        id: 'Test',
        name: 'Test',
        properties: {
          id: {type: 'number'}
        }
      }
    };

    var ret = validateParameter(helper.makeArrayParam(false, 'Test', null, null, true), [
      {id: 1},
      {id: 'Yo'}
    ], model, validationContext);
    helper.assertValidationFailed(ret, ["id is not a type of number"]);
  });

  it('should not validate with complex objects', function() {

    var model = {
      Test: {
        id: 'Test',
        name: 'Test',
        properties: {
          test1: {type: 'integer'},
          test2: {type: 'string'},
          test3: {type: 'boolean'}
        }
      }
    };

    var ret = validateParameter(helper.makeArrayParam(false, 'Test', null, null, true), [
      {test1: 'No', test2: true, test3: 1}
    ], model, validationContext);
    helper.assertValidationFailed(ret, ["test1 is not a type of integer", "test2 is not a type of string", "test3 is not a type of boolean"]);
  });

  it('should not validate with non-uniqueness with empty objects', function() {
    var model = {
      Test: {
        id: 'Test',
        name: 'Test',
        properties: {
          test1: {type: 'integer'},
          test2: {type: 'string'},
          test3: {type: 'boolean'}
        }
      }
    };

    var ret = validateParameter(helper.makeArrayParam(false, 'Test', null, null, true), [
      {},
      {}
    ], model, validationContext);
    helper.assertValidationFailed(ret, ["testParam is not unique. This may lead to an unintended loss of data"]);
  });

  it('should not validate with non-uniqueness with simple objects', function() {
    var model = {
      Test: {
        id: 'Test',
        name: 'Test',
        properties: {
          id: {type: 'number'}
        }
      }
    };

    var ret = validateParameter(helper.makeArrayParam(false, 'Test', null, null, true), [
      {test: 1},
      {test: 1}
    ], model, validationContext);
    helper.assertValidationFailed(ret, ["testParam is not unique. This may lead to an unintended loss of data"]);
  });

  it('should not validate with non-uniqueness with complicated objects', function() {

    var model = {
      Test: {
        id: 'Test',
        name: 'Test',
        properties: {
          test1: {type: 'integer'},
          test2: {type: 'string'},
          test3: {type: 'boolean'}
        }
      }
    };

    var ret = validateParameter(helper.makeArrayParam(false, 'Test', null, null, true), [
      {test1: 1, test2: 'string', test3: true},
      {test1: 1, test2: 'string', test3: true}
    ], model, validationContext);
    helper.assertValidationFailed(ret, ["testParam is not unique. This may lead to an unintended loss of data"]);
  });
});
