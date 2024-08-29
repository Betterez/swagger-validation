const moment = require('moment');
const {expect} = require('chai');
const {validateRequest} = require('../lib/validation/validateRequest');
const helper = require('./test_helper');
const {assertValidationPassed, assertValidationFailed} = helper;

describe('paramType - header', function () {
  describe('with models', function () {
    it('should convert strings', function () {
      var spec = {
        parameters: [
          {
            name: 'someModel',
            $ref: 'SomeModel',
            paramType: 'header'
          }
        ]
      };
      var models = {
        SomeModel: {
          id: 'SomeModel',
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
      assertValidationPassed(ret);
      expect(req.header.someModel.someDate).to.eql(someDateTransformed);
      expect(req.header.someModel.someString).to.equal(someString);
    });

    it('should handle nested models when converting strings', function () {
      var spec = {
        parameters: [
          {
            name: 'someModel',
            $ref: 'SomeModel',
            paramType: 'header'
          }
        ]
      };
      var models = {
        SomeModel: {
          id: 'SomeModel',
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
          id: 'NestedModel',
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
      assertValidationPassed(ret);
      expect(req.header.someModel.someDate).to.eql(someDateTransformed);
      expect(req.header.someModel.nestedModel.anotherDate).to.eql(someDateTransformed);
    });

    it('should return validation errors', function () {
      var spec = {
        parameters: [
          {
            name: 'someModel',
            $ref: 'SomeModel',
            paramType: 'header'
          }
        ]
      };
      var models = {
        SomeModel: {
          id: 'SomeModel',
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
            in: 'header'
          }
        ]
      };
      var models = {
        SomeModel: {
          id: 'SomeModel',
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
      assertValidationPassed(ret);
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
          id: 'SomeModel',
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
          id: 'NestedModel',
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
      assertValidationPassed(ret);
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
          id: 'SomeModel',
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
      assertValidationPassed(ret);
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
            paramType: 'header'
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
      assertValidationPassed(ret);
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
      assertValidationPassed(ret);
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
      assertValidationPassed(ret);
      expect(req.header.someDate).to.eql(someDate);
    });
  });
});
