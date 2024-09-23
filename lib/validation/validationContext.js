const {dataSource} = require('./dataSource');

class ValidationContext {
  constructor({dataPath = [], dataSource, modelPath = []} = {}) {
    this.dataPath = dataPath;
    this.dataSource = dataSource;
    this.modelPath = modelPath;
  }

  descendIntoProperty(propertyName) {
    return new ValidationContext({
      dataPath: this.dataPath.concat([propertyName]),
      dataSource: this.dataSource,
      modelPath: this.modelPath,
    });
  }

  descendIntoModel(modelName) {
    return new ValidationContext({
      dataPath: this.dataPath,
      dataSource: this.dataSource,
      modelPath: this.modelPath.concat([modelName]),
    });
  }

  toLiteral() {
    return {
      dataPath: this.dataPath,
      modelPath: this.modelPath,
    };
  }

  formatDataPath() {
    let formattedPath = '';

    for (let pathComponent of this.dataPath) {
      if (typeof pathComponent === 'number') {
        formattedPath += `[${pathComponent}]`;
      } else {
        formattedPath += `.${pathComponent}`;
      }
    }

    return formattedPath.replace(/^\./, '');
  }

  formatModelPath() {
    if (this.modelPath.length === 0) {
      return 'Schema';
    }
    return this.modelPath.join(' → ');
  }

  formatDataSource() {
    switch (this.dataSource) {
      case dataSource.QUERY:
        return 'Query string';
      case dataSource.PATH:
        return 'URL';
      case dataSource.BODY:
        return 'Request body';
      case dataSource.FORM:
      case dataSource.FORM_DATA:
        return 'Form data';
      case dataSource.HEADER:
        return 'Request header';
      default:
        return 'Data';
    }
  }
}

module.exports = {
  ValidationContext
};
