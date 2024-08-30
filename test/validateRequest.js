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
