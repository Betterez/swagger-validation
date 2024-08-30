/**
 * Applies default validation settings.  The default settings correspond to the legacy behaviour of this library.
 */
function getValidationSettings(validationSettings = {}) {
  return {
    replaceValues: validationSettings.replaceValues ?? true,
    allPropertiesAreNullableByDefault: validationSettings.allPropertiesAreNullableByDefault ?? true,
    treatEmptyStringsLikeUndefinedValues: validationSettings.treatEmptyStringsLikeUndefinedValues ?? true,
    objectsCanHaveAnyAdditionalPropertiesByDefault: validationSettings.objectsCanHaveAnyAdditionalPropertiesByDefault ?? true,
    requestBodyCanHaveTwoContradictorySchemas: validationSettings.requestBodyCanHaveTwoContradictorySchemas ?? true,
  };
}

module.exports = {
  getValidationSettings
};
