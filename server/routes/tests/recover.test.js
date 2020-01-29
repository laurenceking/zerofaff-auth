const recover = require("../recover");

const bcrypt = require("bcrypt");
const db = require("../../helpers/db");
const jwt = require("../../helpers/jwt");
const logger = require("../../helpers/logger");
const mail = require("../../helpers/email");
const utils = require("../../helpers/utils");

jest.mock("bcrypt");
jest.mock("../../helpers/utils");
jest.mock("../../helpers/logger");
jest.mock("../../helpers/db");
jest.mock("../../helpers/jwt");
jest.mock("../../helpers/email");

describe("activate", () => {
  const dbSpy = jest.spyOn(db, "asyncQuery");
  const loggerSpy = jest.spyOn(logger, "info");

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("send", () => {
    const mailSpy = jest.spyOn(mail, "sendRecovery");

    const email = "foofoobar";
    const dbUser = { id: 1, email, active: 0 };

    beforeEach(() => {});

    it("should return successful when db returns user and send email returns true", async () => {
      dbSpy.mockImplementationOnce(() => [dbUser]);
      mailSpy.mockImplementationOnce(() => true);

      expect(dbSpy).toHaveBeenCalledTimes(0);
      expect(mailSpy).toHaveBeenCalledTimes(0);
      const response = await recover.send({ nameOrEmail: email });
      expect(dbSpy).toHaveBeenCalledTimes(1);
      expect(dbSpy).toHaveBeenCalledWith(db.userSql.selectNoPassword, [
        email,
        email
      ]);
      expect(mailSpy).toHaveBeenCalledWith({ id: dbUser.id, email });

      expect(response.success).toBe(true);
      expect(response.message).toBeTruthy();
    });

    it("should return success false when send email returns false", async () => {
      dbSpy.mockImplementationOnce(() => [dbUser]);
      mailSpy.mockImplementationOnce(() => false);

      expect(dbSpy).toHaveBeenCalledTimes(0);
      expect(mailSpy).toHaveBeenCalledTimes(0);
      const response = await recover.send({ nameOrEmail: email });
      expect(dbSpy).toHaveBeenCalledTimes(1);
      expect(mailSpy).toHaveBeenCalledTimes(1);

      expect(response.success).toBe(false);
      expect(response.status).toBe(500);
      expect(response.message).toBeTruthy();
    });

    it("should return success false when user not found in db", async () => {
      dbSpy.mockImplementationOnce(() => []);

      const response = await recover.send({ nameOrEmail: email });
      expect(mailSpy).toHaveBeenCalledTimes(0);
      expect(response.success).toBe(false);
      expect(response.status).toBe(404);
      expect(response.message).toBeTruthy();
    });

    it("should return success false when user found but email send failed", async () => {
      dbSpy.mockImplementationOnce(() => [dbUser]);
      mailSpy.mockImplementationOnce(() => false);

      const response = await recover.send({ nameOrEmail: email });
      expect(mailSpy).toHaveBeenCalledTimes(1);
      expect(response.success).toBe(false);
      expect(response.status).toBe(500);
      expect(response.message).toBeTruthy();
    });

    it("should return success false when an error is thrown", async () => {
      const error = new Error("Unexpected error");

      dbSpy.mockImplementationOnce(() => {
        throw error;
      });

      const response = await recover.send({ nameOrEmail: email });
      expect(mailSpy).toHaveBeenCalledTimes(0);
      expect(loggerSpy).toHaveBeenCalledTimes(1);
      expect(loggerSpy).toHaveBeenCalledWith(error);
      expect(response.success).toBe(false);
      expect(response.status).toBe(500);
      expect(response.message).toBeTruthy();
    });
  });

  describe("reset", () => {
    const password = "barbar";
    const token = "yakmoo";

    const jwtSpy = jest.spyOn(jwt, "verifyToken");
    const bcryptSpy = jest.spyOn(bcrypt, "hashSync");
    const validateSpy = jest.spyOn(utils, "validatePassword");

    it("should return success: false when no token is passed", async () => {
      const response = await recover.reset({ password });
      expect(dbSpy).toHaveBeenCalledTimes(0);
      expect(response.success).toBe(false);
      expect(response.status).toBe(400);
      expect(response.message).toBeTruthy();
    });

    it("should return success: false when no password is passed", async () => {
      const response = await recover.reset({ token });
      expect(dbSpy).toHaveBeenCalledTimes(0);
      expect(response.success).toBe(false);
      expect(response.status).toBe(400);
      expect(response.message).toBeTruthy();
    });

    it("should return success: false when db affects no rows", async () => {
      const passwordHash = "###foo###";
      const id = 1;

      dbSpy.mockImplementationOnce(() => ({ affectedRows: 0 }));
      jwtSpy.mockImplementationOnce(() => ({ data: { id } }));
      bcryptSpy.mockImplementationOnce(() => passwordHash);
      validateSpy.mockImplementationOnce(() => ({ valid: true }));

      const response = await recover.reset({ password, token });
      expect(jwtSpy).toHaveBeenCalledTimes(1);
      expect(bcryptSpy).toHaveBeenCalledTimes(1);
      expect(dbSpy).toHaveBeenCalledTimes(1);
      expect(dbSpy).toHaveBeenCalledWith(db.userSql.updatePassword, [
        passwordHash,
        id
      ]);
      expect(response.success).toBe(false);
      expect(response.status).toBe(404);
      expect(response.message).toBeTruthy();
    });

    it("should return success: true when db affects one rows", async () => {
      const passwordHash = "###foo###";
      const id = 1;

      dbSpy.mockImplementationOnce(() => ({ affectedRows: 1 }));
      jwtSpy.mockImplementationOnce(() => ({ data: { id } }));
      bcryptSpy.mockImplementationOnce(() => passwordHash);
      validateSpy.mockImplementationOnce(() => ({ valid: true }));

      const response = await recover.reset({ password, token });
      expect(validateSpy).toHaveBeenCalledTimes(1);
      expect(validateSpy).toHaveBeenCalledWith(password);
      expect(jwtSpy).toHaveBeenCalledTimes(1);
      expect(jwtSpy).toHaveBeenCalledWith(token);
      expect(bcryptSpy).toHaveBeenCalledTimes(1);
      expect(bcryptSpy).toHaveBeenCalledWith(password, 8);
      expect(dbSpy).toHaveBeenCalledTimes(1);
      expect(dbSpy).toHaveBeenCalledWith(db.userSql.updatePassword, [
        passwordHash,
        id
      ]);
      expect(response.success).toBe(true);
      expect(response.message).not.toBeTruthy();
    });

    it("should return success: false when an error is thrown", async () => {
      const error = new Error("Unknown error");

      jwtSpy.mockImplementationOnce(() => {
        throw error;
      });

      const response = await recover.reset({ password, token });
      expect(jwtSpy).toHaveBeenCalledTimes(1);
      expect(jwtSpy).toHaveBeenCalledWith(token);
      expect(bcryptSpy).toHaveBeenCalledTimes(0);
      expect(dbSpy).toHaveBeenCalledTimes(0);
      expect(response.success).toBe(false);
      expect(response.status).toBe(500);
      expect(response.expired).toBe(false);
      expect(response.message).toBeTruthy();
    });

    it("should return success: false and expired: true when a TokenExpiredError is thrown", async () => {
      const error = new Error("Unexpected error");
      error.name = "TokenExpiredError";

      jwtSpy.mockImplementationOnce(() => {
        throw error;
      });

      const response = await recover.reset({ password, token });
      expect(jwtSpy).toHaveBeenCalledTimes(1);
      expect(jwtSpy).toHaveBeenCalledWith(token);
      expect(validateSpy).toHaveBeenCalledTimes(0);
      expect(bcryptSpy).toHaveBeenCalledTimes(0);
      expect(dbSpy).toHaveBeenCalledTimes(0);
      expect(response.success).toBe(false);
      expect(response.status).toBe(400);
      expect(response.expired).toBe(true);
      expect(response.message).toBeTruthy();
    });

    it("should return success: false and bcrypt should not be called if invalid password", async () => {
      const message = "bad password";
      jwtSpy.mockImplementationOnce(() => ({ data: { id: 1 } }));
      validateSpy.mockImplementationOnce(() => ({ valid: false, message }));

      const response = await recover.reset({ password, token });
      expect(jwtSpy).toHaveBeenCalledTimes(1);
      expect(jwtSpy).toHaveBeenCalledWith(token);
      expect(validateSpy).toHaveBeenCalledTimes(1);
      expect(bcryptSpy).toHaveBeenCalledTimes(0);
      expect(dbSpy).toHaveBeenCalledTimes(0);
      expect(response.success).toBe(false);
      expect(response.status).toBe(400);
      expect(response.message).toBe(message);
    });
  });
});
