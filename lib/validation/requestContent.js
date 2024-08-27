const requestValidators = require('./requestParameters');

/**
 * Ensures that the <tt>req</tt> that is passed in on the req is valid based upon the Swagger definition for this operation.
 * @memberOf Validation
 * @method Validate_Request_Content
 * @param {Object} parameterSpec The Swagger spec that was created for this operation
 * @param {Object} req The request that this is validating
 * @param {Object} [models] Optionally, the models that are defined as part of this Swagger API definition
 * @param {Object} validationSettings The validation settings that were defined in the Swagger API definition
 * @returns {Array} An empty Array if the <tt>value</tt> was "nothing" and not required, else an array
 * containing an object with either an error property (which contains an Array of Error objects)
 * or a value property that contains the value, parsed successfully if validation knows how, else the value unmodified.
 */
function validateRequestParameter(parameterSpec, req, models, validationSettings, key) {
  switch ((parameterSpec.paramType || parameterSpec.in || '').toLowerCase()) {
    case 'q':
    case 'query':
      return requestValidators.query(parameterSpec, req, models, validationSettings);
    case 'path':
      return requestValidators.path(parameterSpec, req, models, validationSettings);
    case 'body':
      return requestValidators.body(parameterSpec, req, models, validationSettings);
    case 'form':
    case 'formdata':
      return requestValidators.form(parameterSpec, req, models, validationSettings);
    case 'header':
      return requestValidators.header(parameterSpec, req, models, validationSettings);
    default:
      return requestValidators.rootObject(parameterSpec, key, req, models, validationSettings)
  }
}

module.exports = {
  validateRequestParameter
};
