const requestValidators = require('./requestParameters');

function selectValidationFunctionForRequestParameter(parameterSchema) {
  const parameterType = (parameterSchema.paramType || parameterSchema.in || '').toLowerCase();

  switch (parameterType) {
    case 'q':
    case 'query':
      return requestValidators.query;
    case 'path':
      return requestValidators.path;
    case 'body':
      return requestValidators.body;
    case 'form':
    case 'formdata':
      return requestValidators.form;
    case 'header':
      return requestValidators.header;
    default:
      throw new Error(`Unrecognized request parameter: "${parameterType}"`);
  }
}

module.exports = {
  selectValidationFunctionForRequestParameter
};
