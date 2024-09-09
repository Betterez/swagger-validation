const {dataSource} = require('./dataSource');

class ValidationContext {
  constructor({dataPath = [], dataSource} = {}) {
    this.dataPath = dataPath;
    this.dataSource = dataSource;
  }

  descendIntoProperty(propertyName) {
    return new ValidationContext({dataPath: this.dataPath.concat([propertyName]), dataSource: this.dataSource});
  }

  toLiteral() {
    return {
      dataPath: this.dataPath,
    };
  }

  formatDataPath() {
    let formattedPath = "";

    for (let pathComponent of this.dataPath) {
      if (typeof pathComponent === "number") {
        formattedPath += `[${pathComponent}]`;
      } else {
        formattedPath += `.${pathComponent}`;
      }
    }

    return formattedPath.replace(/^\./, '');
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
