class ValidationLogs {
  constructor() {
    this.deletedProperties = [];
  }

  toLiteral() {
    return {
      deletedProperties: this.deletedProperties,
    };
  }

  logPropertyDeleted(validationContext) {
    this.deletedProperties.push(validationContext);
  }

  formatDeletedProperties() {
    return this.deletedProperties.map(context => context.formatDataPath()).join(', ');
  }
}

module.exports = {
  ValidationLogs
};
