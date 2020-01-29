const logger = require("../helpers/logger");
const { asyncQuery, userSql } = require("../helpers/db");
const { sendActivation } = require("../helpers/email");
const jwt = require("../helpers/jwt");

module.exports = {
  token: async ({ token }) => {
    if (token) {
      try {
        const { data } = jwt.verifyToken(token);
        const result = await asyncQuery(userSql.activate, [data.id]);
        if (result.affectedRows === 1) {
          return { success: true, ...data };
        }
        return { success: false, status: 409, ...data };
      } catch (error) {
        logger.info(error);
        return {
          expired: error.name === "TokenExpiredError",
          message: error.message,
          status: error.name === "TokenExpiredError" ? 400 : 500,
          success: false
        };
      }
    }
    return {
      message: "Invalid token",
      status: 400,
      success: false
    };
  },
  resend: async ({ nameoremail }) => {
    if (nameoremail) {
      try {
        const result = await asyncQuery(userSql.selectNoPassword, [
          nameoremail,
          nameoremail
        ]);

        if (result[0]) {
          if (result[0].active === 1) {
            return {
              active: true,
              message: "Account already activated",
              status: 409,
              success: false
            };
          }

          const emailSent = sendActivation({
            id: result[0].id,
            email: result[0].email
          });

          if (!emailSent) {
            return {
              success: false,
              status: 500,
              message: "Sending of activation email failed"
            };
          }
          return {
            email: result[0].email,
            message: "Activation email resent",
            success: true
          };
        }
        return { success: false, status: 409, message: "Account not found" };
      } catch (error) {
        logger.info(error);
        return { success: false, status: 500, message: error.message };
      }
    }
    return {
      message: "Invalid name or email",
      status: 400,
      success: false
    };
  }
};
