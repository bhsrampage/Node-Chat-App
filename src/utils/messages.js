const generateMessage = (text, name) => {
  return {
    text,
    name,
    createdAt: new Date().getTime(),
  };
};

module.exports = {
  generateMessage,
};
