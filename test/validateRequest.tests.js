const {expect} = require("chai");
const {validateRequest} = require('../index');
const {assertValidationPassed, assertValidationFailed} = require('./test_helper');

describe('validateRequest', () => {
  let requestSchema;
  let req;
  let models;
  let validationSettings;

  beforeEach(() => {
    requestSchema = {
      description: 'A mock endpoint',
      path: '/some-endpoint',
      method: 'POST',
      parameters: [
        {
          in: 'body',
          type: 'RequestBody',
          required: true
        }
      ],
    };
    models = {
      RequestBody: {
        type: 'object',
        properties: {
          id: {
            type: 'string'
          }
        }
      }
    };
    req = {
      body: {}
    };
    validationSettings = {};
  });

  describe('null value handling', () => {
    it('should allow null values by default (legacy behaviour)', () => {
      req.body = {id: null};
      const result = validateRequest(requestSchema, req, models);
      assertValidationPassed(result);
    });

    describe('when the validation options specify that properties are not nullable by default', () => {
      it('should not allow a property to be null by default', () => {
        req.body = {id: null};
        const result = validateRequest(requestSchema, req, models, {allPropertiesAreNullableByDefault: false});
        assertValidationFailed(result, ["id cannot be null"]);
      });
    });
  });

  describe('empty string handling', () => {
    it('should not allow a required string parameter to be an empty string (legacy behaviour)', () => {
      models.RequestBody.required = ['id'];
      req.body = {id: ''};
      const result = validateRequest(requestSchema, req, models);
      assertValidationFailed(result, ["id is required"]);
    });

    describe('when the validation settings specify that empty strings are not treated the same as undefined values', () => {
      it('should allow a required string parameter to be an empty string', () => {
        models.RequestBody.required = ['id'];
        req.body = {id: ''};
        const result = validateRequest(requestSchema, req, models, {treatEmptyStringsLikeUndefinedValues: false});
        assertValidationPassed(result);
      });
    });
  });

  describe('additional properties handling', () => {
    it('should allow an object to have additional properties which are not specified in the schema (legacy behaviour)', () => {
      req.body = {id: '1', someExtraProperty: 'some value'}
      const result = validateRequest(requestSchema, req, models);
      assertValidationPassed(result);
    });

    describe('when the validation settings specify that objects are not allowed to have additional properties by default', () => {
      it('should not allow an object to have additional properties which are not specified in the schema', () => {
        req.body = {id: '1', someExtraProperty: 'some value'}
        const result = validateRequest(requestSchema, req, models, {objectsCanHaveAnyAdditionalPropertiesByDefault: false});
        assertValidationFailed(result, ['object contains invalid properties: someExtraProperty']);
      });
    });
  });

  describe('validation of the request body', () => {
    beforeEach(() => {
      models.RequestBody.required = ['id'];
    });

    it('should allow the request body to have two contradictory schemas, one of which does not match the schema that is provided to the function (legacy behaviour)', () => {
      requestSchema.parameters[0].name = 'requestBody';

      req.body = {
        id: '1'
      };
      let result = validateRequest(requestSchema, req, models);
      assertValidationPassed(result);

      req.body = {
        requestBody: {
          id: '1'
        }
      };
      result = validateRequest(requestSchema, req, models);
      assertValidationPassed(result);
    });

    describe('when the validation settings specify that the request body is not allowed to have two contradictory schemas', () => {
      it('should not allow an object to have additional properties which are not specified in the schema', () => {
        requestSchema.parameters[0].name = 'requestBody';

        req.body = {
          id: '1'
        };
        let result = validateRequest(requestSchema, req, models, {requestBodyCanHaveTwoContradictorySchemas: false});
        assertValidationPassed(result);

        req.body = {
          requestBody: {
            id: '1'
          }
        };
        result = validateRequest(requestSchema, req, models, {requestBodyCanHaveTwoContradictorySchemas: false});
        assertValidationFailed(result, ['id is required']);
      });
    });
  });

  describe('invalid schemas', () => {
    it('should allow a schema to have an invalid "type", and validate that schema as if it were an object (legacy behaviour)', () => {
      models = {
        RequestBody: {
          type: 'abcdefghijklmnop',
          properties: {
            someProperty: {
              type: 'string'
            }
          }
        }
      };
      req.body = {
        someProperty: 'some value'
      };
      let result = validateRequest(requestSchema, req, models);
      assertValidationPassed(result);
    });

    it('should allow a schema to declare both a "type" and a "$ref" which contradict each other (legacy behaviour)', () => {
      models = {
        RequestBody: {
          type: 'object',
          properties: {
            someProperty: {
              type: 'string', // This type intentionally contradicts the $ref below
              $ref: 'SomeObject'
            }
          }
        },
        SomeObject: {
          type: 'object',
          properties: {
            someOtherProperty: {
              type: 'string'
            }
          }
        }
      };

      req.body = {
        someProperty: {
          someOtherProperty: 'some value'
        }
      };
      let result = validateRequest(requestSchema, req, models);
      assertValidationPassed(result);
    });

    it('should allow a request parameter to declare both a "type" and a "schema" which contradict each other (legacy behaviour)', () => {
      requestSchema = {
        description: 'A mock endpoint',
        path: '/some-endpoint/{someParameter}',
        method: 'POST',
        parameters: [
          {
            in: 'path',
            name: 'someParameter',
            type: 'number',
            schema: {
              type: 'string'
            },
            required: true
          }
        ],
      };

      req.params = {
        someParameter: 'ABC'
      };
      let result = validateRequest(requestSchema, req, models);
      assertValidationPassed(result);
    });

    describe('when the validation settings specify that an error should be thrown when there is a problem with the swagger schema', () => {
      it('should throw an error when a schema has both a "type" and a "$ref"', () => {
        models = {
          RequestBody: {
            type: 'object',
            properties: {
              someProperty: {
                type: 'string', // This type intentionally contradicts the $ref below
                $ref: 'SomeObject'
              }
            }
          },
          SomeObject: {
            type: 'object',
            properties: {
              someOtherProperty: {
                type: 'string'
              }
            }
          }
        };

        req.body = {
          someProperty: {
            someOtherProperty: 'some value'
          }
        };
        expect(() => validateRequest(requestSchema, req, models, {throwErrorsWhenSchemaIsInvalid: true}))
          .to.throw('Swagger schema is invalid: A schema can have either a "type" or a "$ref", but not both.');
      });

      it('should throw an error when a schema has a "$ref" that references a model which was not provided in the "models" argument', () => {
        models = {
          RequestBody: {
            type: 'object',
            properties: {
              someProperty: {
                $ref: 'SomeModelWhichDoesNotExist'
              }
            }
          },
        };

        req.body = {
          someProperty: {
            someOtherProperty: 'some value'
          }
        };
        expect(() => validateRequest(requestSchema, req, models, {throwErrorsWhenSchemaIsInvalid: true}))
          .to.throw('Swagger schema is invalid: Unknown reference to model "SomeModelWhichDoesNotExist"');
      });

      it('should throw an error when a request parameter declares both a "type" and a "schema"', () => {
        requestSchema = {
          description: 'A mock endpoint',
          path: '/some-endpoint/{someParameter}',
          method: 'POST',
          parameters: [
            {
              in: 'path',
              name: 'someParameter',
              type: 'number',
              schema: {
                type: 'string'
              },
              required: true
            }
          ],
        };

        req.params = {
          someParameter: 'ABC'
        };
        expect(() => validateRequest(requestSchema, req, models, {throwErrorsWhenSchemaIsInvalid: true}))
          .to.throw('Swagger schema is invalid: request parameter "someParameter" can have either a "type" or a "schema", but not both.');
      });
    });
  });

  describe('when the validation settings specify that errors should have improved messages', () => {
    const validationSettings = {
      allPropertiesAreNullableByDefault: false,
      treatEmptyStringsLikeUndefinedValues: false,
      objectsCanHaveAnyAdditionalPropertiesByDefault: false,
      requestBodyCanHaveTwoContradictorySchemas: false,
      throwErrorsWhenSchemaIsInvalid: true,
      allowStringRepresentationsOfBooleans: false,
      strictDateParsing: true,
      allowNumbersToBeStrings: false,
      allowNumberFormatsWithNoEquivalentRepresentationInJavascript: false,
      improvedErrorMessages: true,
    };

    beforeEach(() => {
      models = {
        RequestBody: {
          type: 'object',
          required: ['requiredBoolean', 'requiredFile'],
          properties: {
            boolean: {
              type: 'boolean'
            },
            requiredBoolean: {
              type: 'boolean'
            },
            string: {
              type: 'string'
            },
            stringWithEnum: {
              type: 'string',
              enum: ['Value A', 'Value B']
            },
            stringWithPattern: {
              type: 'string',
              pattern: '^\\w*$'
            },
            stringWithAtLeastOneCharacter: {
              type: 'string',
              minLength: 1,
            },
            stringWithAtMostOneCharacter: {
              type: 'string',
              maxLength: 1,
            },
            arrayOfStrings: {
              type: 'array',
              items: {
                type: 'string'
              }
            },
            arrayWithUniqueItems: {
              type: 'array',
              uniqueItems: true,
              items: {
                type: 'string'
              }
            },
            arrayWithAtLeastOneItem: {
              type: 'array',
              minItems: 1,
              items: {
                type: 'string'
              }
            },
            arrayWithAtMostOneItem: {
              type: 'array',
              maxItems: 1,
              items: {
                type: 'string'
              }
            },
            date: {
              type: 'string',
              format: 'date',
            },
            dateWithCustomPattern: {
              type: 'string',
              format: 'date',
              pattern: '/d{4}-/d{2}-/d{2}'
            },
            dateTime: {
              type: 'string',
              format: 'date-time',
            },
            dateTimeWithCustomPattern: {
              type: 'string',
              format: 'date-time',
              pattern: '/d{4}-/d{2}-/d{2}'
            },
            requiredFile: {
              type: 'file'
            },
            integer: {
              type: 'integer'
            },
            integerAboveZero: {
              type: 'integer',
              minimum: 1
            },
            integerBelowZero: {
              type: 'integer',
              maximum: -1
            },
            number: {
              type: 'number'
            },
            numberEqualToOrAboveZero: {
              type: 'number',
              minimum: 0
            },
            numberEqualToOrBelowZero: {
              type: 'number',
              maximum: 0
            },
            object: {
              type: 'object',
              required: ['someProperty'],
              properties: {
                someProperty: {
                  type: 'string'
                }
              }
            },
            deepProperty: {
              type: 'object',
              properties: {
                deepArray: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      anotherProperty: {
                        type: 'boolean'
                      }
                    }
                  }
                }
              }
            }
          }
        }
      };
    });

    function expectValueToCauseError(value, expectedErrorMessage) {
      const defaultRequestBody = {
        requiredBoolean: true,
        requiredFile: 'ABC',
      };

      req.body = {...defaultRequestBody, ...value};
      const result = validateRequest(requestSchema, req, models, validationSettings);
      assertValidationFailed(result, [expectedErrorMessage]);
    }

    it('should throw errors with the expected error message under a variety of circumstances', () => {
      // boolean validation
      expectValueToCauseError({boolean: null}, 'Request body is invalid: boolean cannot be null');
      expectValueToCauseError({boolean: 'true'}, 'Request body is invalid: expected boolean to be a boolean, but it is a string');
      expectValueToCauseError({boolean: 1}, 'Request body is invalid: expected boolean to be a boolean, but it is a number');
      expectValueToCauseError({boolean: {}}, 'Request body is invalid: expected boolean to be a boolean, but it is an object');
      expectValueToCauseError({boolean: []}, 'Request body is invalid: expected boolean to be a boolean, but it is an array');
      expectValueToCauseError({requiredBoolean: undefined}, 'Request body is invalid: requiredBoolean is required but is missing');

      // string validation
      expectValueToCauseError({string: null}, 'Request body is invalid: string cannot be null');
      expectValueToCauseError({string: 1}, 'Request body is invalid: expected string to be a string, but it is a number');
      expectValueToCauseError({stringWithEnum: 'Value C'}, 'Request body is invalid: stringWithEnum only allows a specific set of values, and "Value C" is not one of the allowed values');
      expectValueToCauseError({stringWithPattern: 'Item A'}, 'Request body is invalid: expected stringWithPattern to match the regular expression /^\\w*$/');
      expectValueToCauseError({stringWithAtLeastOneCharacter: ''}, 'Request body is invalid: expected stringWithAtLeastOneCharacter to be at least 1 character long, but it has a length of 0');
      expectValueToCauseError({stringWithAtMostOneCharacter: 'AB'}, 'Request body is invalid: expected stringWithAtMostOneCharacter to be at most 1 character long, but it has a length of 2');

      // date validation
      expectValueToCauseError({date: '2'}, 'Request body is invalid: expected date to be a date in ISO 8601 format');
      expectValueToCauseError({dateWithCustomPattern: '2'}, 'Request body is invalid: expected dateWithCustomPattern to be a date matching the pattern /d{4}-/d{2}-/d{2}');

      // date-time validation
      expectValueToCauseError({dateTime: '2'}, 'Request body is invalid: expected dateTime to be a date in ISO 8601 format');
      expectValueToCauseError({dateTimeWithCustomPattern: '2'}, 'Request body is invalid: expected dateTimeWithCustomPattern to be a date matching the pattern /d{4}-/d{2}-/d{2}');

      // file validation
      expectValueToCauseError({requiredFile: null}, 'Request body is invalid: requiredFile cannot be null');

      // integer validation
      expectValueToCauseError({integer: null}, 'Request body is invalid: integer cannot be null');
      expectValueToCauseError({integer: "1"}, 'Request body is invalid: expected integer to be a number, but it is a string');
      expectValueToCauseError({integer: 1.1}, 'Request body is invalid: expected integer to be an integer, but it is a floating-point number');
      expectValueToCauseError({integerAboveZero: 0}, 'Request body is invalid: expected integerAboveZero to have a value of 1 or greater, but it has a value of 0');
      expectValueToCauseError({integerBelowZero: 0}, 'Request body is invalid: expected integerBelowZero to have a value of -1 or lower, but it has a value of 0');

      // number validation
      expectValueToCauseError({number: "1"}, 'Request body is invalid: expected number to be a number, but it is a string');
      expectValueToCauseError({number: NaN}, 'Request body is invalid: expected number to be a number, but it is NaN');
      expectValueToCauseError({number: Infinity}, 'Request body is invalid: expected number to be a number, but it is Infinity');
      expectValueToCauseError({number: -Infinity}, 'Request body is invalid: expected number to be a number, but it is -Infinity');
      expectValueToCauseError({numberEqualToOrAboveZero: -0.001}, 'Request body is invalid: expected numberEqualToOrAboveZero to have a value of 0 or greater, but it has a value of -0.001');
      expectValueToCauseError({numberEqualToOrBelowZero: 0.001}, 'Request body is invalid: expected numberEqualToOrBelowZero to have a value of 0 or lower, but it has a value of 0.001');

      // array validation
      expectValueToCauseError({arrayOfStrings: null}, 'Request body is invalid: arrayOfStrings cannot be null');
      expectValueToCauseError({arrayOfStrings: ''}, 'Request body is invalid: expected arrayOfStrings to be an array, but it is a string');
      expectValueToCauseError({arrayWithUniqueItems: ''}, 'Request body is invalid: expected arrayWithUniqueItems to be an array, but it is a string');
      expectValueToCauseError({arrayWithUniqueItems: ['A', 'A', 'B', 'C', 'C', 'D']}, 'Request body is invalid: expected items in arrayWithUniqueItems to be unique, but the following items appear more than once: A, C');
      expectValueToCauseError({arrayWithAtLeastOneItem: []}, 'Request body is invalid: expected arrayWithAtLeastOneItem to have at least 1 item, but it has 0 items');
      expectValueToCauseError({arrayWithAtMostOneItem: ['A', 'B']}, 'Request body is invalid: expected arrayWithAtMostOneItem to have at most 1 item, but it has 2 items');

      // object validation
      expectValueToCauseError({object: null}, 'Request body is invalid: object cannot be null');
      expectValueToCauseError({object: []}, 'Request body is invalid: expected object to be an object, but it is an array');
      expectValueToCauseError({object: {}}, 'Request body is invalid: object.someProperty is required but is missing');
      expectValueToCauseError({object: {someProperty: 'A', unknownProperty: 'B', anotherUnknownProperty: 'C'}}, 'Request body is invalid: object contains unrecognized properties "unknownProperty", "anotherUnknownProperty"');
      expectValueToCauseError({unknownProperty: 'B'}, 'Request body is invalid: request body contains unrecognized property "unknownProperty"');

      // deeply-nested property validation
      expectValueToCauseError({deepProperty: {deepArray: [{anotherProperty: true}, {anotherProperty: 1}]}}, 'Request body is invalid: expected deepProperty.deepArray[1].anotherProperty to be a boolean, but it is a number');
    });
  });
});
