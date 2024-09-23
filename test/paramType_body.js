const moment = require('moment');
const {expect} = require('chai');
const {validateRequest} = require('../lib/validation/validateRequest');
const helper = require('./test_helper');
const {assertValidationPassed, assertValidationFailed} = helper;

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
    assertValidationPassed(result);

    req.body.someProperty = null;
    result = validateRequest(requestSchema, req, models);
    assertValidationFailed(result, ['someProperty is required']);
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
    assertValidationPassed(result);

    req.body.someProperty = null;
    result = validateRequest(requestSchema, req);
    assertValidationFailed(result, ['someProperty is required']);
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
      assertValidationPassed(ret);
      expect(req.body.someModel.someDate).to.eql(someDateTransformed);
      expect(req.body.someModel.someString).to.equal(someString);
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
      assertValidationPassed(ret);
      expect(req.body.someModel.someDate).to.eql(someDateTransformed);
      expect(req.body.someModel.nestedModel.anotherDate).to.eql(someDateTransformed);
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
      assertValidationFailed(ret, ["someDate is not valid based on the pattern for moment.ISO 8601"]);
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
      assertValidationPassed(ret);
      expect(req.body.someModel.someDate).to.eql(someDateTransformed);
      expect(req.body.someModel.someString).to.equal(someString);
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
      assertValidationPassed(ret);
      expect(req.body.someModel.someDate).to.eql(someDateTransformed);
      expect(req.body.someModel.nestedModel.anotherDate).to.eql(someDateTransformed);
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
      assertValidationFailed(ret, ["someDate is not valid based on the pattern for moment.ISO 8601"]);
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
      assertValidationPassed(ret);
      expect(req.body.someDate).to.eql(someDateTransformed);
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
      assertValidationPassed(ret);
      expect(req.body.someDate).to.eql(someDate);
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
      assertValidationPassed(ret);
      expect(req.body.someDate).to.eql(someDateTransformed);
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
      assertValidationPassed(ret);
      expect(req.body.someDate).to.eql(someDate);
    });
  });
});
