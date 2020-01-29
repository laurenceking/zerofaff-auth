const fs = require("fs");
const jwt = require("jsonwebtoken");
const { token } = require("../../config");

const privateKey = fs.readFileSync(`${__dirname}/../keys/private.key`, "utf8"); // to sign JWT
const publicKey = fs.readFileSync(`${__dirname}/../keys/public.key`, "utf8"); // to verify JWT

const signOptions = {
  algorithm: token.algorithm,
  expiresIn: token.ttl,
  issuer: token.issuer
};

const verifyOptions = {
  algorithm: [token.algorithm],
  expiresIn: token.ttl,
  issuer: token.issuer
};

module.exports = {
  getToken: data => {
    return jwt.sign({ data }, privateKey, signOptions);
  },
  verifyToken: token => {
    return jwt.verify(token, publicKey, verifyOptions);
  }
};
