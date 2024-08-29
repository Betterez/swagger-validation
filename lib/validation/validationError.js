function validationError({message, context}) {
  return [{error: new Error(message), context}];
}

module.exports = {
  validationError
};
