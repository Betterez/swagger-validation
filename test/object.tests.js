const moment = require('moment');
const helper = require('./test_helper');
const {assertValidationPassed, assertValidationFailed} = helper;
const {validateParameter} = require('../lib/validation/parameter');
const {ValidationContext} = require('../lib/validation/validationContext');
const {getValidationSettings} = require('../lib/validation/validationSettings');
const {expect} = require('chai');

describe('object', function () {
  let validationContext;
  let validationSettings;

  beforeEach(() => {
    validationContext = new ValidationContext();
    validationSettings = getValidationSettings();
  });

  describe('basic tests', function () {
    let models;

    beforeEach(() => {
      models = {
        SomeObject: {
          type: 'object',
          properties: {
            id: {type: 'number'}
          }
        }
      };
    });

    it('should validate when the model has type: "object"', () => {
      const models = {
        BasicObject: {
          type: 'object',
          properties: {
            id: {type: 'number'}
          }
        }
      };

      const result = validateParameter({
        schema: models.BasicObject,
        value: {id: 1},
        models,
        validationContext,
        validationSettings
      });
      assertValidationPassed(result, [{id: 1}]);
    });

    it('should allow an optional property to be null (legacy behaviour)', () => {
      const result = validateParameter({
        schema: models.SomeObject,
        value: {id: null},
        models,
        validationContext,
        validationSettings
      });
      assertValidationPassed(result);
    });

    it('should not allow an optional property to be null when "nullable" is false', () => {
      models.SomeObject.properties.id.nullable = false;

      const result = validateParameter({
        schema: models.SomeObject,
        value: {id: null},
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(result, ["id cannot be null"]);
    });

    it('should not allow a required parameter to be null', function () {
      models.SomeObject.required = ['id'];

      const result = validateParameter({
        schema: models.SomeObject,
        value: {id: null},
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(result, ["id is required"]);
    });

    describe('when the validation settings specify that properties are not nullable by default', () => {
      beforeEach(() => {
        validationSettings.allPropertiesAreNullableByDefault = false;
      });

      it('should not allow a property to be null by default', () => {
        const result = validateParameter({
          schema: models.SomeObject,
          value: {id: null},
          models,
          validationContext,
          validationSettings
        });
        assertValidationFailed(result, ["id cannot be null"]);
      });

      it('should allow a property to be null when the schema specifies that the property is nullable', () => {
        models.SomeObject.properties.id.nullable = true;

        const result = validateParameter({
          schema: models.SomeObject,
          value: {id: null},
          models,
          validationContext,
          validationSettings
        });
        assertValidationPassed(result);
      });
    });

    it('should validate with parameter undefined', function () {
      var value = void (0);
      var ret = validateParameter({
        schema: helper.makeParam('SomeObject', false),
        value,
        models: models,
        validationContext,
        validationSettings
      });
      assertValidationPassed(ret, [value]);
    });

    it('should validate with parameter empty', function () {
      var value = {};
      var ret = validateParameter({
        schema: helper.makeParam('SomeObject', false),
        value,
        models: models,
        validationContext,
        validationSettings
      });
      assertValidationPassed(ret, [value]);
    });

    it('should not validate with required parameter undefined', function () {
      var ret = validateParameter({
        schema: helper.makeParam('SomeObject', true),
        value: undefined,
        models: models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(ret, ["testParam is required"]);
    });

    it('should not validate with array', function () {
      var ret = validateParameter({
        schema: helper.makeParam('SomeObject', true),
        value: [],
        models: models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(ret, ["testParam is not a type of object"]);
    });

    it('should not validate with Number', function () {
      var ret = validateParameter({
        schema: helper.makeParam('SomeObject', true),
        value: 12,
        models: models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(ret, ["testParam is not a type of object"]);
    });

    it('should not validate with string', function () {
      var ret = validateParameter({
        schema: helper.makeParam('SomeObject', true),
        value: 'thisisastring',
        models: models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(ret, ["testParam is not a type of object"]);
    });
  });

  describe('one number no format not required', function () {
    // each section defines it's own validation parameters
    var model = {
      SomeObject: {
        properties: {
          id: {type: 'number'}
        }
      }
    };

    it('should validate', function () {
      var value = {id: 1};
      var ret = validateParameter({
        schema: helper.makeParam('SomeObject', false),
        value,
        models: model,
        validationContext,
        validationSettings
      });
      assertValidationPassed(ret, [value]);
    });

    it('should not validate', function () {
      var ret = validateParameter({
        schema: helper.makeParam('SomeObject', false),
        value: {id: 'thisisastring'},
        models: model,
        validationContext,
        validationSettings
      });
      assertValidationFailed(ret, ["id is not a type of number"]);
    });
  });

  describe('one number float format not required', function () {
    // each section defines it's own validation parameters
    var model = {
      SomeObject: {
        properties: {
          id: {type: 'number', format: 'float'}
        }
      }
    };

    it('should validate', function () {
      var value = {id: 1.233242};
      var ret = validateParameter({
        schema: helper.makeParam('SomeObject', false),
        value,
        models: model,
        validationContext,
        validationSettings
      });
      assertValidationPassed(ret, [value]);
    });

    it('should not validate', function () {
      var ret = validateParameter({
        schema: helper.makeParam('SomeObject', false),
        value: {id: 'thisisastring'},
        models: model,
        validationContext,
        validationSettings
      });
      assertValidationFailed(ret, ["id is not a type of float"]);
    });
  });

  describe('one number double format not required', function () {
    // each section defines it's own validation parameters
    var model = {
      SomeObject: {
        properties: {
          id: {type: 'number', format: 'double'}
        }
      }
    };

    it('should validate', function () {
      var value = {id: 1.233242};
      var ret = validateParameter({
        schema: helper.makeParam('SomeObject', false),
        value,
        models: model,
        validationContext,
        validationSettings
      });
      assertValidationPassed(ret, [value]);
    });

    it('should not validate', function () {
      var ret = validateParameter({
        schema: helper.makeParam('SomeObject', false),
        value: {id: 'thisisastring'},
        models: model,
        validationContext,
        validationSettings
      });
      assertValidationFailed(ret, ["id is not a type of double"]);
    });
  });

  describe('one integer no format not required', function () {
    // each section defines it's own validation parameters
    var model = {
      SomeObject: {
        properties: {
          id: {type: 'integer'}
        }
      }
    };

    it('should validate', function () {
      var value = {id: 1};
      var ret = validateParameter({
        schema: helper.makeParam('SomeObject', false),
        value,
        models: model,
        validationContext,
        validationSettings
      });
      assertValidationPassed(ret, [value]);
    });

    it('should not validate', function () {
      var ret = validateParameter({
        schema: helper.makeParam('SomeObject', false),
        value: {id: 'thisisastring'},
        models: model,
        validationContext,
        validationSettings
      });
      assertValidationFailed(ret, ["id is not a type of integer"]);
    });
  });

  describe('one integer int32 format not required', function () {
    // each section defines it's own validation parameters
    var model = {
      SomeObject: {
        properties: {
          id: {type: 'integer', format: 'int32'}
        }
      }
    };

    it('should validate', function () {
      var value = {id: 1};
      var ret = validateParameter({
        schema: helper.makeParam('SomeObject', false),
        value,
        models: model,
        validationContext,
        validationSettings
      });
      assertValidationPassed(ret, [value]);
    });

    it('should not validate', function () {
      var ret = validateParameter({
        schema: helper.makeParam('SomeObject', false),
        value: {id: 'thisisastring'},
        models: model,
        validationContext,
        validationSettings
      });
      assertValidationFailed(ret, ["id is not a type of int32"]);
    });
  });

  describe('one integer int64 format not required', function () {
    // each section defines it's own validation parameters
    var model = {
      SomeObject: {
        properties: {
          id: {type: 'integer', format: 'int64'}
        }
      }
    };

    it('should validate', function () {
      var value = {id: 1};
      var ret = validateParameter({
        schema: helper.makeParam('SomeObject', false),
        value,
        models: model,
        validationContext,
        validationSettings
      });
      assertValidationPassed(ret, [value]);
    });

    it('should not validate', function () {
      var ret = validateParameter({
        schema: helper.makeParam('SomeObject', true),
        value: {id: '  '},
        models: model,
        validationContext,
        validationSettings
      });
      assertValidationFailed(ret, ["id is not a type of int64"]);
    });
  });

  describe('one string no format not required', function () {
    // each section defines it's own validation parameters
    var model = {
      SomeObject: {
        properties: {
          id: {type: 'string'}
        }
      }
    };

    it('should validate', function () {
      var value = {id: 'this is a string'};
      var ret = validateParameter({
        schema: helper.makeParam('SomeObject', false),
        value,
        models: model,
        validationContext,
        validationSettings
      });
      assertValidationPassed(ret, [value]);
    });

    it('should not validate', function () {
      var ret = validateParameter({
        schema: helper.makeParam('SomeObject', false),
        value: {id: {}},
        models: model,
        validationContext,
        validationSettings
      });
      assertValidationFailed(ret, ["id is not a type of string"]);
    });
  });

  describe('one string byte format not required', function () {
    // each section defines it's own validation parameters
    var model = {
      SomeObject: {
        properties: {
          id: {type: 'string', format: 'byte'}
        }
      }
    };

    it('should validate', function () {
      var value = {id: [65, 43]};
      var ret = validateParameter({
        schema: helper.makeParam('SomeObject', false),
        value,
        models: model,
        validationContext,
        validationSettings
      });
      assertValidationPassed(ret, [value]);
    });
  });

  describe('one string date format not required', function () {
    // each section defines it's own validation parameters
    var model = {
      SomeObject: {
        properties: {
          id: {
            type: 'string',
            format: 'date'
          }
        }
      }
    };

    it('should validate', function () {
      var value = {id: '2014-08-08'};
      var transformedValue = {id: moment('2014-08-08').toDate()};
      var ret = validateParameter({
        schema: helper.makeParam('SomeObject', false),
        value,
        models: model,
        validationContext,
        validationSettings
      });
      assertValidationPassed(ret, [transformedValue]);
    });
  });

  describe('one string date-time format not required', function () {
    // each section defines it's own validation parameters
    var model = {
      SomeObject: {
        properties: {
          id: {type: 'string', format: 'date-time'}
        }
      }
    };

    it('should validate', function () {
      var value = {id: '2014-08-09T12:43:00'};
      var transformedValue = {id: moment('2014-08-09T12:43:00').toDate()};
      var ret = validateParameter({
        schema: helper.makeParam('SomeObject', false),
        value,
        models: model,
        validationContext,
        validationSettings
      });
      assertValidationPassed(ret, [transformedValue]);
    });
  });

  describe('one boolean no format not required', function () {
    // each section defines it's own validation parameters
    var model = {
      SomeObject: {
        properties: {
          id: {type: 'boolean'}
        }
      }
    };

    it('should validate', function () {
      var value = {id: 'true'};
      var transformedValue = {id: true};
      var ret = validateParameter({
        schema: helper.makeParam('SomeObject', false),
        value,
        models: model,
        validationContext,
        validationSettings
      });
      assertValidationPassed(ret, [transformedValue]);
    });

    it('should not validate', function () {
      var ret = validateParameter({
        schema: helper.makeParam('SomeObject', false),
        value: {id: 'thisisastring'},
        models: model,
        validationContext,
        validationSettings
      });
      assertValidationFailed(ret, ["id is not a type of boolean"]);
    });
  });

  describe('one number no format required', function () {
    // each section defines it's own validation parameters
    var model = {
      SomeObject: {
        required: ['id'],
        properties: {
          id: {type: 'number'}
        }
      }
    };

    it('should validate', function () {
      var value = {id: 1};
      var ret = validateParameter({
        schema: helper.makeParam('SomeObject', false),
        value,
        models: model,
        validationContext,
        validationSettings
      });
      assertValidationPassed(ret, [value]);
    });

    it('should not validate with missing parameter', function () {
      var ret = validateParameter({
        schema: helper.makeParam('SomeObject', true),
        value: {},
        models: model,
        validationContext,
        validationSettings
      });
      assertValidationFailed(ret, ["id is required"]);
    });

    it('should not validate', function () {
      var ret = validateParameter({
        schema: helper.makeParam('SomeObject', true),
        value: {id: 'thisisastring'},
        models: model,
        validationContext,
        validationSettings
      });
      assertValidationFailed(ret, ["id is not a type of number"]);
    });
  });

  describe('one number float format required', function () {
    // each section defines it's own validation parameters
    var model = {
      SomeObject: {
        required: ['id'],
        properties: {
          id: {type: 'number', format: 'float'}
        }
      }
    };

    it('should validate', function () {
      var value = {id: 1.233242};
      var ret = validateParameter({
        schema: helper.makeParam('SomeObject', false),
        value,
        models: model,
        validationContext,
        validationSettings
      });
      assertValidationPassed(ret, [value]);
    });

    it('should not validate with missing parameter', function () {
      var ret = validateParameter({
        schema: helper.makeParam('SomeObject', true),
        value: {},
        models: model,
        validationContext,
        validationSettings
      });
      assertValidationFailed(ret, ["id is required"]);
    });

    it('should not validate', function () {
      var ret = validateParameter({
        schema: helper.makeParam('SomeObject', true),
        value: {id: 'thisisastring'},
        models: model,
        validationContext,
        validationSettings
      });
      assertValidationFailed(ret, ["id is not a type of float"]);
    });
  });

  describe('one number double format required', function () {
    // each section defines it's own validation parameters
    var model = {
      SomeObject: {
        required: ['id'],
        properties: {
          id: {type: 'number', format: 'double'}
        }
      }
    };

    it('should validate', function () {
      var value = {id: 1.233242};
      var ret = validateParameter({
        schema: helper.makeParam('SomeObject', false),
        value,
        models: model,
        validationContext,
        validationSettings
      });
      assertValidationPassed(ret, [value]);
    });

    it('should not validate with missing parameter', function () {
      var ret = validateParameter({
        schema: helper.makeParam('SomeObject', true),
        value: {},
        models: model,
        validationContext,
        validationSettings
      });
      assertValidationFailed(ret, ["id is required"]);
    });

    it('should not validate', function () {
      var ret = validateParameter({
        schema: helper.makeParam('SomeObject', true),
        value: {id: 'thisisastring'},
        models: model,
        validationContext,
        validationSettings
      });
      assertValidationFailed(ret, ["id is not a type of double"]);
    });
  });

  describe('one integer no format required', function () {
    // each section defines it's own validation parameters
    var model = {
      SomeObject: {
        required: ['id'],
        properties: {
          id: {type: 'integer'}
        }
      }
    };

    it('should validate', function () {
      var value = {id: 1};
      var ret = validateParameter({
        schema: helper.makeParam('SomeObject', false),
        value,
        models: model,
        validationContext,
        validationSettings
      });
      assertValidationPassed(ret, [value]);
    });

    it('should not validate with missing parameter', function () {
      var ret = validateParameter({
        schema: helper.makeParam('SomeObject', true),
        value: {},
        models: model,
        validationContext,
        validationSettings
      });
      assertValidationFailed(ret, ["id is required"]);
    });

    it('should not validate', function () {
      var ret = validateParameter({
        schema: helper.makeParam('SomeObject', true),
        value: {id: 'thisisastring'},
        models: model,
        validationContext,
        validationSettings
      });
      assertValidationFailed(ret, ["id is not a type of integer"]);
    });
  });

  describe('one integer int32 format required', function () {
    // each section defines it's own validation parameters
    var model = {
      SomeObject: {
        required: ['id'],
        properties: {
          id: {type: 'integer', format: 'int32'}
        }
      }
    };

    it('should validate', function () {
      var value = {id: 1};
      var ret = validateParameter({
        schema: helper.makeParam('SomeObject', false),
        value,
        models: model,
        validationContext,
        validationSettings
      });
      assertValidationPassed(ret, [value]);
    });

    it('should not validate with missing parameter', function () {
      var ret = validateParameter({
        schema: helper.makeParam('SomeObject', true),
        value: {},
        models: model,
        validationContext,
        validationSettings
      });
      assertValidationFailed(ret, ["id is required"]);
    });

    it('should not validate', function () {
      var ret = validateParameter({
        schema: helper.makeParam('SomeObject', true),
        value: {id: 'thisisastring'},
        models: model,
        validationContext,
        validationSettings
      });
      assertValidationFailed(ret, ["id is not a type of int32"]);
    });
  });

  describe('one integer int64 format required', function () {
    // each section defines it's own validation parameters
    var model = {
      SomeObject: {
        required: ['id'],
        properties: {
          id: {type: 'integer', format: 'int64'}
        }
      }
    };

    it('should validate', function () {
      var value = {id: 1};
      var ret = validateParameter({
        schema: helper.makeParam('SomeObject', false),
        value,
        models: model,
        validationContext,
        validationSettings
      });
      assertValidationPassed(ret, [value]);
    });

    it('should not validate with missing parameter', function () {
      var ret = validateParameter({
        schema: helper.makeParam('SomeObject', true),
        value: {},
        models: model,
        validationContext,
        validationSettings
      });
      assertValidationFailed(ret, ["id is required"]);
    });

    it('should not validate', function () {
      var ret = validateParameter({
        schema: helper.makeParam('SomeObject', true),
        value: {id: ' '},
        models: model,
        validationContext,
        validationSettings
      });
      assertValidationFailed(ret, ["id is not a type of int64"]);
    });
  });

  describe('one string no format required', function () {
    // each section defines it's own validation parameters
    var model = {
      SomeObject: {
        required: ['id'],
        properties: {
          id: {type: 'string'}
        }
      }
    };

    it('should validate', function () {
      var value = {id: 'this is a string'};
      var ret = validateParameter({
        schema: helper.makeParam('SomeObject', false),
        value,
        models: model,
        validationContext,
        validationSettings
      });
      assertValidationPassed(ret, [value]);
    });

    it('should not validate with missing parameter', function () {
      var ret = validateParameter({
        schema: helper.makeParam('SomeObject', true),
        value: {},
        models: model,
        validationContext,
        validationSettings
      });
      assertValidationFailed(ret, ["id is required"]);
    });

    it('should not validate', function () {
      var ret = validateParameter({
        schema: helper.makeParam('SomeObject', true),
        value: {id: {}},
        models: model,
        validationContext,
        validationSettings
      });
      assertValidationFailed(ret, ["id is not a type of string"]);
    });
  });

  describe('one string byte format required', function () {
    // each section defines it's own validation parameters
    var model = {
      SomeObject: {
        required: ['id'],
        properties: {
          id: {type: 'string', format: 'byte'}
        }
      }
    };

    it('should validate', function () {
      var value = {id: [65, 43]};
      var ret = validateParameter({
        schema: helper.makeParam('SomeObject', false),
        value,
        models: model,
        validationContext,
        validationSettings
      });
      assertValidationPassed(ret, [value]);
    });

    it('should not validate with missing parameter', function () {
      var ret = validateParameter({
        schema: helper.makeParam('SomeObject', true),
        value: {},
        models: model,
        validationContext,
        validationSettings
      });
      assertValidationFailed(ret, ["id is required"]);
    });
  });

  describe('one string date format required', function () {
    // each section defines it's own validation parameters
    var model = {
      SomeObject: {
        required: ['id'],
        properties: {
          id: {
            type: 'string',
            format: 'date'
          }
        }
      }
    };

    it('should validate', function () {
      var value = {id: '2014-08-08'};
      var transformedValue = {id: moment('2014-08-08').toDate()};
      var ret = validateParameter({
        schema: helper.makeParam('SomeObject', false),
        value,
        models: model,
        validationContext,
        validationSettings
      });
      assertValidationPassed(ret, [transformedValue]);
    });

    it('should not validate with missing parameter', function () {
      var ret = validateParameter({
        schema: helper.makeParam('SomeObject', true),
        value: {},
        models: model,
        validationContext,
        validationSettings
      });
      assertValidationFailed(ret, ["id is required"]);
    });
  });

  describe('one string date-time format required', function () {
    // each section defines it's own validation parameters
    var model = {
      SomeObject: {
        required: ['id'],
        properties: {
          id: {
            type: 'string',
            format: 'date-time'
          }
        }
      }
    };

    it('should validate', function () {
      var value = {id: '2014-08-09T12:43:00'};
      var transformedValue = {id: moment('2014-08-09T12:43:00').toDate()};
      var ret = validateParameter({
        schema: helper.makeParam('SomeObject', false),
        value,
        models: model,
        validationContext,
        validationSettings
      });
      assertValidationPassed(ret, [transformedValue]);
    });

    it('should not validate with missing parameter', function () {
      var ret = validateParameter({
        schema: helper.makeParam('SomeObject', true),
        value: {},
        models: model,
        validationContext,
        validationSettings
      });
      assertValidationFailed(ret, ["id is required"]);
    });
  });

  describe('one boolean no format required', function () {
    // each section defines it's own validation parameters
    var model = {
      SomeObject: {
        required: ['id'],
        properties: {
          id: {type: 'boolean'}
        }
      }
    };

    it('should validate', function () {
      var value = {id: 'true'};
      var transformedValue = {id: true};
      var ret = validateParameter({
        schema: helper.makeParam('SomeObject', false),
        value,
        models: model,
        validationContext,
        validationSettings
      });
      assertValidationPassed(ret, [transformedValue]);
    });

    it('should not validate with missing parameter', function () {
      var ret = validateParameter({
        schema: helper.makeParam('SomeObject', true),
        value: {},
        models: model,
        validationContext,
        validationSettings
      });
      assertValidationFailed(ret, ["id is required"]);
    });

    it('should not validate', function () {
      var ret = validateParameter({
        schema: helper.makeParam('SomeObject', true),
        value: {id: 'thisisastring'},
        models: model,
        validationContext,
        validationSettings
      });
      assertValidationFailed(ret, ["id is not a type of boolean"]);
    });
  });

  describe('one of each type not required', function () {
    // each section defines it's own validation parameters
    var models = {
      SomeObject: {
        properties: {
          number: {type: 'number'},
          float: {type: 'number', format: 'float'},
          double: {type: 'number', format: 'double'},
          integer: {type: 'integer'},
          int32: {type: 'integer', format: 'int32'},
          int64: {type: 'integer', format: 'int64'},
          string: {type: 'string'},
          byte: {type: 'string', format: 'byte'},
          date: {type: 'string', format: 'date'},
          datetime: {type: 'string', format: 'date-time'},
          boolean: {type: 'boolean'}
        }
      }
    };

    it('should validate', function () {
      var value = {
        number: 0x33,
        float: -2.231231,
        double: Number.MIN_VALUE,
        integer: 2e0,
        int32: -2312,
        int64: Number.MAX_VALUE,
        string: 'ThisIsAString ThatContains Many Spaces',
        byte: [35, 98],
        date: '2013-08-09',
        datetime: '2014-01-01T17:00',
        boolean: true
      };
      var transformedValue = {
        number: 0x33,
        float: -2.231231,
        double: Number.MIN_VALUE,
        integer: 2e0,
        int32: -2312,
        int64: Number.MAX_VALUE,
        string: 'ThisIsAString ThatContains Many Spaces',
        byte: [35, 98],
        date: moment('2013-08-09').toDate(),
        datetime: moment('2014-01-01T17:00').toDate(),
        boolean: true
      };
      var ret = validateParameter({
        schema: helper.makeParam('SomeObject', false),
        value,
        models: models,
        validationContext,
        validationSettings
      });
      assertValidationPassed(ret, [transformedValue]);
    });

    it('should not validate all invalid', function () {
      var ret = validateParameter({
        schema: helper.makeParam('SomeObject', true),
        value: {
          number: 'Random String',
          float: true,
          double: [323.33],
          integer: {},
          int32: Number.MIN_VALUE,
          int64: Number.MAX_VALUE + Number.MAX_VALUE,
          string: 1,
          byte: false,
          date: Number(1),
          datetime: Number(2.23526),
          boolean: 'Not a boolean'
        },
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(ret, [
        'boolean is not a type of boolean',
        'date is not valid based on the pattern for moment.ISO 8601',
        'datetime is not valid based on the pattern for moment.ISO 8601',
        'double is not a type of double',
        'float is not a type of float',
        'int32 is not a type of int32',
        'int64 is not a type of int64',
        'integer is not a type of integer',
        'number is not a type of number',
        'string is not a type of string'
      ]);
    });

    it('should not validate half invalid', function () {
      var ret = validateParameter({
        schema: helper.makeParam('SomeObject', true),
        value: {
          number: 'Random String',
          float: true,
          double: [323.33],
          integer: {},
          int32: -2312,
          int64: Number.MIN_VALUE + 1,
          string: 'ThisIsAString ThatContains Many Spaces',
          byte: [35, 98],
          date: '2013-08-09',
          datetime: '2014-01-01T17:00',
          boolean: true
        },
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(ret, [
        'double is not a type of double',
        'float is not a type of float',
        'integer is not a type of integer',
        'number is not a type of number'
      ]);
    });

    it('should not validate other half invalid', function () {
      var ret = validateParameter({
        schema: helper.makeParam('SomeObject', true),
        value: {
          number: 0x33,
          float: -2.231231,
          double: -Number.MIN_VALUE,
          integer: 2e8,
          int32: Number.MIN_VALUE,
          int64: Number.MAX_VALUE + Number.MAX_VALUE,
          string: 1,
          byte: false,
          date: Number(1),
          datetime: Number(2.3265),
          boolean: 'Not a boolean'
        },
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(ret, [
        'boolean is not a type of boolean',
        'date is not valid based on the pattern for moment.ISO 8601',
        'datetime is not valid based on the pattern for moment.ISO 8601',
        'int32 is not a type of int32',
        'int64 is not a type of int64',
        'string is not a type of string'
      ]);
    });
  });

  describe('one of each type required', function () {
    // each section defines it's own validation parameters
    var model = {
      SomeObject: {
        required: ['param1', 'param2', 'param3', 'param4', 'param5', 'param6', 'param7', 'param8', 'param9', 'param10', 'param11'],
        properties: {
          param1: {type: 'number'},
          param2: {type: 'number', format: 'float'},
          param3: {type: 'number', format: 'double'},
          param4: {type: 'integer'},
          param5: {type: 'integer', format: 'int32'},
          param6: {type: 'integer', format: 'int64'},
          param7: {type: 'string'},
          param8: {type: 'string', format: 'byte'},
          param9: {type: 'string', format: 'date'},
          param10: {type: 'string', format: 'date-time'},
          param11: {type: 'boolean'}
        }
      }
    };

    it('should validate', function () {
      var value = {
        param1: 0x33,
        param2: -2.231231,
        param3: Number.MIN_VALUE,
        param4: 2e0,
        param5: -2312,
        param6: Number.MAX_VALUE,
        param7: 'ThisIsAString ThatContains Many Spaces',
        param8: [35, 98],
        param9: '2013-08-09',
        param10: '2014-01-01T17:00:00',
        param11: true
      };
      var transformedValue = {
        param1: 0x33,
        param2: -2.231231,
        param3: Number.MIN_VALUE,
        param4: 2e0,
        param5: -2312,
        param6: Number.MAX_VALUE,
        param7: 'ThisIsAString ThatContains Many Spaces',
        param8: [35, 98],
        param9: moment('2013-08-09').toDate(),
        param10: moment('2014-01-01T17:00:00').toDate(),
        param11: true
      };
      var ret = validateParameter({
        schema: helper.makeParam('SomeObject', false),
        value,
        models: model,
        validationContext,
        validationSettings
      });
      assertValidationPassed(ret, [transformedValue]);
    });

    it('should not validate all missing', function () {
      var ret = validateParameter({
        schema: helper.makeParam('SomeObject', true),
        value: {},
        models: model,
        validationContext,
        validationSettings
      });
      assertValidationFailed(ret, ['param1 is required', 'param10 is required', 'param11 is required', 'param2 is required', 'param3 is required', 'param4 is required', 'param5 is required', 'param6 is required', 'param7 is required', 'param8 is required', 'param9 is required']);
    });
  });

  describe('one with object parameter not required', function () {
    var model = {
      bar: {
        id: 'bar',
        name: 'bar',
        properties: {
          array: helper.makeArrayParam(false, 'boolean')
        }
      },
      foo: {
        id: 'foo',
        name: 'foo',
        properties: {
          obj: {$ref: 'bar'},
          integer: {type: 'integer'}
        }
      }
    };

    it('should validate', function () {
      var value = {
        obj: {array: [true, false, true]},
        integer: 1
      };
      var ret = validateParameter({
        schema: helper.makeParam('foo', false),
        value,
        models: model,
        validationContext,
        validationSettings
      });
      assertValidationPassed(ret, [value]);
    });

    it('should validate all missing', function () {
      var ret = validateParameter({
        schema: helper.makeParam('foo', true),
        value: {},
        models: model,
        validationContext,
        validationSettings
      });
      assertValidationPassed(ret, [
        {}
      ]);
    });

    it('should validate array missing', function () {
      var value = {
        obj: {},
        integer: 1
      };
      var ret = validateParameter({
        schema: helper.makeParam('foo', true),
        value,
        models: model,
        validationContext,
        validationSettings
      });
      assertValidationPassed(ret, [value]);
    });

    it('should not validate all invalid', function () {
      var value = {
        obj: [true, false, true],
        integer: false
      };
      var ret = validateParameter({
        schema: helper.makeParam('foo', true),
        value,
        models: model,
        validationContext,
        validationSettings
      });
      assertValidationFailed(ret, ['integer is not a type of integer', 'obj is not a type of object']);
    });

    it('should not validate array invalid', function () {
      var value = {
        obj: {array: ['1']},
        integer: 1
      };
      var ret = validateParameter({
        schema: helper.makeParam('foo', true),
        value,
        models: model,
        validationContext,
        validationSettings
      });
      assertValidationFailed(ret, ['1 is not a type of boolean']);
    });
  });

  describe('one with required object parameter', function () {
    var model = {
      bar: {
        id: 'bar',
        name: 'bar',
        required: ['array'],
        properties: {
          array: helper.makeArrayParam(false, 'boolean')
        }
      },
      foo: {
        id: 'foo',
        name: 'foo',
        required: ['obj', 'integer'],
        properties: {
          obj: {$ref: 'bar'},
          integer: {type: 'integer'}
        }
      }
    };

    it('should validate', function () {
      var value = {
        obj: {array: [true, false, true]},
        integer: 1
      };
      var ret = validateParameter({
        schema: helper.makeParam('foo', false),
        value,
        models: model,
        validationContext,
        validationSettings
      });
      assertValidationPassed(ret, [value]);
    });

    it('should not validate array missing', function () {
      var value = {
        obj: {},
        integer: 1
      };
      var ret = validateParameter({
        schema: helper.makeParam('foo', true),
        value,
        models: model,
        validationContext,
        validationSettings
      });
      assertValidationFailed(ret, ['array is required']);
    });

    it('should not validate all invalid', function () {
      var value = {
        obj: [true, false, true],
        integer: false
      };
      var ret = validateParameter({
        schema: helper.makeParam('foo', true),
        value,
        models: model,
        validationContext,
        validationSettings
      });
      assertValidationFailed(ret, ['integer is not a type of integer', 'obj is not a type of object']);
    });

    it('should not validate array invalid', function () {
      var value = {
        obj: {array: ['1']},
        integer: 1
      };
      var ret = validateParameter({
        schema: helper.makeParam('foo', true),
        value,
        models: model,
        validationContext,
        validationSettings
      });
      assertValidationFailed(ret, ['1 is not a type of boolean']);
    });

    it('should not validate all missing', function () {
      var ret = validateParameter({
        schema: helper.makeParam('foo', true),
        value: {},
        models: model,
        validationContext,
        validationSettings
      });
      assertValidationFailed(ret, ['integer is required', 'obj is required']);
    });
  });

  describe('additional properties', function () {
    let models;

    beforeEach(() => {
      models = {
        SomeObject: {
          properties: {
            id: {type: 'string'}
          },
          additionalProperties: false
        }
      };
    });

    it('should validate', () => {
      const value = {id: '123'};
      const result = validateParameter({
        schema: helper.makeParam('SomeObject', true),
        value,
        models,
        validationContext,
        validationSettings
      });
      assertValidationPassed(result, [{id: '123'}]);
    });

    it('should return an error when "additionalProperties" is false and an additional property is provided', () => {
      const value = {
        id: '123',
        extraProperty: 'some value',
        anotherProperty: 'some value'
      };
      const result = validateParameter({
        schema: helper.makeParam('SomeObject', true),
        value,
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(result, ["testParam contains invalid properties: extraProperty, anotherProperty"]);
    });

    it('should return success when "additionalProperties" is false and there are no properties in the model or the value', () => {
      models.SomeObject = {
        additionalProperties: false
      };
      const value = {};
      const result = validateParameter({
        schema: helper.makeParam('SomeObject', true),
        value,
        models,
        validationContext,
        validationSettings
      });
      assertValidationPassed(result, [{}]);
    });
  });

  describe('error handling', () => {
    it('should include the path of the data which failed validation in the result', () => {
      let models = {
        ObjectWithString: {
          type: 'object',
          properties: {
            someProperty: {
              type: 'string'
            }
          }
        }
      };

      let result = validateParameter({
        schema: models.ObjectWithString,
        value: {someProperty: 1},
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(result, ['someProperty is not a type of string']);
      expect(result[0].context.toLiteral()).to.eql({dataPath: ['someProperty']});
      expect(result[0].context.formatDataPath()).to.eql("someProperty");

      models = {
        ObjectContainingAnotherObject: {
          type: 'object',
          properties: {
            someNestedObject: {
              $ref: 'ObjectWithString'
            }
          }
        },
        ObjectWithString: {
          type: 'object',
          properties: {
            someProperty: {
              type: 'string'
            }
          }
        }
      };

      result = validateParameter({
        schema: models.ObjectContainingAnotherObject,
        value: {someNestedObject: {someProperty: 1}},
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(result, ['someProperty is not a type of string']);
      expect(result[0].context.toLiteral()).to.eql({dataPath: ['someNestedObject', 'someProperty']});
      expect(result[0].context.formatDataPath()).to.eql("someNestedObject.someProperty");
    });
  })
});
