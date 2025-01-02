const jwt = require("jsonwebtoken");
const { secret } = sails.config.custom.jsonWebToken;

module.exports = {
  issue: (payload) => {
    token = jwt.sign(payload, secret, { expiresIn: "30h" });
    return token;
  },

  issuePassword: (payload) => {
    password = jwt.sign(payload, secret, { expiresIn: "30h" });
    return password;
  },
  verify: (payload) => {
    let result = jwt.verify(payload, secret, (error, decoded) => {
      return { error, decoded };
    });
    return result;
  },
};
