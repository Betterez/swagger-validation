const moment = require("moment");
const chai = require("chai");
const expect = chai.expect;
const {validateRequest} = require("../lib/validation/validate");
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

describe("paramType - rootObject", function () {
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

      const ret = validateRequest(spec, object, models);
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

      const ret = validateRequest(spec, object, models);
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

      const ret = validateRequest(spec, object, models);
      helper.validateSuccess(ret, 0);

      expect(object.someModel.someDate).to.eql(someDateTransformed);
      expect(object.someModel.nestedModel.anotherDate).to.eql(someDateTransformed);
    });

    it("should not run validation tests", function () {
      const models = {
        foo: {
          id: "foo",
          name: "foo",
          subTypes: ["bar"],
          discriminator: "name",
          required: ["number", "float", "double", "integer", "int32"],
          properties: {
            number: { type: "number" },
            float: { type: "number", format: "float" },
            double: { type: "number", format: "double" },
            integer: { type: "integer" },
            int32: { type: "integer", format: "int32" }
          }
        },
        bar: {
          id: "bar",
          name: "bar",
          subTypes: ["baz"],
          discriminator: "name",
          required: ["int64", "string", "byte", "date", "datetime"],
          properties: {
            int64: { type: "integer", format: "int64" },
            string: { type: "string" },
            byte: { type: "string", format: "byte" },
            date: { type: "string", format: "date" },
            datetime: { type: "string", format: "date-time" }
          }
        },
        baz: {
          id: "baz",
          name: "baz",
          required: ["boolean"],
          properties: {
            boolean: { type: "boolean" }
          }
        }
      };

      const spec = {
        validation: {
          enabled: false
        },
        properties: {
          baz: {
            type: "baz",
          }
        }
      };

      const object = {
        number: "Random String",
        float: true,
        double: [323.33],
        integer: {},
        int32: Number.MIN_VALUE,
        int64: Number.MAX_VALUE + Number.MAX_VALUE,
        string: 1,
        byte: false,
        date: Number(1),
        datetime: Number(2.2356),
        boolean: "Not a boolean"
      };

      const ret = validateRequest(spec, object, models);
      helper.validateSuccess(ret, 0);
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

      const ret = validateRequest(spec, object, models);
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
    const ret = validateRequest(spec, object);
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

    const ret = validateRequest(spec, object);
    helper.validateSuccess(ret, 0);

    expect(object.someDate).to.eql(someDate);
  });
});
