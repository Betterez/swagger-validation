const {validateRequestBody} = require('./body');
const rootObject = require('./rootObject');
const form = require('./form');
const header = require('./header');
const path = require('./path');
const query = require('./query');

module.exports = {
  body: validateRequestBody,
  rootObject,
  form,
  header,
  path,
  query
};
