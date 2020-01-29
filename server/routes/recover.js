const bcrypt = require("bcrypt");
const logger = require("../helpers/logger");
const { asyncQuery, userSql } = require("../helpers/db");
const { sendRecovery } = require("../helpers/email");
const jwt = require("../helpers/jwt");
const { validatePassword } = require("../helpers/utils");

module.exports = {
  send: async ({ nameOrEmail }) => {
    if (nameOrEmail) {
      try {
        const result = await asyncQuery(userSql.selectNoPassword, [
          nameOrEmail,
          nameOrEmail
        ]);

        if (result[0]) {
          const emailSent = sendRecovery({
            id: result[0].id,
            email: result[0].email
          });

          if (!emailSent) {
            return {
              success: false,
              status: 500,
              message: "Sending of recovery email failed"
            };
          }
          return { success: true, message: "Recovery email sent" };
        }
        return { success: false, status: 404, message: "Account not found" };
      } catch (error) {
        logger.info(error);
        return { status: 500, success: false, message: "Unexpected error" };
      }
    }
    return { message: "Invalid name/email", status: 400 };
  },
  reset: async ({ password, token }) => {
    if (token && password) {
      try {
        const { data } = jwt.verifyToken(token);

        const passwordValidity = validatePassword(password);
        if (!passwordValidity.valid) {
          return {
            success: false,
            status: 400,
            message: passwordValidity.message
          };
        }
        const passwordHash = bcrypt.hashSync(password, 8);
        const result = await asyncQuery(userSql.updatePassword, [
          passwordHash,
          data.id
        ]);
        if (result.affectedRows === 1) {
          return { success: true };
        } else {
          return { success: false, status: 404, message: "User not found" };
        }
      } catch (error) {
        logger.info(error);
        return {
          success: false,
          status: error.name === "TokenExpiredError" ? 400 : 500,
          expired: error.name === "TokenExpiredError",
          message: "Invalid token"
        };
      }
    }
    return { status: 400, success: false, message: "Invalid token/password" };
  }
};
