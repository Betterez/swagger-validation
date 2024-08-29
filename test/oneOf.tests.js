const {expect} = require('chai');
const {validateParameter} = require('../lib/validation/parameter');
const {ValidationContext} = require('../lib/validation/validationContext');
const {getValidationSettings} = require('../lib/validation/validationSettings');

describe('oneOf', function () {
  describe('basic tests', function () {
    let models = {
      Test: {
        id: 'Test',
        name: 'Test',
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

    it('should return all errors because is required and not given', function () {
      var value = null;
      var ret = validateParameter({schema, value, models, validationContext, validationSettings});
      expect(ret).to.be.an('array');
      expect(ret).to.have.length(3);
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
