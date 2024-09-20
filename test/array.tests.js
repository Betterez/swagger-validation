const {expect} = require('chai');
const moment = require('moment');
const helper = require('./test_helper');
const {assertValidationPassed, assertValidationFailed} = helper;
const {validateParameter} = require('../lib/validation/parameter');
const {ValidationContext} = require('../lib/validation/validationContext');
const {getValidationSettings} = require('../lib/validation/validationSettings');

describe('array', function () {
  let models;
  let validationContext;
  let validationSettings;

  beforeEach(() => {
    models = undefined;
    validationContext = new ValidationContext();
    validationSettings = getValidationSettings();
  });

  it('should validate with number with no format', function () {
    var value = ['1', '2'];
    var transformedValue = [1, 2];
    var ret = validateParameter({
      schema: helper.makeArrayParam(false, 'number'),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationPassed(ret, [transformedValue]);
  });

  it('should validate with number with float format', function () {
    var value = [1, '2.0'];
    var transformedValue = [1, 2.0];
    var ret = validateParameter({
      schema: helper.makeArrayParam(false, 'number', 'float'),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationPassed(ret, [transformedValue]);
  });

  it('should validate with number with double format', function () {
    var value = [1.265, '2.2352', 2e0, 0x88];
    var transformedValue = [1.265, 2.2352, 2.0, 0x88];
    var ret = validateParameter({
      schema: helper.makeArrayParam(false, 'number', 'double'),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationPassed(ret, [transformedValue]);
  });

  it('should validate with integer with no format', function () {
    var value = ['1', '2'];
    var transformedValue = [1, 2];
    var ret = validateParameter({
      schema: helper.makeArrayParam(false, 'integer'),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationPassed(ret, [transformedValue]);
  });

  it('should validate with integer with int32 format', function () {
    var value = [1, '2.0'];
    var transformedValue = [1, 2.0];
    var ret = validateParameter({
      schema: helper.makeArrayParam(false, 'integer', 'int32'),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationPassed(ret, [transformedValue]);
  });

  it('should validate with integer with int64 format', function () {
    var value = [Number.MAX_VALUE, Number.MIN_VALUE + 1, 2.0, 2e0, 0x88];
    var transformedValue = [Number.MAX_VALUE, Number.MIN_VALUE + 1, 2.0, 2, 136];
    var ret = validateParameter({
      schema: helper.makeArrayParam(false, 'integer', 'int64'),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationPassed(ret, [transformedValue]);
  });

  it('should validate with string with no format', function () {
    var value = ['These', 'are', 'a', 'lot', 'of', 'strings'];
    var ret = validateParameter({
      schema: helper.makeArrayParam(false, 'string'),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationPassed(ret, [value]);
  });

  it('should validate with string with byte format', function () {
    var value = [65, 35, 23];
    var ret = validateParameter({
      schema: helper.makeArrayParam(false, 'string', 'byte'),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationPassed(ret, [value]);
  });

  it('should validate with string with date format', function () {
    var value = ['8-9-2014', '1-1-1970'];
    var transformedValue = [moment('2014-08-09').toDate(), moment('1970-01-01').toDate()];
    var ret = validateParameter({
      schema: helper.makeArrayParam(false, 'string', 'date', 'M-D-YYYY'),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationPassed(ret, [transformedValue]);
  });

  it('should validate with string with date-time format', function () {
    var value = ['8-9-2014 12:00AM', '1-1-1970 1:32PM'];
    var transformedValue = [moment('2014-08-09T00:00:00').toDate(), moment('1970-01-01T13:32:00').toDate()];
    var ret = validateParameter({
      schema: helper.makeArrayParam(false, 'string', 'date-time', 'M-D-YYYY h:mmA'),
      value,
      models,
      validationContext,
      validationSettings
    });
    assertValidationPassed(ret, [transformedValue]);
  });

  it('should validate a string if it belongs to a given enum', function () {
    const value = ['allowed', 'strings'];
    const schema = helper.makeArrayParam(false, 'string');
    schema.items.enum = ['These', 'are', 'allowed', 'strings'];
    const result = validateParameter({schema, value, models, validationContext, validationSettings});
    assertValidationPassed(result);
  });

  it('should validate a string if it matches a pattern', function () {
    const value = ['allowed', 'string'];
    const schema = helper.makeArrayParam(false, 'string');
    schema.items.pattern = '.*';
    const result = validateParameter({schema, value, models, validationContext, validationSettings});
    assertValidationPassed(result);
  });

  it('should validate a string if its length is not greater than maxLength', function () {
    const value = ['allowed', 'string'];
    const schema = helper.makeArrayParam(false, 'string');
    schema.items.maxLength = 20;
    const result = validateParameter({schema, value, models, validationContext, validationSettings});
    assertValidationPassed(result);
  });

  it('should validate a string if its length is not less than minLength', function () {
    const value = ['allowed', 'string'];
    const schema = helper.makeArrayParam(false, 'string');
    schema.items.minLength = 5;
    const result = validateParameter({schema, value, models, validationContext, validationSettings});
    assertValidationPassed(result);
  });

  it('should validate a number if it greater than minimum', function () {
    const value = [6, 10];
    const schema = helper.makeArrayParam(false, 'number');
    schema.items.minimum = 5;
    const result = validateParameter({schema, value, models, validationContext, validationSettings});
    assertValidationPassed(result);
  });

  it('should validate a number if its less than maximum', function () {
    const value = [6, 10];
    const schema = helper.makeArrayParam(false, 'number');
    schema.items.maximum = 15;
    const result = validateParameter({schema, value, models, validationContext, validationSettings});
    assertValidationPassed(result);
  });

  it('should validate with simple objects', function () {
    var value = [
      {id: 1.23},
      {id: 1.23},
      {id: 1.23}
    ];
    var model = {
      Test: {
        type: 'object',
        properties: {
          id: {type: 'number'}
        }
      }
    };
    var ret = validateParameter({
      schema: helper.makeArrayParam(false, 'Test'),
      value,
      models: model,
      validationContext,
      validationSettings
    });
    assertValidationPassed(ret, [value]);
  });

  it('should validate with complex objects', function () {
    var value = [
      {test1: 1, test2: 'string', test3: true},
      {test1: 1, test2: 'string', test3: false}
    ];
    var model = {
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
      schema: helper.makeArrayParam(false, 'Test'),
      value,
      models: model,
      validationContext,
      validationSettings
    });
    assertValidationPassed(ret, [value]);
  });

  it('should not allow the array itself to be null when it is a required property of an object', function () {
    const ret = validateParameter({
      schema: {
        type: 'object',
        required: ['someArray'],
        properties: {
          someArray: {
            type: 'array',
            items: {
              type: 'string',
            }
          }
        }
      },
      value: {someArray: null},
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["someArray is required"]);
  });

  it('should not allow the array itself to be undefined when it is a required property of an object', function () {
    const ret = validateParameter({
      schema: {
        type: 'object',
        required: ['someArray'],
        properties: {
          someArray: {
            type: 'array',
            items: {
              type: 'string',
            }
          }
        }
      },
      value: {someArray: undefined},
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["someArray is required"]);
  });

  it('should not allow the array itself to be an empty string when it is a required property of an object', function () {
    const ret = validateParameter({
      schema: {
        type: 'object',
        required: ['someArray'],
        properties: {
          someArray: {
            type: 'array',
            items: {
              type: 'string',
            }
          }
        }
      },
      value: {someArray: ''},
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["someArray is required"]);
  });

  it('should not validate with empty object', function () {
    var ret = validateParameter({
      schema: helper.makeArrayParam(false, 'boolean'),
      value: {},
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["testParam is not a type of array"]);
  });

  it('should not validate with one error with number with no format', function () {
    var ret = validateParameter({
      schema: helper.makeArrayParam(false, 'number'),
      value: ['1', 'this is a string'],
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["this is a string is not a type of number"]);
  });

  it('should not validate with one error with number with float format', function () {
    var ret = validateParameter({
      schema: helper.makeArrayParam(false, 'number', 'float'),
      value: [1, 'this is a string'],
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["this is a string is not a type of float"]);
  });

  it('should not validate with one error with number with double format', function () {
    var ret = validateParameter({
      schema: helper.makeArrayParam(false, 'number', 'double'),
      value: [1.265, '2.2352', 2e0, 0x88, 'this is a string'],
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["this is a string is not a type of double"]);
  });

  it('should not validate with one error with integer with no format', function () {
    var ret = validateParameter({
      schema: helper.makeArrayParam(false, 'integer'),
      value: ['1', '2', 'this is a string'],
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["this is a string is not a type of integer"]);
  });

  it('should not validate with one error with integer with int32 format', function () {
    var ret = validateParameter({
      schema: helper.makeArrayParam(false, 'integer', 'int32'),
      value: [1, '2.0', 'this is a string'],
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["this is a string is not a type of int32"]);
  });

  it('should not validate with one error with integer with int64 format', function () {
    var ret = validateParameter({
      schema: helper.makeArrayParam(false, 'integer', 'int64'),
      value: [1234, 2e0, 0x88, 'this is a string'],
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["this is a string is not a type of int64"]);
  });

  it('should not validate with one error with string with no format', function () {
    var ret = validateParameter({
      schema: helper.makeArrayParam(false, 'string'),
      value: ['These', 'are', 'a', 'lot', 'of', 'strings', 1],
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["1 is not a type of string"]);
  });

  it('should not validate with two errors with number with no format', function () {
    var ret = validateParameter({
      schema: helper.makeArrayParam(false, 'number'),
      value: ['1', 'this is a string', 'this is also a string'],
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["this is a string is not a type of number", "this is also a string is not a type of number"]);
  });

  it('should not validate with two errors with number with float format', function () {
    var ret = validateParameter({
      schema: helper.makeArrayParam(false, 'number', 'float'),
      value: [1, 'this is a string', 'this is also a string'],
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["this is a string is not a type of float", "this is also a string is not a type of float"]);
  });

  it('should not validate with two errors with number with double format', function () {
    var ret = validateParameter({
      schema: helper.makeArrayParam(false, 'number', 'double'),
      value: [1.265, '2.2352', 2e0, 0x88, 'this is a string', 'this is also a string'],
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["this is a string is not a type of double", "this is also a string is not a type of double"]);
  });

  it('should not validate with two errors with integer with no format', function () {
    var ret = validateParameter({
      schema: helper.makeArrayParam(false, 'integer'),
      value: ['1', '2', 'this is a string', 'this is also a string'],
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["this is a string is not a type of integer", "this is also a string is not a type of integer"]);
  });

  it('should not validate with two errors with integer with int32 format', function () {
    var ret = validateParameter({
      schema: helper.makeArrayParam(false, 'integer', 'int32'),
      value: [1, '2.0', 'this is a string', 'this is also a string'],
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["this is a string is not a type of int32", "this is also a string is not a type of int32"]);
  });

  it('should not validate with two errors with integer with int64 format', function () {
    var ret = validateParameter({
      schema: helper.makeArrayParam(false, 'integer', 'int64'),
      value: [Number.MAX_VALUE - 123123123123, 2e0, 0x88, 'this is a string', 'this is also a string'],
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["this is a string is not a type of int64", "this is also a string is not a type of int64"]);
  });

  it('should not validate with two errors with string with no format', function () {
    var ret = validateParameter({
      schema: helper.makeArrayParam(false, 'string'),
      value: ['These', 'are', 'a', 'lot', 'of', 1, true, 'strings'],
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["1 is not a type of string", "true is not a type of string"]);
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
      schema: helper.makeArrayParam(false, 'Test'),
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
      schema: helper.makeArrayParam(false, 'Test'),
      value: [
        {test1: 'No', test2: true, test3: 1}
      ],
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["test1 is not a type of integer", "test2 is not a type of string", "test3 is not a type of boolean"]);
  });

  it('should validate minItems', function () {

    var model = {
      Test: {
        name: 'Test',
        properties: {
          test1: {type: 'integer'},
          test2: {type: 'string'},
          test3: {type: 'boolean'}
        }
      }
    };

    var ret = validateParameter({
      schema: helper.makeArrayParam(false, 'Test', undefined, undefined, undefined, "Legs", 1, 1),
      value: [],
      models: model,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["Legs should have at least 1 item(s)"]);
  });

  it('should validate maxItems', function () {
    var models = {
      Test: {
        name: 'Test',
        properties: {
          test2: {type: 'string'},
        }
      }
    };

    var ret = validateParameter({
      schema: helper.makeArrayParam(false, 'Test', undefined, undefined, undefined, "Legs", 1, 2),
      value: [
        {test2: "hello"}, {test2: "world"}, {test2: "today"}
      ],
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(ret, ["Legs should have at most 2 item(s)"]);
  });

  describe('null value handling', () => {
    it('should allow items to be null by default (legacy behaviour)', () => {
      const models = {
        TestArray: {
          type: 'array',
          items: {
            $ref: 'TestArrayItem',
          }
        },
        TestArrayItem: {
          type: 'object',
          properties: {
            someString: {type: 'string'},
          }
        }
      };

      const result = validateParameter({
        schema: models.TestArray,
        value: [{someString: 'A'}, null],
        models,
        validationContext,
        validationSettings
      });
      assertValidationPassed(result);
    });

    it('should allow the array itself to be null when it is an optional property of an object (legacy behaviour)', () => {
      const models = {
        SomeObject: {
          type: 'object',
          properties: {
            someArray: {
              $ref: 'TestArray',
            }
          }
        },
        TestArray: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              someString: {type: 'string'},
            }
          }
        }
      };

      const result = validateParameter({
        schema: models.SomeObject,
        value: {someArray: null},
        models,
        validationContext,
        validationSettings
      });
      assertValidationPassed(result);
    });

    it('should not allow items to be null when "nullable" is false', () => {
      const models = {
        TestArray: {
          type: 'array',
          items: {
            $ref: 'TestArrayItem',
          }
        },
        TestArrayItem: {
          type: 'object',
          properties: {
            someString: {type: 'string'},
          },
          nullable: false
        }
      };

      const result = validateParameter({
        schema: models.TestArray,
        value: [{someString: 'A'}, null],
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(result, ["TestArrayItem cannot be null"]);
    });

    it('should not allow the array itself to be null when "nullable" is false', () => {
      const models = {
        TestArray: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              someString: {type: 'string'},
            }
          },
          nullable: false
        }
      };

      const result = validateParameter({
        schema: models.TestArray,
        value: null,
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(result, ["undefined cannot be null"]);
    });

    describe('when the validation settings specify that properties are not nullable by default', () => {
      let models;

      beforeEach(() => {
        validationSettings.allPropertiesAreNullableByDefault = false;

        models = {
          TestArray: {
            type: 'array',
            items: {
              $ref: 'TestArrayItem',
            }
          },
          TestArrayItem: {
            type: 'object',
            properties: {
              someString: {type: 'string'},
            }
          }
        };
      });

      it('should not allow null items by default', () => {
        const result = validateParameter({
          schema: models.TestArray,
          value: [{someString: 'A'}, null],
          models,
          validationContext,
          validationSettings
        });
        assertValidationFailed(result, ["TestArrayItem cannot be null"]);
      });

      it('should not allow the array itself to be null by default', () => {
        const result = validateParameter({
          schema: models.TestArray,
          value: null,
          models,
          validationContext,
          validationSettings
        });
        assertValidationFailed(result, ["undefined cannot be null"]);
      });

      it('should allow null items when the schema specifies that items are nullable', () => {
        models.TestArrayItem.nullable = true;

        const result = validateParameter({
          schema: models.TestArray,
          value: [{someString: 'A'}, null],
          models,
          validationContext,
          validationSettings
        });
        assertValidationPassed(result);
      });

      it('should allow the array itself to be null when the schema specifies that the array is nullable', () => {
        models.TestArray.nullable = true;

        const result = validateParameter({
          schema: models.TestArray,
          value: null,
          models,
          validationContext,
          validationSettings
        });
        assertValidationPassed(result);
      });
    });
  });

  describe('empty string handling', () => {
    beforeEach(() => {
      models = {
        TestArray: {
          type: 'array',
          items: {
            type: 'number',
          }
        }
      }
    });

    it('should allow empty strings to exist in an array which does not contain strings (legacy behaviour - this is a bug which is intentionally left in the code to avoid changing existing behaviour)', () => {
      const result = validateParameter({
        schema: models.TestArray,
        value: [1, 2, ''],
        models,
        validationContext,
        validationSettings
      });
      assertValidationPassed(result);
    });

    describe('when the validation settings specify that empty strings are not treated the same as undefined values', () => {
      beforeEach(() => {
        validationSettings.treatEmptyStringsLikeUndefinedValues = false;
      });

      it('should not allow empty strings to exist in an array which does not contain strings', function () {
        const result = validateParameter({
          schema: models.TestArray,
          value: [1, 2, ''],
          models,
          validationContext,
          validationSettings
        });
        assertValidationFailed(result, [' is not a type of number']);
      });
    });
  });

  it('should not validate a string if it does not belong to a given enum', function () {
    const value = ['allowed', 'not_allowed'];
    const schema = helper.makeArrayParam(false, 'string');
    schema.items.enum = ['These', 'are', 'allowed', 'strings'];
    const result = validateParameter({schema, value, models, validationContext, validationSettings});
    assertValidationFailed(result, ['not_allowed is not a valid entry']);
  });

  it('should not validate a string if its length is greater than maxLength', function () {
    const value = ['allowed', 'not_allowed'];
    const schema = helper.makeArrayParam(false, 'string');
    schema.items.maxLength = 9;
    const result = validateParameter({schema, value, models, validationContext, validationSettings});
    assertValidationFailed(result, ['not_allowed requires a max length of 9']);
  });

  it('should not validate a string if its length is less than minLength', function () {
    const value = ['allowed', 'n-a'];
    const schema = helper.makeArrayParam(false, 'string');
    schema.items.minLength = 5;
    const result = validateParameter({schema, value, models, validationContext, validationSettings});
    assertValidationFailed(result, ['n-a requires a min length of 5']);
  });

  it('should not validate a number if it is less than minimum', function () {
    const value = [6, 10];
    const schema = helper.makeArrayParam(false, 'number');
    schema.items.minimum = 9;
    const result = validateParameter({schema, value, models, validationContext, validationSettings});
    assertValidationFailed(result, ['6 is below the minimum value']);
  });

  it('should not validate a number if its greater than maximum', function () {
    const value = [6, 10];
    const schema = helper.makeArrayParam(false, 'number');
    schema.items.maximum = 8;
    const result = validateParameter({schema, value, models, validationContext, validationSettings});
    assertValidationFailed(result, ['10 is above the maximum value']);
  });

  it('should include the path of the data which failed validation in the result', () => {
    let models = {
      ArrayContainingObjects: {
        type: 'array',
        items: {
          $ref: 'TestArrayItem',
          nullable: false
        }
      },
      TestArrayItem: {
        type: 'object',
        properties: {
          someString: {type: 'string'},
        }
      }
    };

    let result = validateParameter({
      schema: models.ArrayContainingObjects,
      value: [{someString: 'A'}, {someString: 2}],
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(result, ['someString is not a type of string']);
    expect(result[0].context.toLiteral()).to.have.property('dataPath');
    expect(result[0].context.toLiteral().dataPath).to.eql([1, 'someString']);
    expect(result[0].context.formatDataPath()).to.eql("[1].someString");

    models = {
      ArrayContainingStrings: {
        type: 'array',
        items: {
          type: 'string'
        }
      }
    };

    result = validateParameter({
      schema: models.ArrayContainingStrings,
      value: ['A', 2],
      models,
      validationContext,
      validationSettings
    });
    assertValidationFailed(result, ['2 is not a type of string']);
    expect(result[0].context.toLiteral()).to.have.property('dataPath');
    expect(result[0].context.toLiteral().dataPath).to.eql([1]);
    expect(result[0].context.formatDataPath()).to.eql("[1]");
  });
});
