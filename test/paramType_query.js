const moment = require('moment');
const {expect} = require('chai');
const {validateRequest} = require('../lib/validation/validateRequest');
const helper = require('./test_helper');
const {assertValidationPassed, assertValidationFailed} = helper;

describe('paramType - query', function () {
  describe('without models', function () {
    it('should convert strings', function () {
      var spec = {
        parameters: [
          {
            name: 'someDate',
            type: 'string',
            format: 'date',
            in: 'query'
          },
          {
            name: 'someNumber',
            type: 'number',
            format: 'float',
            in: 'query'
          }
        ]
      };

      var someDate = '2014-08-12';
      var someNumber = '123.01';
      var someDateTransformed = moment('2014-08-12').toDate();
      var someNumberTransformed = 123.01;
      var req = {
        query: {
          someDate: someDate,
          someNumber: someNumber
        }
      };
      var ret = validateRequest(spec, req);
      assertValidationPassed(ret);
      expect(req.query.someDate).to.eql(someDateTransformed);
      expect(req.query.someNumber).to.equal(someNumberTransformed);
    });

    it('should apply a default value to strings', function () {
      var spec = {
        parameters: [
          {
            name: 'someDate',
            type: 'string',
            format: 'date',
            defaultValue: '2014-11-23',
            in: 'query'
          },
          {
            name: 'someNumber',
            type: 'number',
            defaultValue: '233.2354',
            format: 'float',
            in: 'query'
          }
        ]
      };

      var req = {
        query: {}
      };
      var ret = validateRequest(spec, req);
      assertValidationPassed(ret);
      expect(req.query.someDate).to.eql('2014-11-23');
      expect(req.query.someNumber).to.equal('233.2354');
    });

    it('should not convert strings with date format to Date object', function () {
      var spec = {
        validation: {
          replaceValues: false
        },
        parameters: [
          {
            name: 'someDate',
            type: 'string',
            format: 'date',
            in: 'query'
          },
          {
            name: 'someNumber',
            type: 'number',
            format: 'float',
            in: 'query'
          }
        ]
      };

      var someDate = '2014-08-12';
      var someNumber = '123.01';
      var req = {
        query: {
          someDate: someDate,
          someNumber: someNumber
        }
      };
      var ret = validateRequest(spec, req);
      assertValidationPassed(ret);
      expect(req.query.someDate).to.eql(someDate);
      expect(req.query.someNumber).to.equal(someNumber);
    });

    it('should return validation errors if string pattern does not match', function () {
      var spec = {
        parameters: [
          {
            name: 'someString',
            type: 'string',
            in: 'query',
            pattern: '/^hi/i'
          }
        ]
      };
      var req = {
        query: {
          someString: 'nothi'
        }
      };
      var ret = validateRequest(spec, req);
      assertValidationFailed(ret, ["someString is not valid based on the pattern /^hi/i"]);
    });
  });

  describe('without models - without paramType', function () {
    it('should convert strings', function () {
      var spec = {
        parameters: [
          {
            name: 'someDate',
            type: 'string',
            format: 'date',
            in: 'query'
          },
          {
            name: 'someNumber',
            type: 'number',
            format: 'float',
            in: 'query'
          }
        ]
      };

      var someDate = '2014-08-12';
      var someNumber = '123.01';
      var someDateTransformed = moment('2014-08-12').toDate();
      var someNumberTransformed = 123.01;
      var req = {
        query: {
          someDate: someDate,
          someNumber: someNumber
        }
      };
      var ret = validateRequest(spec, req);
      assertValidationPassed(ret);
      expect(req.query.someDate).to.eql(someDateTransformed);
      expect(req.query.someNumber).to.equal(someNumberTransformed);
    });

    it('should apply a default value to strings', function () {
      var spec = {
        parameters: [
          {
            name: 'someDate',
            type: 'string',
            format: 'date',
            defaultValue: '2014-11-23',
            in: 'query'
          },
          {
            name: 'someNumber',
            type: 'number',
            defaultValue: '233.2354',
            format: 'float',
            in: 'query'
          }
        ]
      };

      var req = {
        query: {}
      };
      var ret = validateRequest(spec, req);
      assertValidationPassed(ret);
      expect(req.query.someDate).to.eql("2014-11-23");
      expect(req.query.someNumber).to.equal("233.2354");
    });

    it('should allow an optional query parameter to be omitted from the request', () => {
      const spec = {
        parameters: [
          {
            name: 'someQueryParameter',
            type: 'string',
            in: 'query',
            required: false
          },
        ]
      };

      const req = {
        query: {}
      };
      const validationResults = validateRequest(spec, req);
      assertValidationPassed(validationResults);
    });

    it('should fail validation when a query parameter is required, but no value is present in the request', function () {
      const spec = {
        parameters: [
          {
            name: 'someQueryParameter',
            type: 'string',
            in: 'query',
            required: true
          },
        ]
      };

      const req = {
        query: {}
      };
      const validationResults = validateRequest(spec, req);
      assertValidationFailed(validationResults, ['someQueryParameter is required']);
    });

    it('should not convert strings with date format to Date object', function () {
      var spec = {
        validation: {
          replaceValues: false
        },
        parameters: [
          {
            name: 'someDate',
            type: 'string',
            format: 'date',
            in: 'query'
          },
          {
            name: 'someNumber',
            type: 'number',
            format: 'float',
            in: 'query'
          }
        ]
      };

      var someDate = '2014-08-12';
      var someNumber = '123.01';
      var req = {
        query: {
          someDate: someDate,
          someNumber: someNumber
        }
      };
      var ret = validateRequest(spec, req);
      assertValidationPassed(ret);
      expect(req.query.someDate).to.eql(someDate);
      expect(req.query.someNumber).to.equal(someNumber);
    });

    it('should return validation errors if string pattern does not match', function () {
      var spec = {
        parameters: [
          {
            name: 'someString',
            type: 'string',
            in: 'query',
            pattern: '/^hi/i'
          }
        ]
      };
      var req = {
        query: {
          someString: 'nothi'
        }
      };
      var ret = validateRequest(spec, req);
      assertValidationFailed(ret, ["someString is not valid based on the pattern /^hi/i"]);
    });
  });

  it('should validate a query parameter using the embedded schema, when one is available', () => {
    const requestSchema = {
      description: 'A mock endpoint',
      path: '/some-endpoint',
      method: 'POST',
      parameters: [
        {
          in: 'query',
          name: 'someParameter',
          schema: {
            type: 'string'
          },
          required: true
        }
      ],
    };

    const req = {
      query: {
        someParameter: 'ABC'
      }
    };

    let result = validateRequest(requestSchema, req);
    assertValidationPassed(result);

    req.query.someParameter = null;
    result = validateRequest(requestSchema, req);
    assertValidationFailed(result, ['someParameter is required']);

    req.query.someParameter = 1;
    result = validateRequest(requestSchema, req);
    assertValidationFailed(result, ['someParameter is not a type of string']);
  });
});
