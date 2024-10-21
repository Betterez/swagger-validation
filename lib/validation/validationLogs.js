class ValidationLogs {
  constructor() {
    this.deletedProperties = [];
    this.nullValuesRemovedFromObjects = [];
    this.nullValuesRemovedFromArrays = [];
  }

  toLiteral() {
    return {
      deletedProperties: this.deletedProperties,
      nullValuesRemovedFromObjects: this.nullValuesRemovedFromObjects,
      nullValuesRemovedFromArrays: this.nullValuesRemovedFromArrays,
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

  formatNullValuesRemovedFromObjects() {
    return this.nullValuesRemovedFromObjects.map(context => context.formatDataPath()).join(', ');
  }

  logNullValueRemovedFromArray(validationContext) {
    this.nullValuesRemovedFromArrays.push(validationContext);
  }

  formatNullValuesRemovedFromArrays() {
    return this.nullValuesRemovedFromArrays.map(context => context.formatDataPath()).join(', ');
  }
}

module.exports = {
  ValidationLogs
};
