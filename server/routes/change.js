const bcrypt = require("bcrypt");

const logger = require("../helpers/logger");
const { sleep } = require("../helpers/utils");
const { asyncQuery, userSql } = require("../helpers/db");
const { validatePassword } = require("../helpers/utils");

module.exports = {
  password: async ({ username, password, newPassword }) => {
    if (!username || !password || !newPassword) {
      return {
        success: false,
        status: 400,
        message: "Invalid username/email/password"
      };
    }
    const passwordValidity = validatePassword(newPassword);
    if (!passwordValidity.valid) {
      return {
        success: false,
        status: 400,
        message: passwordValidity.message
      };
    }
    await sleep(2000);
    try {
      const result = await asyncQuery(userSql.select, [username, username]);
      if (result[0]) {
        if (result[0].active !== 1) {
          return {
            activate: true,
            status: 401,
            message: "Account not activated",
            success: false
          };
        }

        const match = await bcrypt.compare(password, result[0].password);

        if (match) {
          const passwordHash = bcrypt.hashSync(newPassword, 8);
          const updateResult = await asyncQuery(userSql.updatePassword, [
            passwordHash,
            result[0].sub
          ]);
          if (updateResult.affectedRows === 1) {
            logger.info({ type: "password changed", user: result[0].username });
            return { success: true };
          } else {
            throw Error("Password update failed");
          }
        }
      }
      return {
        success: false,
        status: 400,
        message: "Invalid username/email or password"
      };
    } catch (error) {
      logger.error(error);
      return {
        error,
        message: "There was a problem changing the password",
        status: 500,
        success: false
      };
    }
  }
};
