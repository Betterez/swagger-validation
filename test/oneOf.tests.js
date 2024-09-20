const {expect} = require('chai');
const {validateParameter} = require('../lib/validation/parameter');
const {ValidationContext} = require('../lib/validation/validationContext');
const {getValidationSettings} = require('../lib/validation/validationSettings');
const {assertValidationFailed} = require("./test_helper");

describe('oneOf', function () {
  describe('basic tests', function () {
    let models = {
      Test: {
        type: 'object',
        properties: {
          id: {
            oneOf: [
              {type: 'number'}
            ]
          }
        }
      }
    };
    let schema = {};
    let validationContext;
    let validationSettings;

    beforeEach(() => {
      schema = {
        oneOf: [
          {type: 'string', example: 'reservation'},
          {type: 'number', example: 1},
          {type: 'boolean', example: true}
        ],
        description: 'The value to compare the fact against',
        name: 'value',
        required: true
      };
      validationContext = new ValidationContext();
      validationSettings = getValidationSettings();
    });

    it('should fail validation and return all errors if the value does not match any of the schemas', function () {
      const validationResults = validateParameter({
        schema,
        value: {},
        models,
        validationContext,
        validationSettings
      });
      assertValidationFailed(validationResults, ['value is not a type of string', 'value is not a type of number', 'value is not a type of boolean']);
    });

    it('should return all errors because is wrong type', function () {
      schema.required = false;
      var value = [{}];
      var ret = validateParameter({schema, value, models, validationContext, validationSettings});
      expect(ret).to.be.an('array');
      expect(ret).to.have.length(3);
    });

    it('should return all errors because is required and wrong type', function () {
      var value = [{}];
      var ret = validateParameter({schema, value, models, validationContext, validationSettings});
      expect(ret).to.be.an('array');
      expect(ret).to.have.length(3);
    });

    it('should return all errors because is required and empty string', function () {
      var value = "";
      var ret = validateParameter({schema, value, models, validationContext, validationSettings});
      expect(ret).to.be.an('array');
      expect(ret).to.have.length(3);
    });

    it('should return success because value is integer', function () {
      var value = 0;
      var ret = validateParameter({schema, value, models, validationContext, validationSettings});
      expect(ret).to.be.an('array');
      expect(ret).to.have.length(1);
    });

    it('should return success because value is integer', function () {
      var value = 0;
      var ret = validateParameter({schema, value, models, validationContext, validationSettings});
      expect(ret).to.be.an('array');
      expect(ret).to.have.length(1);
    });

    it('should return success because value is string', function () {
      var value = "hi";
      var ret = validateParameter({schema, value, models, validationContext, validationSettings});
      expect(ret).to.be.an('array');
      expect(ret).to.have.length(1);
    });

    it('should return success because value is boolean', function () {
      var value = false;
      var ret = validateParameter({schema, value, models, validationContext, validationSettings});
      expect(ret).to.be.an('array');
      expect(ret).to.have.length(1);
    });
  });
});
