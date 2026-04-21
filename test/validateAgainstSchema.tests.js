const {describe, it, before, after, beforeEach, afterEach} = require('node:test');
const moment = require('moment');
const assert = require('node:assert/strict');
const {validateAgainstSchema} = require('../lib/validation/validateAgainstSchema');
const {expectValidationPassed, expectValidationFailed} = require('./test_helper');;

const someDate = "2014-08-12";
const someDateTransformed = moment(someDate).toDate();
const someString = "blah blah";
const models = {
  SomeModel: {
    type: 'object',
    required: ["someDate"],
    properties: {
      someDate: {
        type: "string",
        format: "date"
      },
      someString: {
        type: "string"
      },
      nestedModel: {
        type: "NestedModel"
      }
    }
  },
  NestedModel: {
    type: 'object',
    properties: {
      anotherDate: {
        type: "string",
        format: "date"
      }
    }
  }
};

describe("validateAgainstSchema()", function () {
  describe("with models", function () {
    it("should validate required properties", function () {
      const spec = {
        properties: {
          someModel: {
            type: "SomeModel",
          }
        }
      };

      const object = {
        someModel: {
          someString
        }
      };

      const ret = validateAgainstSchema(spec, object, models);
      expectValidationFailed(ret, ["someDate is required"]);
    });

    it("should convert strings", function () {
      const spec = {
        properties: {
          someModel: {
            type: "SomeModel",
          }
        }
      };

      const object = {
        someModel: {
          someDate,
          someString
        }
      };

      const ret = validateAgainstSchema(spec, object, models);
      expectValidationPassed(ret);

      assert.deepStrictEqual(object.someModel.someDate, someDateTransformed);
      assert.strictEqual(object.someModel.someString, someString);
    });

    it("should handle nested models when converting strings", function () {
      const spec = {
        properties: {
          someModel: {
            type: "SomeModel",
          }
        }
      };

      const object = {
        someModel: {
          someDate,
          nestedModel: {
            anotherDate: someDate
          }
        }
      };

      const ret = validateAgainstSchema(spec, object, models);
      expectValidationPassed(ret);

      assert.deepStrictEqual(object.someModel.someDate, someDateTransformed);
      assert.deepStrictEqual(object.someModel.nestedModel.anotherDate, someDateTransformed);
    });

    it("should return validation errors", function () {
      const spec = {
        properties: {
          someModel: {
            type: "SomeModel",
          }
        }
      };

      const object = {
        someModel: {
          someDate: "not a real date",
          someString: "blah blah"
        }
      };

      const ret = validateAgainstSchema(spec, object, models);
      expectValidationFailed(ret, ["someDate is not valid based on the pattern for moment.ISO 8601"]);
    });
  });
});

describe("without models", function () {
  it("should validate spec and convert strings", function () {
    const spec = {
      properties: {
        someDate: {
          type: "string",
          format: "date",
        }
      }
    };
    const object = {
      someDate
    };
    const ret = validateAgainstSchema(spec, object);
    expectValidationPassed(ret);
    assert.deepStrictEqual(object.someDate, someDateTransformed);
  });

  it("should validate spec and not convert strings", function () {
    const spec = {
      validation: {
        replaceValues: false
      },
      properties: {
        someDate: {
          type: "string",
          format: "date",
        }
      }
    };

    const object = {
      someDate
    };

    const ret = validateAgainstSchema(spec, object);
    expectValidationPassed(ret);

    assert.deepStrictEqual(object.someDate, someDate);
  });
});
