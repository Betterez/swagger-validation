const {validateRequestBody} = require('./body');
const {validateRequestForm} = require('./form');
const {validateRequestHeader} = require('./header');
const {validateRequestPath} = require('./path');
const {validateRequestQueryString} = require('./query');

module.exports = {
  body: validateRequestBody,
  form: validateRequestForm,
  header: validateRequestHeader,
  path: validateRequestPath,
  query: validateRequestQueryString
};
