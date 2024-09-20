const {expect} = require('chai');
const moment = require('moment');
const helper = require('./test_helper');
const {assertValidationPassed, assertValidationFailed} = helper;
const {validateParameter} = require('../lib/validation/parameter');
const {ValidationContext} = require('../lib/validation/validationContext');
const {getValidationSettings} = require('../lib/validation/validationSettings');

describe('object', () => {
  let validationContext;
  let validationSettings;

  beforeEach(() => {
    validationContext = new ValidationContext();
    validationSettings = getValidationSettings();
  });

  describe('basic tests', () => {
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

    it('should accept the value when the schema has type: "object" and the value matches the schema', () => {
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

    it('should allow an optional property to be undefined', () => {
      const value = {};
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          properties: {
            someProperty: {type: 'string'}
          }
        },
        value,
        models,
        validationContext,
        validationSettings
      });
      assertValidationPassed(validationResults, [value]);
    });

    it('should not allow a required property to be undefined', () => {
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          required: ['someProperty'],
          properties: {
            someProperty: {type: 'string'}
          }
        },
        value: {},
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(validationResults, ["someProperty is required"]);
    });

    it('should not throw an error when the object schema does not declare any "properties"', () => {
      it('should not allow a required property to be undefined', () => {
        const validationResults = validateParameter({
          schema: {
            type: 'object',
            required: [],
          },
          value: {},
          models,
          validationContext,
          validationSettings
        });
        assertValidationPassed(validationResults);
      });
    });

    describe('null value handling', () => {
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

      it('should not allow a required parameter to be null', () => {
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
    });

    describe('empty string handling', () => {
      beforeEach(() => {
        models.SomeObject.properties.id.type = 'string';
      });

      it('should allow an optional parameter to be an empty string, even when that parameter does not have the "string" type (legacy behaviour)', () => {
        const value = {someProperty: ''};
        const validationResults = validateParameter({
          schema: {
            type: 'object',
            required: [],
            properties: {
              someProperty: {type: 'number'}
            }
          },
          value,
          models: models,
          validationContext,
          validationSettings
        });
        assertValidationPassed(validationResults, [value]);
      });

      it('should not allow a required string parameter to be an empty string (legacy behaviour)', () => {
        models.SomeObject.required = ['id'];

        const result = validateParameter({
          schema: models.SomeObject,
          value: {id: ''},
          models,
          validationContext,
          validationSettings
        });
        assertValidationFailed(result, ["id is required"]);
      });

      describe('when the validation settings specify that empty strings are not treated the same as undefined values', () => {
        beforeEach(() => {
          validationSettings.treatEmptyStringsLikeUndefinedValues = false;
        });

        it('should allow a required string parameter to be an empty string', () => {
          models.SomeObject.required = ['id'];

          const result = validateParameter({
            schema: models.SomeObject,
            value: {id: ''},
            models,
            validationContext,
            validationSettings
          });
          assertValidationPassed(result);
        });
      });
    });

    it('should not allow a property which has type: "object" to be an array', () => {
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          required: ['someProperty'],
          properties: {
            someProperty: {type: 'object'}
          }
        },
        value: {someProperty: []},
        models: models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(validationResults, ["someProperty is not a type of object"]);
    });

    it('should not allow a property which has type: "object" to be a number', () => {
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          required: ['someProperty'],
          properties: {
            someProperty: {type: 'object'}
          }
        },
        value: {someProperty: 12},
        models: models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(validationResults, ["someProperty is not a type of object"]);
    });

    it('should not allow a property which has type: "object" to be a string', () => {
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          required: ['someProperty'],
          properties: {
            someProperty: {type: 'object'}
          }
        },
        value: {someProperty: 'thisisastring'},
        models: models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(validationResults, ["someProperty is not a type of object"]);
    });
  });

  describe('when the schema contains an optional number property with no format', () => {
    let models;

    beforeEach(() => {
      models = {};
    });

    it('should accept the value when the value is a number', () => {
      const value = {id: 1};
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          properties: {
            id: {type: 'number'}
          }
        },
        value,
        models,
        validationContext,
        validationSettings
      });
      assertValidationPassed(validationResults, [value]);
    });

    it('should not allow the value to be a string', () => {
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          properties: {
            id: {type: 'number'}
          }
        },
        value: {id: 'thisisastring'},
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(validationResults, ["id is not a type of number"]);
    });
  });

  describe('when the schema contains an optional number property with float format', () => {
    let models;

    beforeEach(() => {
      models = {};
    });

    it('should accept the value when the value is a number', () => {
      const value = {id: 1.233242};
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          properties: {
            id: {type: 'number', format: 'float'}
          }
        },
        value,
        models,
        validationContext,
        validationSettings
      });
      assertValidationPassed(validationResults, [value]);
    });

    it('should not allow the value when it is a string', () => {
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          properties: {
            id: {type: 'number', format: 'float'}
          }
        },
        value: {id: 'thisisastring'},
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(validationResults, ["id is not a type of float"]);
    });
  });

  describe('when the schema contains an optional number property with double format', () => {
    let models;

    beforeEach(() => {
      models = {};
    });

    it('should accept the value when the value is a number', () => {
      const value = {id: 1.233242};
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          properties: {
            id: {type: 'number', format: 'double'}
          }
        },
        value,
        models,
        validationContext,
        validationSettings
      });
      assertValidationPassed(validationResults, [value]);
    });

    it('should not allow the value when it is a string', () => {
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          properties: {
            id: {type: 'number', format: 'double'}
          }
        },
        value: {id: 'thisisastring'},
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(validationResults, ["id is not a type of double"]);
    });
  });

  describe('when the schema contains an optional integer property', () => {
    let models;

    beforeEach(() => {
      models = {};
    });

    it('should accept the value when the value is an integer', () => {
      const value = {id: 1};
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          properties: {
            id: {type: 'integer'}
          }
        },
        value,
        models,
        validationContext,
        validationSettings
      });
      assertValidationPassed(validationResults, [value]);
    });

    it('should not allow the value when it is a string', () => {
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          properties: {
            id: {type: 'integer'}
          }
        },
        value: {id: 'thisisastring'},
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(validationResults, ["id is not a type of integer"]);
    });
  });

  describe('when the schema contains an optional integer property with int32 format', () => {
    let models;

    beforeEach(() => {
      models = {};
    });

    it('should accept the value when the value is an integer', () => {
      const value = {id: 1};
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          properties: {
            id: {type: 'integer', format: 'int32'}
          }
        },
        value,
        models,
        validationContext,
        validationSettings
      });
      assertValidationPassed(validationResults, [value]);
    });

    it('should not allow the value when it is a string', () => {
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          properties: {
            id: {type: 'integer', format: 'int32'}
          }
        },
        value: {id: 'thisisastring'},
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(validationResults, ["id is not a type of int32"]);
    });
  });

  describe('when the schema contains an optional integer property with int64 format', () => {
    let models;

    beforeEach(() => {
      models = {};
    });

    it('should accept the value when it is an integer', () => {
      const value = {id: 1};
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          properties: {
            id: {type: 'integer', format: 'int64'}
          }
        },
        value,
        models,
        validationContext,
        validationSettings
      });
      assertValidationPassed(validationResults, [value]);
    });

    it('should not allow the value when it is a string', () => {
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          properties: {
            id: {type: 'integer', format: 'int64'}
          }
        },
        value: {id: '  '},
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(validationResults, ["id is not a type of int64"]);
    });
  });

  describe('when the schema contains an optional string property', () => {
    let models;

    beforeEach(() => {
      models = {};
    });

    it('should accept the value when it is a string', () => {
      const value = {id: 'this is a string'};
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          properties: {
            id: {type: 'string'}
          }
        },
        value,
        models,
        validationContext,
        validationSettings
      });
      assertValidationPassed(validationResults, [value]);
    });

    it('should not allow the value when it is an object', () => {
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          properties: {
            id: {type: 'string'}
          }
        },
        value: {id: {}},
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(validationResults, ["id is not a type of string"]);
    });
  });

  describe('when the schema contains an optional string property with byte format', () => {
    let models;

    beforeEach(() => {
      models = {};
    });

    it('should accept the value when it is an array of integers that can be converted to bytes', () => {
      const value = {id: [65, 43]};
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          properties: {
            id: {type: 'string', format: 'byte'}
          }
        },
        value,
        models,
        validationContext,
        validationSettings
      });
      assertValidationPassed(validationResults, [value]);
    });
  });

  describe('when the schema contains an optional string property with date format', () => {
    let models;

    beforeEach(() => {
      models = {};
    });

    it('should accept the value when the value is a date in YYYY-MM-DD format', () => {
      const value = {someDate: '2014-08-08'};
      const transformedValue = {someDate: moment('2014-08-08').toDate()};
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          properties: {
            someDate: {type: 'string', format: 'date'}
          }
        },
        value,
        models,
        validationContext,
        validationSettings
      });
      assertValidationPassed(validationResults, [transformedValue]);
    });
  });

  describe('when the schema contains an optional string property with date-time format', () => {
    let models;

    beforeEach(() => {
      models = {};
    });

    it('should accept the value when it is a string with the format of an ISO 8601 timestamp', () => {
      const value = {someDateTime: '2014-08-09T12:43:06.123Z'};
      const transformedValue = {someDateTime: new Date('2014-08-09T12:43:06.123Z')};
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          properties: {
            someDateTime: {type: 'string', format: 'date-time'}
          }
        },
        value,
        models,
        validationContext,
        validationSettings
      });
      assertValidationPassed(validationResults, [transformedValue]);
    });
  });

  describe('when the schema contains an optional boolean property', () => {
    let models;

    beforeEach(() => {
      models = {};
    });

    it('should accept the value when the value is the string "true"', () => {
      const value = {id: 'true'};
      const transformedValue = {id: true};
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          properties: {
            id: {type: 'boolean'}
          }
        },
        value,
        models,
        validationContext,
        validationSettings
      });
      assertValidationPassed(validationResults, [transformedValue]);
    });

    it('should not allow the value when it is not a boolean', () => {
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          properties: {
            id: {type: 'boolean'}
          }
        },
        value: {id: 'thisisastring'},
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(validationResults, ["id is not a type of boolean"]);
    });
  });

  describe('when the schema contains a required number property with no format', () => {
    let models;

    beforeEach(() => {
      models = {};
    });

    it('should accept the value when the value is a number', () => {
      const value = {id: 1};
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          required: ['id'],
          properties: {
            id: {type: 'number'}
          }
        },
        value,
        models,
        validationContext,
        validationSettings
      });
      assertValidationPassed(validationResults, [value]);
    });

    it('should fail validation when the property is missing', () => {
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          required: ['id'],
          properties: {
            id: {type: 'number'}
          }
        },
        value: {},
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(validationResults, ["id is required"]);
    });

    it('should fail validation when the property is null', () => {
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          required: ['id'],
          properties: {
            id: {type: 'number'}
          }
        },
        value: {id: null},
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(validationResults, ["id is required"]);
    });

    it('should fail validation when the property is undefined', () => {
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          required: ['id'],
          properties: {
            id: {type: 'number'}
          }
        },
        value: {id: undefined},
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(validationResults, ["id is required"]);
    });

    it('should fail validation when the property is an empty string', () => {
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          required: ['id'],
          properties: {
            id: {type: 'number'}
          }
        },
        value: {id: ''},
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(validationResults, ["id is required"]);
    });

    it('should fail validation when the property is not a number', () => {
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          required: ['id'],
          properties: {
            id: {type: 'number'}
          }
        },
        value: {id: 'thisisastring'},
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(validationResults, ["id is not a type of number"]);
    });
  });

  describe('when the schema contains a required number property with float format', () => {
    let models;

    beforeEach(() => {
      models = {};
    });

    it('should accept the value when the value is a number', () => {
      const value = {id: 1.233242};
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          required: ['id'],
          properties: {
            id: {type: 'number', format: 'float'}
          }
        },
        value,
        models,
        validationContext,
        validationSettings
      });
      assertValidationPassed(validationResults, [value]);
    });

    it('should fail validation when the property is missing', () => {
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          required: ['id'],
          properties: {
            id: {type: 'number', format: 'float'}
          }
        },
        value: {},
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(validationResults, ["id is required"]);
    });

    it('should fail validation when the property is null', () => {
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          required: ['id'],
          properties: {
            id: {type: 'number', format: 'float'}
          }
        },
        value: {id: null},
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(validationResults, ["id is required"]);
    });

    it('should fail validation when the property is undefined', () => {
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          required: ['id'],
          properties: {
            id: {type: 'number', format: 'float'}
          }
        },
        value: {id: undefined},
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(validationResults, ["id is required"]);
    });

    it('should fail validation when the property is an empty string', () => {
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          required: ['id'],
          properties: {
            id: {type: 'number', format: 'float'}
          }
        },
        value: {id: ''},
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(validationResults, ["id is required"]);
    });

    it('should fail validation when the property is not a number', () => {
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          required: ['id'],
          properties: {
            id: {type: 'number', format: 'float'}
          }
        },
        value: {id: 'thisisastring'},
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(validationResults, ["id is not a type of float"]);
    });
  });

  describe('when the schema contains a required number property with double format', () => {
    let models;

    beforeEach(() => {
      models = {};
    });

    it('should accept the value when the value is a number', () => {
      const value = {id: 1.233242};
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          required: ['id'],
          properties: {
            id: {type: 'number', format: 'double'}
          }
        },
        value,
        models,
        validationContext,
        validationSettings
      });
      assertValidationPassed(validationResults, [value]);
    });

    it('should fail validation when the property is missing', () => {
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          required: ['id'],
          properties: {
            id: {type: 'number', format: 'double'}
          }
        },
        value: {},
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(validationResults, ["id is required"]);
    });

    it('should fail validation when the property is null', () => {
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          required: ['id'],
          properties: {
            id: {type: 'number', format: 'double'}
          }
        },
        value: {id: null},
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(validationResults, ["id is required"]);
    });

    it('should fail validation when the property is undefined', () => {
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          required: ['id'],
          properties: {
            id: {type: 'number', format: 'double'}
          }
        },
        value: {id: undefined},
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(validationResults, ["id is required"]);
    });

    it('should fail validation when the property is an empty string', () => {
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          required: ['id'],
          properties: {
            id: {type: 'number', format: 'double'}
          }
        },
        value: {id: ''},
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(validationResults, ["id is required"]);
    });

    it('should fail validation when the property is not a number', () => {
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          required: ['id'],
          properties: {
            id: {type: 'number', format: 'double'}
          }
        },
        value: {id: 'thisisastring'},
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(validationResults, ["id is not a type of double"]);
    });
  });

  describe('when the schema contains a required integer property with no format', () => {
    let models;

    beforeEach(() => {
      models = {};
    });

    it('should accept the value when the value is an integer', () => {
      const value = {id: 1};
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          required: ['id'],
          properties: {
            id: {type: 'integer'}
          }
        },
        value,
        models,
        validationContext,
        validationSettings
      });
      assertValidationPassed(validationResults, [value]);
    });

    it('should fail validation when the property is missing', () => {
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          required: ['id'],
          properties: {
            id: {type: 'integer'}
          }
        },
        value: {},
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(validationResults, ["id is required"]);
    });

    it('should fail validation when the property is null', () => {
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          required: ['id'],
          properties: {
            id: {type: 'integer'}
          }
        },
        value: {id: null},
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(validationResults, ["id is required"]);
    });

    it('should fail validation when the property is undefined', () => {
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          required: ['id'],
          properties: {
            id: {type: 'integer'}
          }
        },
        value: {id: undefined},
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(validationResults, ["id is required"]);
    });

    it('should fail validation when the property is an empty string', () => {
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          required: ['id'],
          properties: {
            id: {type: 'integer'}
          }
        },
        value: {id: ''},
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(validationResults, ["id is required"]);
    });

    it('should fail validation when the property is not an integer', () => {
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          required: ['id'],
          properties: {
            id: {type: 'integer'}
          }
        },
        value: {id: 'thisisastring'},
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(validationResults, ["id is not a type of integer"]);
    });
  });

  describe('when the schema contains a required integer property with int32 format', () => {
    let models;

    beforeEach(() => {
      models = {};
    });

    it('should accept the value when the value is an integer', () => {
      const value = {id: 1};
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          required: ['id'],
          properties: {
            id: {type: 'integer', format: 'int32'}
          }
        },
        value,
        models,
        validationContext,
        validationSettings
      });
      assertValidationPassed(validationResults, [value]);
    });

    it('should fail validation when the property is missing', () => {
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          required: ['id'],
          properties: {
            id: {type: 'integer', format: 'int32'}
          }
        },
        value: {},
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(validationResults, ["id is required"]);
    });

    it('should fail validation when the property is null', () => {
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          required: ['id'],
          properties: {
            id: {type: 'integer', format: 'int32'}
          }
        },
        value: {id: null},
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(validationResults, ["id is required"]);
    });

    it('should fail validation when the property is undefined', () => {
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          required: ['id'],
          properties: {
            id: {type: 'integer', format: 'int32'}
          }
        },
        value: {id: undefined},
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(validationResults, ["id is required"]);
    });

    it('should fail validation when the property is an empty string', () => {
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          required: ['id'],
          properties: {
            id: {type: 'integer', format: 'int32'}
          }
        },
        value: {id: ''},
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(validationResults, ["id is required"]);
    });

    it('should fail validation when the property is not an integer', () => {
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          required: ['id'],
          properties: {
            id: {type: 'integer', format: 'int32'}
          }
        },
        value: {id: 'thisisastring'},
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(validationResults, ["id is not a type of int32"]);
    });
  });

  describe('when the schema contains a required integer property with int64 format', () => {
    let models;

    beforeEach(() => {
      models = {};
    });

    it('should accept the value when the value is an integer', () => {
      const value = {id: 1};
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          required: ['id'],
          properties: {
            id: {type: 'integer', format: 'int64'}
          }
        },
        value,
        models,
        validationContext,
        validationSettings
      });
      assertValidationPassed(validationResults, [value]);
    });

    it('should fail validation when the property is missing', () => {
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          required: ['id'],
          properties: {
            id: {type: 'integer', format: 'int64'}
          }
        },
        value: {},
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(validationResults, ["id is required"]);
    });

    it('should fail validation when the property is null', () => {
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          required: ['id'],
          properties: {
            id: {type: 'integer', format: 'int64'}
          }
        },
        value: {id: null},
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(validationResults, ["id is required"]);
    });

    it('should fail validation when the property is undefined', () => {
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          required: ['id'],
          properties: {
            id: {type: 'integer', format: 'int64'}
          }
        },
        value: {id: undefined},
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(validationResults, ["id is required"]);
    });

    it('should fail validation when the property is an empty string', () => {
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          required: ['id'],
          properties: {
            id: {type: 'integer', format: 'int64'}
          }
        },
        value: {id: ''},
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(validationResults, ["id is required"]);
    });

    it('should fail validation when the property is not an integer', () => {
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          required: ['id'],
          properties: {
            id: {type: 'integer', format: 'int64'}
          }
        },
        value: {id: ' '},
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(validationResults, ["id is not a type of int64"]);
    });
  });

  describe('when the schema contains a required string property with no format', () => {
    let models;

    beforeEach(() => {
      models = {};
    });

    it('should accept the value when the value is a string', () => {
      const value = {id: 'this is a string'};
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          required: ['id'],
          properties: {
            id: {type: 'string'}
          }
        },
        value,
        models,
        validationContext,
        validationSettings
      });
      assertValidationPassed(validationResults, [value]);
    });

    it('should fail validation when the property is missing', () => {
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          required: ['id'],
          properties: {
            id: {type: 'string'}
          }
        },
        value: {},
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(validationResults, ["id is required"]);
    });

    it('should fail validation when the property is undefined', () => {
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          required: ['id'],
          properties: {
            id: {type: 'string'}
          }
        },
        value: {id: undefined},
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(validationResults, ["id is required"]);
    });

    it('should fail validation when the property is null', () => {
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          required: ['id'],
          properties: {
            id: {type: 'string'}
          }
        },
        value: {id: null},
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(validationResults, ["id is required"]);
    });

    it('should fail validation when the property is an empty string (legacy behaviour)', () => {
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          required: ['id'],
          properties: {
            id: {type: 'string'}
          }
        },
        value: {id: ''},
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(validationResults, ["id is required"]);
    });

    it('should fail validation when the property is not a string', () => {
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          required: ['id'],
          properties: {
            id: {type: 'string'}
          }
        },
        value: {id: {}},
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(validationResults, ["id is not a type of string"]);
    });
  });

  describe('when the schema contains a required string property with byte format', () => {
    let models;

    beforeEach(() => {
      models = {};
    });

    it('should accept the value when the value is an array of integers representing bytes', () => {
      const value = {id: [65, 43]};
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          required: ['id'],
          properties: {
            id: {type: 'string', format: 'byte'}
          }
        },
        value,
        models,
        validationContext,
        validationSettings
      });
      assertValidationPassed(validationResults, [value]);
    });

    it('should fail validation when the property is missing', () => {
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          required: ['id'],
          properties: {
            id: {type: 'string', format: 'byte'}
          }
        },
        value: {},
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(validationResults, ["id is required"]);
    });

    it('should fail validation when the property is undefined', () => {
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          required: ['id'],
          properties: {
            id: {type: 'string', format: 'byte'}
          }
        },
        value: {id: undefined},
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(validationResults, ["id is required"]);
    });

    it('should fail validation when the property is null', () => {
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          required: ['id'],
          properties: {
            id: {type: 'string', format: 'byte'}
          }
        },
        value: {id: null},
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(validationResults, ["id is required"]);
    });

    it('should fail validation when the property is an empty string', () => {
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          required: ['id'],
          properties: {
            id: {type: 'string', format: 'byte'}
          }
        },
        value: {id: ''},
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(validationResults, ["id is required"]);
    });
  });

  describe('when the schema contains a required string property with date format', () => {
    let models;

    beforeEach(() => {
      models = {};
    });

    it('should accept a value when the value is a date in YYYY-MM-DD format', () => {
      const value = {id: '2014-08-08'};
      const transformedValue = {id: moment('2014-08-08').toDate()};
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          required: ['id'],
          properties: {
            id: {type: 'string', format: 'date'}
          }
        },
        value,
        models,
        validationContext,
        validationSettings
      });
      assertValidationPassed(validationResults, [transformedValue]);
    });

    it('should fail validation when the property is missing', () => {
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          required: ['id'],
          properties: {
            id: {type: 'string', format: 'date'}
          }
        },
        value: {},
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(validationResults, ["id is required"]);
    });

    it('should fail validation when the property is undefined', () => {
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          required: ['id'],
          properties: {
            id: {type: 'string', format: 'date'}
          }
        },
        value: {id: undefined},
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(validationResults, ["id is required"]);
    });

    it('should fail validation when the property is null', () => {
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          required: ['id'],
          properties: {
            id: {type: 'string', format: 'date'}
          }
        },
        value: {id: null},
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(validationResults, ["id is required"]);
    });

    it('should fail validation when the property is an empty string', () => {
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          required: ['id'],
          properties: {
            id: {type: 'string', format: 'date'}
          }
        },
        value: {id: ''},
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(validationResults, ["id is required"]);
    });
  });

  describe('when the schema contains a required string property with date-time format', () => {
    let models;

    beforeEach(() => {
      models = {};
    });

    it('should accept the value when it is a string with the format of an ISO 8601 timestamp', () => {
      const value = {someDateTime: '2014-08-09T12:43:06.123Z'};
      const transformedValue = {someDateTime: new Date('2014-08-09T12:43:06.123Z')};
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          required: ['someDateTime'],
          properties: {
            someDateTime: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        value,
        models,
        validationContext,
        validationSettings
      });
      assertValidationPassed(validationResults, [transformedValue]);
    });

    it('should fail validation when the property is missing', () => {
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          required: ['someDateTime'],
          properties: {
            someDateTime: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        value: {},
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(validationResults, ["someDateTime is required"]);
    });

    it('should fail validation when the property is null', () => {
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          required: ['someDateTime'],
          properties: {
            someDateTime: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        value: {someDateTime: null},
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(validationResults, ["someDateTime is required"]);
    });

    it('should fail validation when the property is undefined', () => {
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          required: ['someDateTime'],
          properties: {
            someDateTime: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        value: {someDateTime: undefined},
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(validationResults, ["someDateTime is required"]);
    });

    it('should fail validation when the property is an empty string', () => {
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          required: ['someDateTime'],
          properties: {
            someDateTime: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        value: {someDateTime: ''},
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(validationResults, ["someDateTime is required"]);
    });
  });

  describe('when the schema contains a required boolean property with no format', () => {
    let models;

    beforeEach(() => {
      models = {};
    });

    it('should accept a value when the value is the string "true"', () => {
      const value = {id: 'true'};
      const transformedValue = {id: true};
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          required: ['id'],
          properties: {
            id: {type: 'boolean'}
          }
        },
        value,
        models,
        validationContext,
        validationSettings
      });
      assertValidationPassed(validationResults, [transformedValue]);
    });

    it('should fail validation when the property is missing', () => {
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          required: ['id'],
          properties: {
            id: {type: 'boolean'}
          }
        },
        value: {},
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(validationResults, ["id is required"]);
    });

    it('should fail validation when the property is undefined', () => {
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          required: ['id'],
          properties: {
            id: {type: 'boolean'}
          }
        },
        value: {id: undefined},
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(validationResults, ["id is required"]);
    });

    it('should fail validation when the property is null', () => {
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          required: ['id'],
          properties: {
            id: {type: 'boolean'}
          }
        },
        value: {id: null},
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(validationResults, ["id is required"]);
    });

    it('should fail validation when the property is an empty string', () => {
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          required: ['id'],
          properties: {
            id: {type: 'boolean'}
          }
        },
        value: {id: ''},
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(validationResults, ["id is required"]);
    });

    it('should fail validation when the property is not a boolean', () => {
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          required: ['id'],
          properties: {
            id: {type: 'boolean'}
          }
        },
        value: {id: 'thisisastring'},
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(validationResults, ["id is not a type of boolean"]);
    });
  });

  describe('when the schema contains a required file property with no format', () => {
    let models;

    beforeEach(() => {
      models = {};
    });

    it('should accept any value', () => {
      const schema = {
        type: 'object',
        required: ['someFile'],
        properties: {
          someFile: {type: 'file'}
        }
      };

      let value = {someFile: 'this is a file'};
      let validationResults = validateParameter({
        schema,
        value,
        models,
        validationContext,
        validationSettings
      });
      assertValidationPassed(validationResults, [value]);

      value = {someFile: 1};
      validationResults = validateParameter({
        schema,
        value,
        models,
        validationContext,
        validationSettings
      });
      assertValidationPassed(validationResults, [value]);

      value = {someFile: {someProperty: [1, '2', true, 0x34b, null]}};
      validationResults = validateParameter({
        schema,
        value,
        models,
        validationContext,
        validationSettings
      });
      assertValidationPassed(validationResults, [value]);
    });

    it('should fail validation when the property is missing', () => {
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          required: ['someFile'],
          properties: {
            someFile: {type: 'file'}
          }
        },
        value: {},
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(validationResults, ["someFile is required"]);
    });

    it('should fail validation when the property is undefined', () => {
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          required: ['someFile'],
          properties: {
            someFile: {type: 'file'}
          }
        },
        value: {someFile: undefined},
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(validationResults, ["someFile is required"]);
    });

    it('should fail validation when the property is null', () => {
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          required: ['someFile'],
          properties: {
            someFile: {type: 'file'}
          }
        },
        value: {someFile: null},
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(validationResults, ["someFile is required"]);
    });

    it('should fail validation when the property is an empty string (legacy behaviour)', () => {
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          required: ['someFile'],
          properties: {
            someFile: {type: 'file'}
          }
        },
        value: {someFile: ''},
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(validationResults, ["someFile is required"]);
    });

    it('should fail validation when the property is not a string', () => {
      const validationResults = validateParameter({
        schema: {
          type: 'object',
          required: ['id'],
          properties: {
            id: {type: 'string'}
          }
        },
        value: {id: {}},
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(validationResults, ["id is not a type of string"]);
    });
  });

  describe('when the schema contains many optional properties of different types', () => {
    const schema = {
      type: 'object',
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
    };
    let models;

    beforeEach(() => {
      models = {};
    });

    it('should accept a value when the value contains all of the optional properties, and all properties are of the correct type', () => {
      const value = {
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
      const transformedValue = {
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
      const validationResults = validateParameter({
        schema,
        value,
        models,
        validationContext,
        validationSettings
      });
      assertValidationPassed(validationResults, [transformedValue]);
    });

    it('should fail validation when all of the optional properties are of the incorrect type', () => {
      const validationResults = validateParameter({
        schema,
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
      assertValidationFailed(validationResults, [
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

    it('should fail validation when some of the properties are of the incorrect type, and some others have the correct type', () => {
      let validationResults = validateParameter({
        schema,
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
      assertValidationFailed(validationResults, [
        'double is not a type of double',
        'float is not a type of float',
        'integer is not a type of integer',
        'number is not a type of number'
      ]);

      // Check that the correct errors are thrown when the other half of the properties are invalid
      validationResults = validateParameter({
        schema,
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
      assertValidationFailed(validationResults, [
        'boolean is not a type of boolean',
        'date is not valid based on the pattern for moment.ISO 8601',
        'datetime is not valid based on the pattern for moment.ISO 8601',
        'int32 is not a type of int32',
        'int64 is not a type of int64',
        'string is not a type of string'
      ]);
    });
  });

  describe('when the schema contains many required properties of different types', () => {
    const schema = {
      type: 'object',
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
    };
    let models;

    beforeEach(() => {
      models = {};
    });

    it('should accept a value when the value contains all of the required properties, and all properties are of the correct type', () => {
      const value = {
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
      const transformedValue = {
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
      const validationResults = validateParameter({
        schema,
        value,
        models,
        validationContext,
        validationSettings
      });
      assertValidationPassed(validationResults, [transformedValue]);
    });

    it('should fail validation when all of the required properties are missing', () => {
      const validationResults = validateParameter({
        schema,
        value: {},
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(validationResults, ['param1 is required', 'param10 is required', 'param11 is required', 'param2 is required', 'param3 is required', 'param4 is required', 'param5 is required', 'param6 is required', 'param7 is required', 'param8 is required', 'param9 is required']);
    });
  });

  describe('when the schema contains a deep reference to another model which has type: "object" and which is an optional property', () => {
    const models = {
      bar: {
        type: 'object',
        properties: {
          array: {
            type: 'array',
            items: {
              type: 'boolean'
            }
          }
        }
      },
      foo: {
        type: 'object',
        properties: {
          obj: {$ref: 'bar'},
          integer: {type: 'integer'}
        }
      }
    };

    it('should accept a value when all properties are provided', () => {
      const value = {
        obj: {array: [true, false, true]},
        integer: 1
      };
      const validationResults = validateParameter({
        schema: models.foo,
        value,
        models,
        validationContext,
        validationSettings
      });
      assertValidationPassed(validationResults, [value]);
    });

    it('should accept a value when all properties are missing', () => {
      const validationResults = validateParameter({
        schema: models.foo,
        value: {},
        models,
        validationContext,
        validationSettings
      });
      assertValidationPassed(validationResults, [{}]);
    });

    it('should accept a value when a deeply-nested optional property is missing', () => {
      const value = {
        obj: {},
        integer: 1
      };
      const validationResults = validateParameter({
        schema: models.foo,
        value,
        models,
        validationContext,
        validationSettings
      });
      assertValidationPassed(validationResults, [value]);
    });

    it('should fail validation when all of the properties are of the wrong type', () => {
      const value = {
        obj: [true, false, true],
        integer: false
      };
      const validationResults = validateParameter({
        schema: models.foo,
        value,
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(validationResults, ['integer is not a type of integer', 'obj is not a type of object']);
    });

    it('should fail validation when a deeply-nested property is of the wrong type', () => {
      const value = {
        obj: {array: ['1']},
        integer: 1
      };
      const validationResults = validateParameter({
        schema: models.foo,
        value,
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(validationResults, ['1 is not a type of boolean']);
    });
  });

  describe('when the schema contains a deep reference to another model which has type: "object" and which is a required property', () => {
    const models = {
      bar: {
        type: 'object',
        required: ['array'],
        properties: {
          array: {
            type: 'array',
            items: {
              type: 'boolean'
            }
          }
        }
      },
      foo: {
        type: 'object',
        required: ['obj', 'integer'],
        properties: {
          obj: {$ref: 'bar'},
          integer: {type: 'integer'}
        }
      }
    };

    it('should accept a value when all properties are provided', () => {
      const value = {
        obj: {array: [true, false, true]},
        integer: 1
      };
      const validationResults = validateParameter({
        schema: models.foo,
        value,
        models,
        validationContext,
        validationSettings
      });
      assertValidationPassed(validationResults, [value]);
    });

    it('should fail validation when a deeply-nested required property is missing', () => {
      const value = {
        obj: {},
        integer: 1
      };
      const validationResults = validateParameter({
        schema: models.foo,
        value,
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(validationResults, ['array is required']);
    });

    it('should fail validation when all properties are of the wrong type', () => {
      const value = {
        obj: [true, false, true],
        integer: false
      };
      const validationResults = validateParameter({
        schema: models.foo,
        value,
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(validationResults, ['integer is not a type of integer', 'obj is not a type of object']);
    });

    it('should fail validation when a deeply-nested property is of the wrong type', () => {
      const value = {
        obj: {array: ['1']},
        integer: 1
      };
      const validationResults = validateParameter({
        schema: models.foo,
        value,
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(validationResults, ['1 is not a type of boolean']);
    });

    it('should fail validation when multiple required properties are missing', () => {
      const validationResults = validateParameter({
        schema: models.foo,
        value: {},
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(validationResults, ['integer is required', 'obj is required']);
    });
  });

  describe('additional properties', () => {
    let models;

    beforeEach(() => {
      models = {
        SomeObject: {
          type: 'object',
          properties: {
            id: {type: 'string'}
          }
        }
      };
    });

    it('should allow an object to have additional properties which are not specified in the schema (legacy behaviour)', () => {
      const result = validateParameter({
        schema: models.SomeObject,
        value: {
          id: '123',
          extraProperty: 'some value'
        },
        models,
        validationContext,
        validationSettings
      });
      assertValidationPassed(result, [{id: '123', extraProperty: 'some value'}]);
    });

    it('should return an error when "additionalProperties" is false and an additional property is provided', () => {
      models.SomeObject.additionalProperties = false;

      const result = validateParameter({
        schema: models.SomeObject,
        value: {
          id: '123',
          extraProperty: 'some value',
          anotherProperty: 'some value'
        },
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(result, ['object contains invalid properties: extraProperty, anotherProperty']);
    });

    it('should return success when "additionalProperties" is false and there are no properties in the model or the value', () => {
      models.SomeObject = {
        type: 'object',
        additionalProperties: false
      };
      const result = validateParameter({
        schema: models.SomeObject,
        value: {},
        models,
        validationContext,
        validationSettings
      });
      assertValidationPassed(result, [{}]);
    });

    describe('when the validation settings specify that objects are not allowed to have additional properties by default', () => {
      beforeEach(() => {
        validationSettings.objectsCanHaveAnyAdditionalPropertiesByDefault = false;
      });

      it('should not allow an object to have additional properties which are not specified in the schema', () => {
        const result = validateParameter({
          schema: models.SomeObject,
          value: {
            id: '123',
            extraProperty: 'some value',
            anotherProperty: 'some value'
          },
          models,
          validationContext,
          validationSettings
        });
        assertValidationFailed(result, ['object contains invalid properties: extraProperty, anotherProperty']);
      });

      it('should allow an object to have additional properties when "additionalProperties" is false', () => {
        models.SomeObject.additionalProperties = true;

        const result = validateParameter({
          schema: models.SomeObject,
          value: {
            id: '123',
            extraProperty: 'some value',
            anotherProperty: 'some value'
          },
          models,
          validationContext,
          validationSettings
        });
        assertValidationPassed(result);
      });
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
      expect(result[0].context.toLiteral()).to.have.property('dataPath');
      expect(result[0].context.toLiteral().dataPath).to.eql(['someProperty']);
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
      expect(result[0].context.toLiteral()).to.have.property('dataPath');
      expect(result[0].context.toLiteral().dataPath).to.eql(['someNestedObject', 'someProperty']);
      expect(result[0].context.formatDataPath()).to.eql("someNestedObject.someProperty");
    });
  });

  describe('invalid schemas', () => {
    it('should return a validation error when the object has a $ref that refers to an unknown model', () => {
      const results = validateParameter({
        schema: {
          $ref: 'SomeUnknownModel'
        },
        value: {},
        models: {},
        validationContext,
        validationSettings
      });
      assertValidationFailed(results, ['Unknown param type SomeUnknownModel']);
    });

    describe('when the validation settings specify that an error should be thrown when there is a problem with the swagger schema', () => {
      beforeEach(() => {
        validationSettings.throwErrorsWhenSchemaIsInvalid = true;
      });

      it('should throw an error when the object has a "$ref" that refers to an unknown model', () => {
        expect(() => validateParameter({
          schema: {
            $ref: 'SomeUnknownModel'
          },
          value: {},
          models: {},
          validationContext,
          validationSettings
        })).to.throw('Swagger schema is invalid: Unknown reference to model "SomeUnknownModel"');
      });

      it('should throw an error when the object has a "type" that refers to an unknown model when the "type" field is used like a "$ref" pointing to another model (legacy behaviour)', () => {
        expect(() => validateParameter({
          schema: {
            type: 'SomeUnknownModel'
          },
          value: {},
          models: {},
          validationContext,
          validationSettings
        })).to.throw('Swagger schema is invalid: Unknown reference to model "SomeUnknownModel"');
      });
    });
  });
});
