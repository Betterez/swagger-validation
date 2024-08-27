/**
 * Applies default values to the validation object in the <tt>spec</tt>.
 *
 * @memberOf Validation.ParamTypes
 * @method Get_Validation_Settigns
 * @param {Object} [validationSettings] Optionally, the validation object that is defined as part of this Swagger API definition
 * @returns {Object} An object that contains the values passed in on <tt>spec.validation</tt>,
 * plus any defaults for missing values
 */
function getValidationSettings(validationSettings = {}) {
  return {
    replaceValues: validationSettings.hasOwnProperty('replaceValues') ? validationSettings.replaceValues : true
  };
}

module.exports = {
  getValidationSettings
};
