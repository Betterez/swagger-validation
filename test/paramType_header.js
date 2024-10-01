const moment = require('moment');
const {expect} = require('chai');
const {validateRequest} = require('../lib/validation/validateRequest');
const helper = require('./test_helper');
const {expectValidationPassed, expectValidationFailed} = helper;

describe('paramType - header', function () {
  describe('with models', function () {
    it('should convert strings', function () {
      var spec = {
        parameters: [
          {
            name: 'someModel',
            $ref: 'SomeModel',
            in: 'header'
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
        header: {
          someModel: {
            someDate: someDate,
            someString: someString
          }
        }
      };
      var ret = validateRequest(spec, req, models);
      expectValidationPassed(ret);
      expect(req.header.someModel.someDate).to.eql(someDateTransformed);
      expect(req.header.someModel.someString).to.equal(someString);
    });

    it('should handle nested models when converting strings', function () {
      var spec = {
        parameters: [
          {
            name: 'someModel',
            $ref: 'SomeModel',
            in: 'header'
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
        header: {
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
      expect(req.header.someModel.someDate).to.eql(someDateTransformed);
      expect(req.header.someModel.nestedModel.anotherDate).to.eql(someDateTransformed);
    });

    it('should return validation errors', function () {
      var spec = {
        parameters: [
          {
            name: 'someModel',
            $ref: 'SomeModel',
            in: 'header'
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
        header: {
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
            in: 'header'
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
        header: {
          someModel: {
            someDate: someDate,
            someString: someString
          }
        }
      };
      var ret = validateRequest(spec, req, models);
      expectValidationPassed(ret);
      expect(req.header.someModel.someDate).to.eql(someDateTransformed);
      expect(req.header.someModel.someString).to.equal(someString);
    });

    it('should handle nested models when converting strings', function () {
      var spec = {
        parameters: [
          {
            name: 'someModel',
            $ref: 'SomeModel',
            in: 'header'
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
        header: {
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
      expect(req.header.someModel.someDate).to.eql(someDateTransformed);
      expect(req.header.someModel.nestedModel.anotherDate).to.eql(someDateTransformed);
    });

    it('should return validation errors', function () {
      var spec = {
        parameters: [
          {
            name: 'someModel',
            $ref: 'SomeModel',
            in: 'header'
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
        header: {
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

  describe('without models', function () {
    it('should validate spec and convert strings', function () {
      var spec = {
        parameters: [
          {
            name: 'someDate',
            type: 'string',
            format: 'date',
            in: 'header'
          }
        ]
      };
      var someDate = '2014-08-12';
      var someDateTransformed = moment('2014-08-12').toDate();
      var req = {
        header: {
          someDate: someDate
        }
      };
      var ret = validateRequest(spec, req);
      expectValidationPassed(ret);
      expect(req.header.someDate).to.eql(someDateTransformed);
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
            in: 'header'
          }
        ]
      };
      var someDate = '2014-08-12';
      var req = {
        header: {
          someDate: someDate
        }
      };
      var ret = validateRequest(spec, req);
      expectValidationPassed(ret);
      expect(req.header.someDate).to.eql(someDate);
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
            in: 'header'
          }
        ]
      };
      var someDate = '2014-08-12';
      var someDateTransformed = moment('2014-08-12').toDate();
      var req = {
        header: {
          someDate: someDate
        }
      };
      var ret = validateRequest(spec, req);
      expectValidationPassed(ret);
      expect(req.header.someDate).to.eql(someDateTransformed);
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
            in: 'header'
          }
        ]
      };
      var someDate = '2014-08-12';
      var req = {
        header: {
          someDate: someDate
        }
      };
      var ret = validateRequest(spec, req);
      expectValidationPassed(ret);
      expect(req.header.someDate).to.eql(someDate);
    });
  });

  it('should validate a header parameter using the embedded schema, when one is available', () => {
    const requestSchema = {
      description: 'A mock endpoint',
      path: '/some-endpoint',
      method: 'POST',
      parameters: [
        {
          in: 'header',
          name: 'x-some-header',
          schema: {
            type: 'string'
          },
          required: true
        }
      ],
    };

    const req = {
      header: {
        'x-some-header': 'ABC'
      }
    };

    let result = validateRequest(requestSchema, req);
    expectValidationPassed(result);

    req.header['x-some-header'] = null;
    result = validateRequest(requestSchema, req);
    expectValidationFailed(result, ['x-some-header is required']);

    req.header['x-some-header'] = 1;
    result = validateRequest(requestSchema, req);
    expectValidationFailed(result, ['x-some-header is not a type of string']);
  });

  it('should apply a default value if a header parameter is not provided, and a default value is specified for the parameter', function () {
    const requestSchema = {
      description: 'A mock endpoint',
      path: '/some-endpoint',
      method: 'POST',
      parameters: [
        {
          in: 'header',
          name: 'x-some-header',
          schema: {
            type: 'string'
          },
          defaultValue: 'someDefaultValue'
        }
      ],
    };

    const req = {
      header: {}
    };

    const result = validateRequest(requestSchema, req);
    expectValidationPassed(result);

    expect(req.header['x-some-header']).to.eql('someDefaultValue');
  });

  it('should allow an optional header parameter to be omitted from the request', () => {
    const spec = {
      parameters: [
        {
          in: 'header',
          name: 'x-some-header',
          schema: {
            type: 'string'
          },
          required: false
        },
      ]
    };

    const req = {
      header: {}
    };
    const validationResults = validateRequest(spec, req);
    expectValidationPassed(validationResults);
  });

  it('should fail validation when a header parameter is required, but no value is present in the request', function () {
    const spec = {
      parameters: [
        {
          in: 'header',
          name: 'x-some-header',
          schema: {
            type: 'string'
          },
          required: true
        }
      ]
    };

    const req = {
      header: {}
    };
    const validationResults = validateRequest(spec, req);
    expectValidationFailed(validationResults, ['x-some-header is required']);
  });
});
