/**
 * Applies default validation settings.  The default settings correspond to the legacy behaviour of this library.
 */
function getValidationSettings(overrides = {}) {
  const validationSettings =  {
    replaceValues: overrides.replaceValues ?? true,
    allPropertiesAreNullableByDefault: overrides.allPropertiesAreNullableByDefault ?? true,
    treatEmptyStringsLikeUndefinedValues: overrides.treatEmptyStringsLikeUndefinedValues ?? true,
    objectsCanHaveAnyAdditionalPropertiesByDefault: overrides.objectsCanHaveAnyAdditionalPropertiesByDefault ?? true,
    removeUnrecognizedPropertiesFromObjects: overrides.removeUnrecognizedPropertiesFromObjects ?? false,
    removeNullValuesFromObjects: overrides.removeNullValuesFromObjects ?? false,
    removeNullValuesFromArrays: overrides.removeNullValuesFromArrays ?? false,
    requestBodyCanHaveTwoContradictorySchemas: overrides.requestBodyCanHaveTwoContradictorySchemas ?? true,
    throwErrorsWhenSchemaIsInvalid: overrides.throwErrorsWhenSchemaIsInvalid ?? false,
    allowStringRepresentationsOfBooleans: overrides.allowStringRepresentationsOfBooleans ?? true,
    strictDateParsing: overrides.strictDateParsing ?? false,
    allowNumbersToBeStrings: overrides.allowNumbersToBeStrings ?? true,
    allowNumberFormatsWithNoEquivalentRepresentationInJavascript: overrides.allowNumberFormatsWithNoEquivalentRepresentationInJavascript ?? true,
    allowIntegerValuesWhichMayBeParsedIncorrectly: overrides.allowIntegerValuesWhichMayBeParsedIncorrectly ?? true,
    allowStringsToHaveUnreliableDateFormat: overrides.allowStringsToHaveUnreliableDateFormat ?? true,
    allowSchemasWithInvalidTypesAndTreatThemLikeRefs: overrides.allowSchemasWithInvalidTypesAndTreatThemLikeRefs ?? true,
    improvedErrorMessages: overrides.improvedErrorMessages ?? false,
  };

  if (!validationSettings.objectsCanHaveAnyAdditionalPropertiesByDefault && validationSettings.removeUnrecognizedPropertiesFromObjects) {
    throw new Error('Incompatible validation settings.  ' +
      'When disabling the "objectsCanHaveAnyAdditionalPropertiesByDefault" setting, you cannot enable the ' +
      '"removeUnrecognizedPropertiesFromObjects" setting.  Disabling the "objectsCanHaveAnyAdditionalPropertiesByDefault" ' +
      'setting will cause errors to be thrown when an object contains unrecognized properties.  Enabling the ' +
      '"removeUnrecognizedPropertiesFromObjects" setting will cause unrecognized properties to be removed from objects, ' +
      'thereby preventing any errors from being thrown.');
  }

  if (!validationSettings.replaceValues && validationSettings.removeUnrecognizedPropertiesFromObjects) {
    // The "removeUnrecognizedPropertiesFromObjects" causes the validation library to mutate its input.
    // The "replaceValues" flag controls all other behaviour which mutates input.  We want these to be enabled together
    // so that it is simple to understand when input is going to be mutated (that is when "replaceValues" is "true")
    throw new Error('Incompatible validation settings.  ' +
      'When using the "removeUnrecognizedPropertiesFromObjects" setting, you must also enable the "replaceValues" ' +
      'setting because the "removeUnrecognizedPropertiesFromObjects" setting will replace values in objects ' +
      '(it will delete object properties).');
  }

  if (!validationSettings.replaceValues && validationSettings.removeNullValuesFromObjects) {
    throw new Error('Incompatible validation settings.  ' +
      'When using the "removeNullValuesFromObjects" setting, you must also enable the "replaceValues" ' +
      'setting because the "removeNullValuesFromObjects" setting will delete object properties.');
  }

  if (!validationSettings.replaceValues && validationSettings.removeNullValuesFromArrays) {
    throw new Error('Incompatible validation settings.  ' +
      'When using the "removeNullValuesFromArrays" setting, you must also enable the "replaceValues" ' +
      'setting because the "removeNullValuesFromArrays" setting will modify the contents of arrays.');
  }

  return validationSettings;
}

module.exports = {
  getValidationSettings
};
