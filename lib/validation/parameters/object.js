const _ = require('lodash');
const helper = require('./helper');

/**
 * Ensures that the <tt>value</tt> that is passed in is a valid Object by iterating through each property on the
 * associated model and calling out to the respective validation method to validate that property. After validating
 * the properties on this object's model, it will recursively look to see if any other models have this model
 * in their subType array. If so, it will validate those properties as well. It will continue to do this until no
 * more types are found in the subType array.
 *
 * If "nothing" was passed into the validate function and it's required with no default value,
 * then this will throw a parameter is required error.
 *
 * @memberOf Validation.Parameters
 * @method Validate_Object
 * @param {Object} param The Swagger param that was created for this operation
 * @param {Object} value The value that is passed in along the req (via body, form, etc.)
 * @param {Object} models Any models that are defined for this API
 * @returns {Array} An empty Array if the <tt>value</tt> was "nothing" and not required, else an array
 * containing an object with either an error property (which contains an Array of Error objects)
 * or a value property that contains the value with JSON.stringify() called on it.
 */
function validateObject(param, value, models) {
  // This is imported late due to a circular dependency.
  const {validateParameter} = require('../parameter');

  const isRequired = helper.isRequired(param, value);
  if (isRequired) {
    return isRequired;
  }

  if (Object.prototype.toString.call(value) !== '[object Object]') {
    return helper.errorReturn(`${param.name} is not a type of object`);
  }

  const errors = [];

  function _validate(param, value) {
    const paramType = param.$ref || param.type;
    const model = models[paramType];

    errors.push(..._validateAdditionalProperties(param.name, model, value));

    Object.entries(model.properties ?? {}).forEach(([propertyName, propertySchema]) => {
      const requiredProperties = model.required ?? [];
      const isPropertyRequired = requiredProperties.includes(propertyName);

      if (isPropertyRequired && !value.hasOwnProperty(propertyName)) {
        errors.push(...helper.errorReturn(`${propertyName} is required`));
        return;
      } else if (!isPropertyRequired && !value.hasOwnProperty(propertyName)) {
        return;
      }

      const parameterSchema = {
        ...propertySchema,
        name: propertyName,
        required: isPropertyRequired
      };
      const validationResults = validateParameter(parameterSchema, value[propertyName], models);

      // if the return has any error properties, assume this returned errors, not values.
      const validationErrors = validationResults
        .filter(result => result.hasOwnProperty('error'))
        .map(failure => ({
          ...failure,
          path: failure.path ? `${failure.path} - ${paramType}` : `${paramType}`,
          failedValue: failure.failedValue ?? value[propertyName]
        }));

      if (validationErrors.length === 0) {
        value[propertyName] = validationResults[0].value;
      } else {
        errors.push(...validationErrors);
      }
    });

    // check to see if any other model has this as a subtype and validate the "superType"  properties as well
    _.forEach(models, function(model) {
      if (model.hasOwnProperty('subTypes') && model.subTypes.includes(param.type)) {
        _validate({...param, name: model.id, type: model.id}, value);
      }
    });
  }

  _validate(param, value);

  if (errors.length) {
    return _.sortBy(errors, function(val) { return val.error.message; });
  }
  return helper.successReturn(value);
}

function _validateAdditionalProperties(parentParameterName, model, value) {
  if (model.additionalProperties === false) {
    const allAllowedProperties = Object.keys(model.properties ?? {});
    const allProvidedProperties = Object.keys(value);
    const disallowedProperties = _.without(allProvidedProperties, ...allAllowedProperties);

    if (disallowedProperties.length > 0) {
      return helper.errorReturn(`${parentParameterName} contains invalid properties: ${disallowedProperties.join(", ")}`);
    }
  }

  return [];
}

/**
 * Redirects to the validate object method if this is a valid object in the model, else error.
 *
 * @memberOf Validation.Parameters
 * @method Validate_Object_Formats
 * @param {Object} param The Swagger param that was created for this operation
 * @param {Object} value The value that is passed in along the req (via body, header, etc.)
 * @param {Object} models Any models that are defined for this API
 * @returns {Array} An empty Array if the <tt>value</tt> was "nothing" and not required, else an array
 * containing an object with either an error property (which contains an Array of Error objects)
 * or a value property that contains the value parsed successfully.
 */
function validate(param, value, models) {
  const paramType = param.$ref || param.type;
  return models.hasOwnProperty(paramType) ? validateObject(param, value, models) : helper.errorReturn(`Unknown param type ${paramType}`);
}

module.exports = exports = validate;
