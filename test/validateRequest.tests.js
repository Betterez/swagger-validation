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
      beforeEach(() => {
        validationSettings.treatEmptyStringsLikeUndefinedValues = false;
      });

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
      beforeEach(() => {
        validationSettings.objectsCanHaveAnyAdditionalPropertiesByDefault = false;
      });

      it('should not allow an object to have additional properties which are not specified in the schema', () => {
        req.body = {id: '1', someExtraProperty: 'some value'}
        const result = validateRequest(requestSchema, req, models, {objectsCanHaveAnyAdditionalPropertiesByDefault: false});
        assertValidationFailed(result, ['object contains invalid properties: someExtraProperty']);
      });
    });
  });
});
