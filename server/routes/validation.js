const logger = require("../helpers/logger");
const { asyncQuery, userSql } = require("../helpers/db");
const jwt = require("../helpers/jwt");

module.exports = {
  usernameOrEmail: async ({ usernameOrEmail }) => {
    if (usernameOrEmail) {
      try {
        const result = await asyncQuery(userSql.selectNoPassword, [
          usernameOrEmail,
          usernameOrEmail
        ]);
        if (result[0]) {
          return {
            success: false,
            status: 409,
            message: "Username or email already registered"
          };
        }
        return { success: true };
      } catch (error) {
        logger.error(error);
        return { status: 500, success: false };
      }
    }
    return {
      success: false,
      status: 400,
      message: "Username or email address is required"
    };
  },
  token: ({ token }) => {
    if (token) {
      try {
        const { data } = jwt.verifyToken(token);
        return { success: true, data };
      } catch (error) {
        return {
          success: false,
          status: error.name === "TokenExpiredError" ? 400 : 500,
          expired: error.name === "TokenExpiredError",
          message: "Invalid token"
        };
      }
    }
    return { success: false, status: 400, message: "Token is required" };
  }
};
