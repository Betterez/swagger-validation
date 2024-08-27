const moment = require("moment");
const chai = require("chai");
const expect = chai.expect;
const {validateAgainstSchema} = require("../lib/validation/validateAgainstSchema");
const helper = require("./test_helper");
const someDate = "2014-08-12";
const someDateTransformed = moment(someDate).toDate();
const someString = "blah blah";
const models = {
  SomeModel: {
    id: "SomeModel",
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
    id: "NestedModel",
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
      helper.validateError(ret, 1, ["someDate is required"]);
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
      helper.validateSuccess(ret, 0);

      expect(object.someModel.someDate).to.eql(someDateTransformed);
      expect(object.someModel.someString).to.equal(someString);
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
      helper.validateSuccess(ret, 0);

      expect(object.someModel.someDate).to.eql(someDateTransformed);
      expect(object.someModel.nestedModel.anotherDate).to.eql(someDateTransformed);
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
      helper.validateError(ret, 1, ["someDate is not valid based on the pattern for moment.ISO 8601"]);
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
    helper.validateSuccess(ret, 0);
    expect(object.someDate).to.eql(someDateTransformed);
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
    helper.validateSuccess(ret, 0);

    expect(object.someDate).to.eql(someDate);
  });
});
