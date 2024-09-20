const moment = require('moment');
const {expect} = require('chai');
const {validateRequest} = require('../lib/validation/validateRequest');
const helper = require('./test_helper');
const {assertValidationPassed, assertValidationFailed} = helper;

describe('paramType - form', function () {
  describe('with models', function () {
    it('should convert strings', function () {
      var spec = {
        parameters: [
          {
            name: 'someModel',
            $ref: 'SomeModel',
            paramType: 'form'
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
        form: {
          someModel: {
            someDate: someDate,
            someString: someString
          }
        }
      };
      var ret = validateRequest(spec, req, models);
      assertValidationPassed(ret);
      expect(req.form.someModel.someDate).to.eql(someDateTransformed);
      expect(req.form.someModel.someString).to.equal(someString);
    });

    it('should handle nested models when converting strings', function () {
      var spec = {
        parameters: [
          {
            name: 'someModel',
            $ref: 'SomeModel',
            paramType: 'form'
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
        form: {
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
      expect(req.form.someModel.someDate).to.eql(someDateTransformed);
      expect(req.form.someModel.nestedModel.anotherDate).to.eql(someDateTransformed);
    });

    it('should return validation errors', function () {
      var spec = {
        parameters: [
          {
            name: 'someModel',
            $ref: 'SomeModel',
            paramType: 'form'
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
        form: {
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
            in: 'formData'
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
        form: {
          someModel: {
            someDate: someDate,
            someString: someString
          }
        }
      };
      var ret = validateRequest(spec, req, models);
      assertValidationPassed(ret);
      expect(req.form.someModel.someDate).to.eql(someDateTransformed);
      expect(req.form.someModel.someString).to.equal(someString);
    });

    it('should handle nested models when converting strings', function () {
      var spec = {
        parameters: [
          {
            name: 'someModel',
            $ref: 'SomeModel',
            in: 'formData'
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
        form: {
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
      expect(req.form.someModel.someDate).to.eql(someDateTransformed);
      expect(req.form.someModel.nestedModel.anotherDate).to.eql(someDateTransformed);
    });

    it('should return validation errors', function () {
      var spec = {
        parameters: [
          {
            name: 'someModel',
            $ref: 'SomeModel',
            in: 'formData'
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
        form: {
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

  describe('without models', function () {
    it('should validate spec and convert strings', function () {
      var spec = {
        parameters: [
          {
            name: 'someDate',
            type: 'string',
            format: 'date',
            paramType: 'form'
          }
        ]
      };
      var someDate = '2014-08-12';
      var someDateTransformed = moment('2014-08-12').toDate();
      var req = {
        form: {
          someDate: someDate
        }
      };
      var ret = validateRequest(spec, req);
      assertValidationPassed(ret);
      expect(req.form.someDate).to.eql(someDateTransformed);
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
            paramType: 'form'
          }
        ]
      };
      var someDate = '2014-08-12';
      var req = {
        form: {
          someDate: someDate
        }
      };
      var ret = validateRequest(spec, req);
      assertValidationPassed(ret);
      expect(req.form.someDate).to.eql(someDate);
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
            in: 'formData'
          }
        ]
      };
      var someDate = '2014-08-12';
      var someDateTransformed = moment('2014-08-12').toDate();
      var req = {
        form: {
          someDate: someDate
        }
      };
      var ret = validateRequest(spec, req);
      assertValidationPassed(ret);
      expect(req.form.someDate).to.eql(someDateTransformed);
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
            in: 'formData'
          }
        ]
      };
      var someDate = '2014-08-12';
      var req = {
        form: {
          someDate: someDate
        }
      };
      var ret = validateRequest(spec, req);
      assertValidationPassed(ret);
      expect(req.form.someDate).to.eql(someDate);
    });
  });

  it('should validate a form parameter using the embedded schema, when one is available', () => {
    const requestSchema = {
      description: 'A mock endpoint',
      path: '/some-endpoint',
      method: 'POST',
      parameters: [
        {
          in: 'form',
          name: 'someParameter',
          schema: {
            type: 'string'
          },
          required: true
        }
      ],
    };

    const req = {
      form: {
        someParameter: 'ABC'
      }
    };

    let result = validateRequest(requestSchema, req);
    assertValidationPassed(result);

    req.form.someParameter = null;
    result = validateRequest(requestSchema, req);
    assertValidationFailed(result, ['someParameter is required']);

    req.form.someParameter = 1;
    result = validateRequest(requestSchema, req);
    assertValidationFailed(result, ['someParameter is not a type of string']);
  });

  it('should apply a default value if a form parameter is not provided, and a default value is specified for the parameter', function () {
    const requestSchema = {
      description: 'A mock endpoint',
      path: '/some-endpoint',
      method: 'POST',
      parameters: [
        {
          in: 'form',
          name: 'someParameter',
          schema: {
            type: 'string'
          },
          defaultValue: 'someDefaultValue'
        }
      ],
    };

    const req = {
      form: {}
    };

    const result = validateRequest(requestSchema, req);
    assertValidationPassed(result);

    expect(req.form.someParameter).to.eql('someDefaultValue');
  });

  it('should allow an optional form parameter to be omitted from the request', () => {
    const spec = {
      parameters: [
        {
          in: 'form',
          name: 'someParameter',
          schema: {
            type: 'string'
          },
          required: false
        },
      ]
    };

    const req = {
      form: {}
    };
    const validationResults = validateRequest(spec, req);
    assertValidationPassed(validationResults);
  });

  it('should fail validation when a form parameter is required, but no value is present in the request', function () {
    const spec = {
      parameters: [
        {
          in: 'form',
          name: 'someParameter',
          schema: {
            type: 'string'
          },
          required: true
        }
      ]
    };

    const req = {
      form: {}
    };
    const validationResults = validateRequest(spec, req);
    assertValidationFailed(validationResults, ['someParameter is required']);
  });
});
