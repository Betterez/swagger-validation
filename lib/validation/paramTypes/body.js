const _ = require('lodash');
const helper = require('./helper');
const {validateParameter} = require("../parameter");

/**
 * Validates the body of the <tt>req</tt> that called validation.
 *
 * @memberOf Validation.ParamTypes
 * @method Validate_Body
 * @param {Object} schema The Swagger param that was created for this operation
 * @param {Object} req The request that this is validating
 * @param {Object} [models] Optionally, the models that are defined as part of this Swagger API definition
 * @param {Object} validationSettings The validation object that is defined as part of this Swagger API definition
 * @returns {Array} An empty Array if the <tt>value</tt> was "nothing" and not required, else an array
 * containing an object with either an error property (which contains an Array of Error objects)
 * or a value property that contains the value, parsed successfully if validation knows how, else the value unmodified.
 */
function validateRequestBody(schema, req, models, validationSettings) {
  const bodyContainsParameter = _.has(req.body, schema.name);
  var value = bodyContainsParameter ? req.body[schema.name] : _.isEmpty(req.body) ? undefined : req.body ;
  var ret = validateParameter(schema, value, models);

  if (!_.some(ret, function(val) { return val.hasOwnProperty('error'); })) {
    if (validationSettings.replaceValues) {
       if (bodyContainsParameter){
         req.body[schema.name] = helper.getValue(schema, ret);
       }
       else{
         req.body = helper.getValue(schema, ret);
       }
    }
  }

  return ret;
}

module.exports = {
  validateRequestBody
};
