/**
 * @fileoverview This is a middleware to authenticate admin and it will procced every time before any api is called...
 * @constant jwt instance of jsonwebtoken service
 * @constant secret a secrate key to decode jwt token
 */
const jwt = require("jsonwebtoken");
const { secret } = sails.config.custom.jsonWebToken;
const ResponseCodes = sails.config.constants.ResponseCodes;
const messages = sails.config.messages;
const Roles = sails.config.constants.Roles;

module.exports = async (req, res, next) => {
  //requesting header to get token and language
  const token = req.header("x-auth");
  if (token) {
    let { error, decoded } = JwtService.verify(token);

    if (error) {
      // And throw token not valid error.
      return res.status(ResponseCodes.UNAUTHORIZED).json({
        status: ResponseCodes.UNAUTHORIZED,
        data: "",
        error: error,
      });
    }

    //if there is no error than token must be decoded
    if (decoded) {
      //fetch user details to provide it in next controllers
      let user = await User.findOne({
        uniqueId: decoded.uniqueId,
      }).catch((error) => {
        return res.status(ResponseCodes.UNAUTHORIZED).json({
          status: ResponseCodes.UNAUTHORIZED,
          data: "",
          error: error,
        });
      });

      //if user found that set it in request object so that it can be accessible from next controllers
      if (user) {
        req.user = _.omit(user, ["password", "token"]);
        return next();
      } else {
        return res.status(ResponseCodes.UNAUTHORIZED).json({
          status: ResponseCodes.UNAUTHORIZED,
          data: "",
          error: messages.InvalidUserToken,
        });
      }
    }
  }
  //if token not provided throw missing token error
  else {
    return res.status(ResponseCodes.UNAUTHORIZED).json({
      status: ResponseCodes.UNAUTHORIZED,
      data: "",
      error: messages.MissingAuthToken,
    });
  }
};
