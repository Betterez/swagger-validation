class ValidationLogs {
  constructor() {
    this.deletedProperties = [];
    this.nullValuesRemovedFromObjects = [];
  }

  toLiteral() {
    return {
      deletedProperties: this.deletedProperties,
      nullValuesRemovedFromObjects: this.nullValuesRemovedFromObjects,
    };
  }

  logPropertyDeleted(validationContext) {
    this.deletedProperties.push(validationContext);
  }

  formatDeletedProperties() {
    return this.deletedProperties.map(context => context.formatDataPath()).join(', ');
  }

  logNullValueRemovedFromObject(validationContext) {
    this.nullValuesRemovedFromObjects.push(validationContext);
  }

  formatNullValuesRemovedFromObjects(validationContext) {
    return this.nullValuesRemovedFromObjects.map(context => context.formatDataPath()).join(', ');
  }
}

module.exports = {
  ValidationLogs
};
