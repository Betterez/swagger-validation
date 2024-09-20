const moment = require('moment');
const helper = require('./test_helper');
const {assertValidationPassed, assertValidationFailed} = helper;
const {validateParameter} = require('../lib/validation/parameter');
const {ValidationContext} = require('../lib/validation/validationContext');
const {getValidationSettings} = require('../lib/validation/validationSettings');

describe('set', function () {
  let models;
  let validationContext;
  let validationSettings;

  beforeEach(() => {
    models = undefined;
    validationContext = new ValidationContext();
    validationSettings = getValidationSettings();
  });

  it('should validate with number with no format', function () {
    var ret = validateParameter({
      schema: helper.makeArrayParam(false, 'number', null, true),
      value: ['1', '2'],
      models,
      validationContext,
      validationSettings
    });
    assertValidationPassed(ret, [
      [1, 2]
    ]);
  });

  it('should validate with number with float format', function () {
    var ret = validateParameter({
      schema: helper.makeArrayParam(false, 'number', 'float', null, true),
      value: [1, '2.0'],
      models,
      validationContext,
      validationSettings
    });
    assertValidationPassed(ret, [
      [1, 2.0]
    ]);
  });

  it('should validate with number with double format', function () {
    var ret = validateParameter({
      schema: helper.makeArrayParam(false, 'number', 'double', null, true),
      value: [1.265, '2.2352', 2e0, 0x88],
      models,
      validationContext,
      validationSettings
    });
    assertValidationPassed(ret, [
      [1.265, 2.2352, 2e0, 0x88]
    ]);
  });

  it('should validate with integer with no format', function () {
    var ret = validateParameter({
      schema: helper.makeArrayParam(false, 'integer', null, null, true),
      value: ['1', '2'],
      models,
      validationContext,
      validationSettings
    });
    assertValidationPassed(ret, [
      [1, 2]
    ]);
  });

  it('should validate with integer with int32 format', function () {
    var ret = validateParameter({
      schema: helper.makeArrayParam(false, 'integer', 'int32', null, true),
      value: [1, '2.0'],
      models,
      validationContext,
      validationSettings
    });
    assertValidationPassed(ret, [
      [1, 2.0]
    ]);
  });

  it('should validate with integer with int64 format', function () {
    var ret = validateParameter({
      schema: helper.makeArrayParam(false, 'integer', 'int64', null, true),
      value: [123132, 2e0, 0x88],
      models,
      validationContext,
      validationSettings
    });
    assertValidationPassed(ret, [
      [123132, 2e0, 0x88]
    ]);
  });

  it('should validate with string with no format', function () {
    var ret = validateParameter({
      schema: helper.makeArrayParam(false, 'string', null, null, true),
      value: ['These', 'are', 'a', 'lot', 'of', 'strings'],
      models,
      validationContext,
      validationSettings
    });
    assertValidationPassed(ret, [
      ['These', 'are', 'a', 'lot', 'of', 'strings']
    ]);
  });

  it('should validate with string with byte format', function () {
    var ret = validateParameter({
      schema: helper.makeArrayParam(false, 'string', 'byte', null, true),
      value: [65, 35, 23],
      models,
      validationContext,
      validationSettings
    });
    assertValidationPassed(ret, [
      [65, 35, 23]
    ]);
  });

  it('should validate with string with date format', function () {
    var ret = validateParameter({
      schema: helper.makeArrayParam(false, 'string', 'date', 'M-D-YYYY', true),
      value: ['8-9-2014', '1-1-1970'],
      models,
      validationContext,
      validationSettings
    });
    assertValidationPassed(ret, [
      [moment('2014-08-09').toDate(), moment('1970-01-01').toDate()]
    ]);
  });

  it('should validate with string with date-time format', function () {
    var ret = validateParameter({
      schema: helper.makeArrayParam(false, 'string', 'date-time', 'M-D-YYYY h:mmA', true),
      value: ['8-9-2014 12:00AM', '1-1-1970 1:32PM'],
      models,
      validationContext,
      validationSettings
    });
    assertValidationPassed(ret, [
      [moment('2014-08-09T00:00:00').toDate(), moment('1970-01-01T13:32:00').toDate()]
    ]);
  });

  it('should validate with simple objects', function () {
    var models = {
      Test: {
        type: 'object',
        properties: {
          id: {type: 'number'}
        }
      }
    };

    var ret = validateParameter({
      schema: helper.makeArrayParam(false, 'Test', null, null, true),
      value: [
        {id: 1.23},
        {id: 1.24},
        {id: 1.25}
      ],
      models,
      validationContext,
      validationSettings
    });
    assertValidationPassed(ret, [
      [
        {id: 1.23},
        {id: 1.24},
        {id: 1.25}
      ]
    ]);
  });

  it('should validate with complex objects', function () {
    var models = {
      Test: {
        type: 'object',
        properties: {
          test1: {type: 'integer'},
          test2: {type: 'string'},
          test3: {type: 'boolean'}
        }
      }
    };

    var ret = validateParameter({
      schema: helper.makeArrayParam(false, 'Test', null, null, true),
      value: [
        {test1: 1, test2: 'string', test3: true},
        {test1: 1, test2: 'string', test3: false}
      ],
      models,
      validationContext,
      validationSettings
    });
    assertValidationPassed(ret, [
      [
        {test1: 1, test2: 'string', test3: true},
        {test1: 1, test2: 'string', test3: false}
      ]
    ]);
  });

  it('should not validate with empty object', function () {
    var ret = validateParameter({
      schema: helper.makeArrayParam(false, 'boolean', null, null, true),
      value: {},
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["testParam is not a type of set"]);
  });

  it('should not validate with one error with number with no format', function () {
    var ret = validateParameter({
      schema: helper.makeArrayParam(false, 'number', null, null, true),
      value: ['1', 'thisisastring'],
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["thisisastring is not a type of number"]);
  });

  it('should not validate with one error with number with float format', function () {
    var ret = validateParameter({
      schema: helper.makeArrayParam(false, 'number', 'float', null, true),
      value: [1, 'thisisastring'],
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["thisisastring is not a type of float"]);
  });

  it('should not validate with one error with number with double format', function () {
    var ret = validateParameter({
      schema: helper.makeArrayParam(false, 'number', 'double', null, true),
      value: [1.265, '2.2352', 2e0, 0x88, 'thisisastring'],
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["thisisastring is not a type of double"]);
  });

  it('should not validate with one error with integer with no format', function () {
    var ret = validateParameter({
      schema: helper.makeArrayParam(false, 'integer', null, null, true),
      value: ['1', '2', 'thisisastring'],
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["thisisastring is not a type of integer"]);
  });

  it('should not validate with one error with integer with int32 format', function () {
    var ret = validateParameter({
      schema: helper.makeArrayParam(false, 'integer', 'int32', null, true),
      value: [1, '2.0', 'thisisastring'],
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["thisisastring is not a type of int32"]);
  });

  it('should not validate with one error with integer with int64 format', function () {
    var ret = validateParameter({
      schema: helper.makeArrayParam(false, 'integer', 'int64', null, true),
      value: [2e0, 0x88, 'thisisastring'],
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["thisisastring is not a type of int64"]);
  });

  it('should not validate with one error with string with no format', function () {
    var ret = validateParameter({
      schema: helper.makeArrayParam(false, 'string', null, null, true),
      value: ['These', 'are', 'a', 'lot', 'of', 'strings', 1],
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["1 is not a type of string"]);
  });

  it('should not validate with two errors with number with no format', function () {
    var ret = validateParameter({
      schema: helper.makeArrayParam(false, 'number', null, null, true),
      value: ['1', 'thisisastring', 'thisisalsoastring'],
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["thisisastring is not a type of number", "thisisalsoastring is not a type of number"]);
  });

  it('should not validate with two errors with number with float format', function () {
    var ret = validateParameter({
      schema: helper.makeArrayParam(false, 'number', 'float', null, true),
      value: [1, 'thisisastring', 'thisisalsoastring'],
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["thisisastring is not a type of float", "thisisalsoastring is not a type of float"]);
  });

  it('should not validate with two errors with number with double format', function () {
    var ret = validateParameter({
      schema: helper.makeArrayParam(false, 'number', 'double', null, true),
      value: [1.265, '2.2352', 2e0, 0x88, 'thisisastring', 'thisisalsoastring'],
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["thisisastring is not a type of double", "thisisalsoastring is not a type of double"]);
  });

  it('should not validate with two errors with integer with no format', function () {
    var ret = validateParameter({
      schema: helper.makeArrayParam(false, 'integer', null, null, true),
      value: ['1', '2', 'thisisastring', 'thisisalsoastring'],
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["thisisastring is not a type of integer", "thisisalsoastring is not a type of integer"]);
  });

  it('should not validate with two errors with integer with int32 format', function () {
    var ret = validateParameter({
      schema: helper.makeArrayParam(false, 'integer', 'int32', null, true),
      value: [1, '2.0', 'thisisastring', 'thisisalsoastring'],
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["thisisastring is not a type of int32", "thisisalsoastring is not a type of int32"]);
  });

  it('should not validate with two errors with integer with int64 format', function () {
    var ret = validateParameter({
      schema: helper.makeArrayParam(false, 'integer', 'int64', null, true),
      value: [2e0, 0x88, 'thisisastring', 'thisisalsoastring'],
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["thisisastring is not a type of int64", "thisisalsoastring is not a type of int64"]);
  });

  it('should not validate with two errors with string with no format', function () {
    var ret = validateParameter({
      schema: helper.makeArrayParam(false, 'string', null, null, true),
      value: ['These', 'are', 'a', 'lot', 'of', 1, true, 'strings'],
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["1 is not a type of string", "true is not a type of string"]);
  });

  it('should not validate with non-uniqueness with number with no format', function () {
    var ret = validateParameter({
      schema: helper.makeArrayParam(false, 'number', null, null, true),
      value: ['1', 1],
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["testParam is not unique. This may lead to an unintended loss of data"]);
  });

  it('should not validate with non-uniqueness with number with float format', function () {
    var ret = validateParameter({
      schema: helper.makeArrayParam(false, 'number', 'float', null, true),
      value: [11.23213, '11.23213'],
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["testParam is not unique. This may lead to an unintended loss of data"]);
  });

  it('should not validate with non-uniqueness with number with double format', function () {
    var ret = validateParameter({
      schema: helper.makeArrayParam(false, 'number', 'double', null, true),
      value: [1.265, '2.2352', 2e0, 0x88, 2],
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["testParam is not unique. This may lead to an unintended loss of data"]);
  });

  it('should not validate with non-uniqueness with integer with no format', function () {
    var ret = validateParameter({
      schema: helper.makeArrayParam(false, 'integer', null, null, true),
      value: ['1', '2', 1],
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["testParam is not unique. This may lead to an unintended loss of data"]);
  });

  it('should not validate with non-uniqueness with integer with int32 format', function () {
    var ret = validateParameter({
      schema: helper.makeArrayParam(false, 'integer', 'int32', null, true),
      value: [1, '2.0', 2e0],
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["testParam is not unique. This may lead to an unintended loss of data"]);
  });

  it('should not validate with non-uniqueness with integer with int64 format', function () {
    var ret = validateParameter({
      schema: helper.makeArrayParam(false, 'integer', 'int64', null, true),
      value: [Number.MAX_VALUE, 2e0, 0x88, Number.MAX_VALUE],
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["testParam is not unique. This may lead to an unintended loss of data"]);
  });

  it('should not validate with non-uniqueness with string with no format', function () {
    var ret = validateParameter({
      schema: helper.makeArrayParam(false, 'string', null, null, true),
      value: ['These', 'are', 'a', 'lot', 'of', 'strings', 'strings'],
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["testParam is not unique. This may lead to an unintended loss of data"]);
  });

  it('should not validate with simple objects', function () {
    var models = {
      Test: {
        type: 'object',
        properties: {
          id: {type: 'number'}
        }
      }
    };

    var ret = validateParameter({
      schema: helper.makeArrayParam(false, 'Test', null, null, true),
      value: [
        {id: 1},
        {id: 'Yo'}
      ],
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["id is not a type of number"]);
  });

  it('should not validate with complex objects', function () {

    var models = {
      Test: {
        type: 'object',
        properties: {
          test1: {type: 'integer'},
          test2: {type: 'string'},
          test3: {type: 'boolean'}
        }
      }
    };

    var ret = validateParameter({
      schema: helper.makeArrayParam(false, 'Test', null, null, true),
      value: [
        {test1: 'No', test2: true, test3: 1}
      ],
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["test1 is not a type of integer", "test2 is not a type of string", "test3 is not a type of boolean"]);
  });

  it('should not validate with non-uniqueness with empty objects', function () {
    var models = {
      Test: {
        type: 'object',
        properties: {
          test1: {type: 'integer'},
          test2: {type: 'string'},
          test3: {type: 'boolean'}
        }
      }
    };

    var ret = validateParameter({
      schema: helper.makeArrayParam(false, 'Test', null, null, true),
      value: [
        {},
        {}
      ],
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["testParam is not unique. This may lead to an unintended loss of data"]);
  });

  it('should not validate with non-uniqueness with simple objects', function () {
    var models = {
      Test: {
        type: 'object',
        properties: {
          id: {type: 'number'}
        }
      }
    };

    var ret = validateParameter({
      schema: helper.makeArrayParam(false, 'Test', null, null, true),
      value: [
        {test: 1},
        {test: 1}
      ],
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["testParam is not unique. This may lead to an unintended loss of data"]);
  });

  it('should not validate with non-uniqueness with complicated objects', function () {
    var models = {
      Test: {
        type: 'object',
        properties: {
          test1: {type: 'integer'},
          test2: {type: 'string'},
          test3: {type: 'boolean'}
        }
      }
    };

    var ret = validateParameter({
      schema: helper.makeArrayParam(false, 'Test', null, null, true),
      value: [
        {test1: 1, test2: 'string', test3: true},
        {test1: 1, test2: 'string', test3: true}
      ],
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["testParam is not unique. This may lead to an unintended loss of data"]);
  });
});
