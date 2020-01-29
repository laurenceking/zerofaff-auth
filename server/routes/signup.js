const bcrypt = require("bcrypt");
const { sendActivation } = require("../helpers/email");
const logger = require("../helpers/logger");
const { asyncQuery, userSql } = require("../helpers/db");
const { validatePassword } = require("../helpers/utils");

module.exports = async ({ username, email, password }) => {
  const errorMessages = {};

  if (!username) {
    errorMessages.username = "Username is required";
  }
  if (!email) {
    errorMessages.email = "Email is required";
  }
  if (!password) {
    errorMessages.password = "Password is required";
  }

  const passwordValidity = validatePassword(password);
  if (!passwordValidity.valid) {
    errorMessages.password = passwordValidity.message;
  }

  if (Object.keys(errorMessages).length) {
    return { status: 400, success: false, message: errorMessages };
  } else {
    try {
      const result = await asyncQuery(userSql.selectNoPassword, [
        username,
        email
      ]);
      if (result[0]) {
        return {
          success: false,
          status: 409,
          message: "Username/email already registered"
        };
      }

      const passwordHash = bcrypt.hashSync(password, 8);
      const insertResult = await asyncQuery(userSql.insert, {
        username,
        email,
        password: passwordHash
      });

      if (!insertResult.insertId) {
        return { success: false, status: 500, message: "User creation failed" };
      }
      const emailSent = sendActivation({
        id: insertResult.insertId,
        email
      });

      if (!emailSent) {
        return {
          success: false,
          activate: true,
          status: 500,
          message: "Sending of activation email failed"
        };
      } else {
        return { success: true };
      }
    } catch (error) {
      logger.error(error);
      return { success: false, status: 500, message: error.message };
    }
  }
};
