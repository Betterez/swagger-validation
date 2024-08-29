class ValidationContext {
  constructor(dataPath = []) {
    this.dataPath = dataPath;
  }

  descendIntoProperty(propertyName) {
    return new ValidationContext(this.dataPath.concat([propertyName]));
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
}

module.exports = {
  ValidationContext
};
