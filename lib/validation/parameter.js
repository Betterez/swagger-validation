/** @namespace Validation */
'use strict';
var parameters = require('./parameters');

function _validateParam(param, value, models) {
  switch ((param.type || param.$ref).toLowerCase()) {
    case "array":
      return parameters.array(param, value, models);
    case "boolean":
      return parameters.boolean(param, value);
    case "file":
      return parameters.file(param, value);
    case 'integer':
      return parameters.integer(param, value);
    case "number":
      return parameters.number(param, value);
    case 'string':
      return parameters.string(param, value);
    case 'void':
      return [];
    default:
      return parameters.object(param, value, models);
  }
}

/**
 * Ensures that the <tt>value</tt> that is passed in on the req is valid based upon the Swagger definition for this operation.
 * @memberOf Validation
 * @method Validate_Parameter
 * @param {Object} param The Swagger param that was created for this operation
 * @param {Object} value The value that is passed in along the req (via body, header, etc.)
 * @param {Object} [models] Optionally, the models that are defined as part of this Swagger API definition
 * @returns {Array} An empty Array if the <tt>value</tt> was "nothing" and not required, else an array
 * containing an object with either an error property (which contains an Array of Error objects)
 * or a value property that contains the value, parsed successfully if validation knows how, else the value unmodified.
 */
var validateParameter = function(param, value, models) {
  if (Array.isArray(param.oneOf)) {
    const results = [];
    param.oneOf.forEach((oneOf) => {
      param.type = oneOf.type;
      results.push(..._validateParam(param, value, models));
    });
    const success = results.filter((result) => {
      return result.error === undefined;
    });
    if (success.length > 0) {
      return success;
    } else {
      return results;
    }
  } else {
    return _validateParam(param, value, models);
  }
};
module.exports = exports = validateParameter;