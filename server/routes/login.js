const bcrypt = require("bcrypt");

const logger = require("../helpers/logger");
const { asyncQuery, intToMysqlTimestamp, userSql } = require("../helpers/db");
const jwt = require("../helpers/jwt");

module.exports = async ({ username, password }) => {
  if (!username || !password) {
    return {
      success: false,
      status: 400,
      message: "Invalid username/email/password"
    };
  }

  try {
    const result = await asyncQuery(userSql.select, [username, username]);
    let attempts = 0;
    if (result[0]) {
      attempts = result[0].attempts;
      const timeSinceAttempt = Date.now() - result[0].last_attempt;
      if (attempts > 5 && timeSinceAttempt < 5000) {
        return {
          attempts,
          status: 401,
          message:
            "Too many attempts, please wait 5 seconds before trying again",
          success: false
        };
      }
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
        const data = {
          admin: result[0].admin == 1,
          id: result[0].sub,
          username: result[0].name,
          last_login: Date.now()
        };
        logger.info(data);
        await asyncQuery(userSql.loginSuccess, [
          intToMysqlTimestamp(Date.now()),
          username,
          username
        ]);
        return { success: true, token: jwt.getToken(data) };
      }
      await asyncQuery(userSql.loginFail, [
        intToMysqlTimestamp(Date.now()),
        username,
        username
      ]);
    }
    return {
      attempts: attempts + 1,
      success: false,
      status: 400,
      message: "Invalid username/email or password"
    };
  } catch (error) {
    logger.error(error);
    return {
      error,
      message: "There was a problem logging in",
      status: 500,
      success: false
    };
  }
};
