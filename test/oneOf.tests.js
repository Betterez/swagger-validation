
var validate = require('../lib/validation/parameter');

describe.only('oneOF', function() {
  const {expect} = require("chai");
  describe('basic tests', function() {
    var model = {
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
    let param = {};
    beforeEach(() => {
      param = {
        oneOf: [
          { type: 'string', example: 'reservation' },
          { type: 'number', example: 1 },
          { type: 'boolean', example: true }
        ],
        description: 'The value to compare the fact against',
        name: 'value',
        required: true
      };
    });

    it('should return all errors because is required and not given', function() {
      var value = null;
      var ret = validate(param, value, model);
      expect(ret).to.be.an('array');
      expect(ret).to.have.length(3);
    });

    it('should return all errors because is wrong type', function() {
      param.required = false;
      var value = [{}];
      var ret = validate(param, value, model);
      expect(ret).to.be.an('array');
      expect(ret).to.have.length(3);
    });

    it('should return all errors because is required and wrong type', function() {
      var value = [{}];
      var ret = validate(param, value, model);
      expect(ret).to.be.an('array');
      expect(ret).to.have.length(3);
    });

    it('should return all errors because is required and empty string', function() {
      var value = "";
      var ret = validate(param, value, model);
      expect(ret).to.be.an('array');
      expect(ret).to.have.length(3);
    });

    it('should return success because value is integer', function() {
      var value = 0;
      var ret = validate(param, value, model);
      expect(ret).to.be.an('array');
      expect(ret).to.have.length(1);
    });

    it('should return success because value is integer', function() {
      var value = 0;
      var ret = validate(param, value, model);
      expect(ret).to.be.an('array');
      expect(ret).to.have.length(1);
    });
    
    it('should return success because value is string', function() {
      var value = "hi";
      var ret = validate(param, value, model);
      expect(ret).to.be.an('array');
      expect(ret).to.have.length(1);
    });

    it('should return success because value is boolean', function() {
      var value = false;
      var ret = validate(param, value, model);
      expect(ret).to.be.an('array');
      expect(ret).to.have.length(1);
    });
  });
});