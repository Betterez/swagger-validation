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
    });
  });
});
