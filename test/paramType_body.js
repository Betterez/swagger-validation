const {describe, it, before, after, beforeEach, afterEach} = require('node:test');
const moment = require('moment');
const assert = require('node:assert/strict');
const {validateRequest} = require('../lib/validation/validateRequest');
const helper = require('./test_helper');
const {expectValidationPassed, expectValidationFailed} = helper;

describe('paramType - body', function () {
  it('should validate a body parameter using the "type" of the body parameter as if it was a "$ref" pointing to another model (legacy behaviour)', () => {
    const requestSchema = {
      description: 'A mock endpoint',
      path: '/some-endpoint',
      method: 'POST',
      parameters: [
        {
          in: 'body',
          name: 'someParameter',
          type: 'SchemaForBody',
          required: true
        }
      ],
    };

    const models = {
      SchemaForBody: {
        type: 'object',
        required: ['someProperty'],
        properties: {
          someProperty: {
            type: 'string'
          }
        }
      }
    };

    const req = {
      body: {
        someProperty: 'ABC'
      }
    };

    let result = validateRequest(requestSchema, req, models);
    expectValidationPassed(result);

    req.body.someProperty = null;
    result = validateRequest(requestSchema, req, models);
    expectValidationFailed(result, ['someProperty is required']);
  });

  it('should validate a body parameter using the embedded schema, when one is available', () => {
    const requestSchema = {
      description: 'A mock endpoint',
      path: '/some-endpoint',
      method: 'POST',
      parameters: [
        {
          in: 'body',
          name: 'someParameter',
          schema: {
            type: 'object',
            required: ['someProperty'],
            properties: {
              someProperty: {
                type: 'string'
              }
            }
          },
          required: true
        }
      ],
    };

    const req = {
      body: {
        someProperty: 'ABC'
      }
    };

    let result = validateRequest(requestSchema, req);
    expectValidationPassed(result);

    req.body.someProperty = null;
    result = validateRequest(requestSchema, req);
    expectValidationFailed(result, ['someProperty is required']);
  });

  describe('with models', function () {
    it('should convert strings', function () {
      var spec = {
        parameters: [
          {
            name: 'someModel',
            $ref: 'SomeModel',
            in: 'body'
          }
        ]
      };
      var models = {
        SomeModel: {
          type: 'object',
          properties: {
            someDate: {
              type: 'string',
              format: 'date'
            },
            someString: {
              type: 'string'
            }
          }
        }
      };
      var someDate = '2014-08-12';
      var someString = 'blah blah';
      var someDateTransformed = moment('2014-08-12').toDate();
      var req = {
        body: {
          someModel: {
            someDate: someDate,
            someString: someString
          }
        }
      };
      var ret = validateRequest(spec, req, models);
      expectValidationPassed(ret);
      assert.deepStrictEqual(req.body.someModel.someDate, someDateTransformed);
      assert.strictEqual(req.body.someModel.someString, someString);
    });

    it('should handle nested models when converting strings', function () {
      var spec = {
        parameters: [
          {
            name: 'someModel',
            $ref: 'SomeModel',
            in: 'body'
          }
        ]
      };
      var models = {
        SomeModel: {
          type: 'object',
          properties: {
            someDate: {
              type: 'string',
              format: 'date'
            },
            nestedModel: {
              $ref: 'NestedModel'
            }
          }
        },
        NestedModel: {
          type: 'object',
          properties: {
            anotherDate: {
              type: 'string',
              format: 'date'
            }
          }
        }
      };
      var someDate = '2014-08-12';
      var someDateTransformed = moment('2014-08-12').toDate();
      var req = {
        body: {
          someModel: {
            someDate: someDate,
            nestedModel: {
              anotherDate: someDate
            }
          }
        }
      };
      var ret = validateRequest(spec, req, models);
      expectValidationPassed(ret);
      assert.deepStrictEqual(req.body.someModel.someDate, someDateTransformed);
      assert.deepStrictEqual(req.body.someModel.nestedModel.anotherDate, someDateTransformed);
    });

    it('should return validation errors', function () {
      var spec = {
        parameters: [
          {
            name: 'someModel',
            $ref: 'SomeModel',
            in: 'body'
          }
        ]
      };
      var models = {
        SomeModel: {
          type: 'object',
          properties: {
            someDate: {
              type: 'string',
              format: 'date'
            },
            someString: {
              type: 'string'
            }
          }
        }
      };
      var req = {
        body: {
          someModel: {
            someDate: 'not a real date',
            someString: 'blah blah'
          }
        }
      };
      var ret = validateRequest(spec, req, models);
      expectValidationFailed(ret, ["someDate is not valid based on the pattern for moment.ISO 8601"]);
    });
  });

  describe('with models - without paramType', function () {
    it('should convert strings', function () {
      var spec = {
        parameters: [
          {
            name: 'someModel',
            $ref: 'SomeModel',
            in: 'body'
          }
        ]
      };
      var models = {
        SomeModel: {
          type: 'object',
          properties: {
            someDate: {
              type: 'string',
              format: 'date'
            },
            someString: {
              type: 'string'
            }
          }
        }
      };
      var someDate = '2014-08-12';
      var someString = 'blah blah';
      var someDateTransformed = moment('2014-08-12').toDate();
      var req = {
        body: {
          someModel: {
            someDate: someDate,
            someString: someString
          }
        }
      };
      var ret = validateRequest(spec, req, models);
      expectValidationPassed(ret);
      assert.deepStrictEqual(req.body.someModel.someDate, someDateTransformed);
      assert.strictEqual(req.body.someModel.someString, someString);
    });

    it('should handle nested models when converting strings', function () {
      var spec = {
        parameters: [
          {
            name: 'someModel',
            $ref: 'SomeModel',
            in: 'body'
          }
        ]
      };
      var models = {
        SomeModel: {
          type: 'object',
          properties: {
            someDate: {
              type: 'string',
              format: 'date'
            },
            nestedModel: {
              $ref: 'NestedModel'
            }
          }
        },
        NestedModel: {
          type: 'object',
          properties: {
            anotherDate: {
              type: 'string',
              format: 'date'
            }
          }
        }
      };
      var someDate = '2014-08-12';
      var someDateTransformed = moment('2014-08-12').toDate();
      var req = {
        body: {
          someModel: {
            someDate: someDate,
            nestedModel: {
              anotherDate: someDate
            }
          }
        }
      };
      var ret = validateRequest(spec, req, models);
      expectValidationPassed(ret);
      assert.deepStrictEqual(req.body.someModel.someDate, someDateTransformed);
      assert.deepStrictEqual(req.body.someModel.nestedModel.anotherDate, someDateTransformed);
    });

    it('should return validation errors', function () {
      var spec = {
        parameters: [
          {
            name: 'someModel',
            $ref: 'SomeModel',
            in: 'body'
          }
        ]
      };
      var models = {
        SomeModel: {
          type: 'object',
          properties: {
            someDate: {
              type: 'string',
              format: 'date'
            },
            someString: {
              type: 'string'
            }
          }
        }
      };
      var req = {
        body: {
          someModel: {
            someDate: 'not a real date',
            someString: 'blah blah'
          }
        }
      };
      var ret = validateRequest(spec, req, models);
      expectValidationFailed(ret, ["someDate is not valid based on the pattern for moment.ISO 8601"]);
    });
  });

  describe('without models - without paramType', function () {
    it('should validate spec and convert strings', function () {
      var spec = {
        parameters: [
          {
            name: 'someDate',
            type: 'string',
            format: 'date',
            in: 'body'
          }
        ]
      };
      var someDate = '2014-08-12';
      var someDateTransformed = moment('2014-08-12').toDate();
      var req = {
        body: {
          "someDate": someDate
        }
      };
      var ret = validateRequest(spec, req);
      expectValidationPassed(ret);
      assert.deepStrictEqual(req.body.someDate, someDateTransformed);
    });

    it('should validate spec and not convert strings', function () {
      var spec = {
        validation: {
          replaceValues: false
        },
        parameters: [
          {
            name: 'someDate',
            type: 'string',
            format: 'date',
            in: 'body'
          }
        ]
      };
      var someDate = '2014-08-12';
      var req = {
        body: {someDate: someDate}
      };
      var ret = validateRequest(spec, req);
      expectValidationPassed(ret);
      assert.deepStrictEqual(req.body.someDate, someDate);
    });
  });

  describe('without models', function () {
    it('should validate spec and convert strings', function () {
      var spec = {
        parameters: [
          {
            name: 'someDate',
            type: 'string',
            format: 'date',
            in: 'body'
          }
        ]
      };
      var someDate = '2014-08-12';
      var someDateTransformed = moment('2014-08-12').toDate();
      var req = {
        body: {
          "someDate": someDate
        }
      };
      var ret = validateRequest(spec, req);
      expectValidationPassed(ret);
      assert.deepStrictEqual(req.body.someDate, someDateTransformed);
    });

    it('should validate spec and not convert strings', function () {
      var spec = {
        validation: {
          replaceValues: false
        },
        parameters: [
          {
            name: 'someDate',
            type: 'string',
            format: 'date',
            in: 'body'
          }
        ]
      };
      var someDate = '2014-08-12';
      var req = {
        body: {someDate: someDate}
      };
      var ret = validateRequest(spec, req);
      expectValidationPassed(ret);
      assert.deepStrictEqual(req.body.someDate, someDate);
    });
  });
});
