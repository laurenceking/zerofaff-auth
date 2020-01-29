const mysql = require("mysql");
const logger = require("./logger");

const config = require("../../config");

let pool = null;

const createPool = () => {
  pool = mysql.createPool({
    host: config.db.host,
    user: config.db.username,
    password: config.db.password,
    database: config.db.database,
    supportBigNumbers: true,
    bigNumberStrings: true,
    multipleStatements: true,
    timezone: config.db.timezone
  });
};

const asyncQuery = (query, variables, debug) => {
  if (!pool) {
    createPool();
  }

  return new Promise((resolve, reject) => {
    pool.query(query, variables, function(err, rows) {
      if (debug) {
        console.log(this.sql);
      }
      if (err) {
        logger.error(err);
        return reject(err);
      }
      return resolve(rows);
    });
  });
};

const intToMysqlTimestamp = num => {
  const date = new Date(num);
  return `${date.toISOString().slice(0, 10)} ${date
    .toISOString()
    .slice(11, 19)}`;
};

const activate = "UPDATE users SET active = 1 WHERE id = ? LIMIT 1";
const insert = "INSERT INTO users SET ?";
const loginFail =
  "UPDATE users SET attempts = attempts + 1, last_attempt = ? WHERE username = ? OR email = ? LIMIT 1";
const loginSuccess =
  "UPDATE users SET attempts = 0, last_attempt = null, last_login = ? WHERE username = ? OR email = ? LIMIT 1";
const select =
  "SELECT id AS sub, username AS name, password, active, admin, last_login, attempts, last_attempt FROM users WHERE (username = ? OR email = ?) LIMIT 1";
const selectNoPassword =
  "SELECT id, username, email, active FROM users WHERE username = ? OR email = ? LIMIT 1";
const updatePassword = "UPDATE users SET password = ? WHERE id = ? LIMIT 1";

module.exports = {
  asyncQuery,
  intToMysqlTimestamp,
  userSql: {
    activate,
    insert,
    loginFail,
    loginSuccess,
    select,
    selectNoPassword,
    updatePassword
  }
};
