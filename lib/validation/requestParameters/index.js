const {validateRequestBody} = require('./body');
const rootObject = require('./rootObject');
const {validateRequestForm} = require('./form');
const {validateRequestHeader} = require('./header');
const {validateRequestPath} = require('./path');
const {validateRequestQueryString} = require('./query');

module.exports = {
  body: validateRequestBody,
  rootObject,
  form: validateRequestForm,
  header: validateRequestHeader,
  path: validateRequestPath,
  query: validateRequestQueryString
};
