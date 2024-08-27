const {validateRequest} = require('./lib/validation/validateRequest');
const {validateAgainstSchema} = require('./lib/validation/validateAgainstSchema');

module.exports = {
  validateRequest,
  validateAgainstSchema
};
