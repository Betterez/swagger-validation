const moment = require('moment');
const {expect} = require('chai');
const {validateRequest} = require('../lib/validation/validateRequest');
const helper = require('./test_helper');
const {assertValidationPassed, assertValidationFailed} = helper;

describe('paramType - path', function () {
  describe('without models', function () {
    it('should convert strings', function () {
      var spec = {
        parameters: [
          {
            name: 'someDate',
            type: 'string',
            format: 'date',
            paramType: 'path'
          },
          {
            name: 'someNumber',
            type: 'number',
            format: 'float',
            paramType: 'path'
          },
          {
            name: 'someString',
            type: 'string',
            in: 'path',
            pattern: 'some.*'
          }
        ]
      };
      var someDate = '2014-08-12';
      var someNumber = '123.01';
      var someDateTransformed = moment('2014-08-12').toDate();
      var someNumberTransformed = 123.01;
      var req = {
        params: {
          someDate: someDate,
          someNumber: someNumber
        }
      };
      var ret = validateRequest(spec, req);
      assertValidationPassed(ret);
      expect(req.params.someDate).to.eql(someDateTransformed);
      expect(req.params.someNumber).to.equal(someNumberTransformed);
    });

    it('should not convert strings', function () {
      var spec = {
        validation: {
          replaceValues: false
        },
        parameters: [
          {
            name: 'someDate',
            type: 'string',
            format: 'date',
            paramType: 'path'
          },
          {
            name: 'someNumber',
            type: 'number',
            format: 'float',
            paramType: 'path'
          }
        ]
      };
      var someDate = '2014-08-12';
      var someNumber = '123.01';
      var req = {
        params: {
          someDate: someDate,
          someNumber: someNumber
        }
      };
      var ret = validateRequest(spec, req);
      assertValidationPassed(ret);
      expect(req.params.someDate).to.eql(someDate);
      expect(req.params.someNumber).to.equal(someNumber);
    });
  });

  it('should validate a path parameter using the embedded schema, when one is available', () => {
    const requestSchema = {
      description: 'A mock endpoint',
      path: '/some-endpoint/{someParameter}',
      method: 'POST',
      parameters: [
        {
          in: 'path',
          name: 'someParameter',
          schema: {
            type: 'string'
          },
          required: true
        }
      ],
    };

    const req = {
      params: {
        someParameter: 'ABC'
      }
    };

    let result = validateRequest(requestSchema, req);
    assertValidationPassed(result);

    req.params.someParameter = null;
    result = validateRequest(requestSchema, req);
    assertValidationFailed(result, ['someParameter is required']);

    req.params.someParameter = 1;
    result = validateRequest(requestSchema, req);
    assertValidationFailed(result, ['someParameter is not a type of string']);
  });
});
