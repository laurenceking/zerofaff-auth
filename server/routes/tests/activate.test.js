const activate = require("../activate");
const db = require("../../helpers/db");
const jwt = require("../../helpers/jwt");
const logger = require("../../helpers/logger");
const mail = require("../../helpers/email");

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

  describe("token", () => {
    const jwtSpy = jest.spyOn(jwt, "verifyToken");

    const token = "123123";
    const id = "foobar";

    beforeEach(() => {});

    it("should return successful when jwt returns an ID and asyncQuery affects exactly one row", async () => {
      jwtSpy.mockImplementationOnce(() => ({ data: { id } }));
      dbSpy.mockImplementationOnce(() => ({ affectedRows: 1 }));

      expect(jwtSpy).toHaveBeenCalledTimes(0);
      expect(dbSpy).toHaveBeenCalledTimes(0);
      const response = await activate.token({ token });
      expect(jwtSpy).toHaveBeenCalledWith(token);
      expect(dbSpy).toHaveBeenCalledTimes(1);
      expect(dbSpy).toHaveBeenCalledWith(db.userSql.activate, [id]);
      expect(loggerSpy).toHaveBeenCalledTimes(0);
      expect(response.success).toBe(true);
      expect(response.id).toBe(id);
    });

    it("should return success: false when jwt returns an ID but asyncQuery does not affect one row", async () => {
      jwtSpy.mockImplementationOnce(() => ({ data: { id } }));
      dbSpy.mockImplementationOnce(() => ({ affectedRows: 0 }));

      expect(jwtSpy).toHaveBeenCalledTimes(0);
      expect(dbSpy).toHaveBeenCalledTimes(0);
      const response = await activate.token({ token });
      expect(jwtSpy).toHaveBeenCalledWith(token);
      expect(dbSpy).toHaveBeenCalledTimes(1);
      expect(dbSpy).toHaveBeenCalledWith(db.userSql.activate, [id]);
      expect(loggerSpy).toHaveBeenCalledTimes(0);
      expect(response.success).toBe(false);
      expect(response.id).toBe(id);
      expect(response.status).toBe(409);
    });

    it("should return success: false with message and expiry if verifyToken throws a TokenExpiredError", async () => {
      const error = new Error("Invalid Token");
      error.name = "TokenExpiredError";

      jwtSpy.mockImplementationOnce(() => {
        throw error;
      });

      expect(jwtSpy).toHaveBeenCalledTimes(0);
      expect(dbSpy).toHaveBeenCalledTimes(0);
      const response = await activate.token({ token });
      expect(jwtSpy).toHaveBeenCalledTimes(1);
      expect(jwtSpy).toHaveBeenCalledWith(token);
      expect(dbSpy).toHaveBeenCalledTimes(0);
      expect(loggerSpy).toHaveBeenCalledTimes(1);
      expect(response.success).toBe(false);
      expect(response.message).toBe(error.message);
      expect(response.expired).toBe(true);
      expect(response.status).toBe(400);
    });

    it("should return success: false with message and expiry: false if an error is thrown", async () => {
      const error = new Error("Invalid Token");

      jwtSpy.mockImplementationOnce(() => {
        throw error;
      });

      expect(jwtSpy).toHaveBeenCalledTimes(0);
      const response = await activate.token({ token });
      expect(jwtSpy).toHaveBeenCalledTimes(1);
      expect(loggerSpy).toHaveBeenCalledTimes(1);
      expect(loggerSpy).toHaveBeenCalledWith(error);
      expect(response.success).toBe(false);
      expect(response.message).toBe(error.message);
      expect(response.expired).toBe(false);
      expect(response.status).toBe(500);
    });

    it("should return success: false with message if no token is passed", async () => {
      const response = await activate.token({});
      expect(jwtSpy).toHaveBeenCalledTimes(0);
      expect(loggerSpy).toHaveBeenCalledTimes(0);
      expect(response.success).toBe(false);
      expect(response.status).toBe(400);
      expect(response.message).toBeTruthy();
    });
  });

  describe("resend", () => {
    const mailSpy = jest.spyOn(mail, "sendActivation");

    const nameoremail = "foofoo";

    it("should return success: false with message if no token is passed", async () => {
      const response = await activate.resend({});
      expect(dbSpy).toHaveBeenCalledTimes(0);
      expect(response.success).toBe(false);
      expect(response.status).toBe(400);
      expect(response.message).toBeTruthy();
    });

    it("should return success: false when db returns no rows", async () => {
      const nameoremail = "foofoo";

      dbSpy.mockImplementationOnce(() => []);

      expect(dbSpy).toHaveBeenCalledTimes(0);
      const response = await activate.resend({ nameoremail });
      expect(dbSpy).toHaveBeenCalledTimes(1);
      expect(mailSpy).toHaveBeenCalledTimes(0);
      expect(dbSpy).toHaveBeenCalledWith(db.userSql.selectNoPassword, [
        nameoremail,
        nameoremail
      ]);
      expect(response.success).toBe(false);
      expect(response.status).toBe(409);
    });

    it("should return success: false when an error is thrown", async () => {
      const error = new Error("Unexpected error");

      dbSpy.mockImplementationOnce(() => {
        throw error;
      });

      expect(dbSpy).toHaveBeenCalledTimes(0);
      const response = await activate.resend({ nameoremail });
      expect(dbSpy).toHaveBeenCalledTimes(1);
      expect(mailSpy).toHaveBeenCalledTimes(0);
      expect(loggerSpy).toHaveBeenCalledTimes(1);
      expect(loggerSpy).toHaveBeenCalledWith(error);
      expect(response.success).toBe(false);
      expect(response.message).toBe(error.message);
      expect(response.status).toBe(500);
    });

    it("should return success: false and active: true when user is active and does not send email", async () => {
      dbSpy.mockImplementationOnce(() => [{ active: 1 }]);

      expect(dbSpy).toHaveBeenCalledTimes(0);
      const response = await activate.resend({ nameoremail });
      expect(dbSpy).toHaveBeenCalledTimes(1);
      expect(mailSpy).toHaveBeenCalledTimes(0);
      expect(loggerSpy).toHaveBeenCalledTimes(0);
      expect(response.success).toBe(false);
      expect(response.status).toBe(409);
      expect(response.active).toBe(true);
    });

    it("should return success: false if send email fails", async () => {
      const dbUser = { id: 1, email: "foofoobar", active: 0 };
      dbSpy.mockImplementationOnce(() => [dbUser]);
      mailSpy.mockImplementationOnce(() => false);
      expect(dbSpy).toHaveBeenCalledTimes(0);
      const response = await activate.resend({ nameoremail });
      expect(dbSpy).toHaveBeenCalledTimes(1);
      expect(mailSpy).toHaveBeenCalledTimes(1);
      expect(mailSpy).toHaveBeenCalledWith({
        id: dbUser.id,
        email: dbUser.email
      });
      expect(loggerSpy).toHaveBeenCalledTimes(0);
      expect(response.success).toBe(false);
      expect(response.message).toBeTruthy();
      expect(response.status).toBe(500);
    });

    it("should return success: true if send email succeeds", async () => {
      const dbUser = { id: 1, email: "foofoobar", active: 0 };
      dbSpy.mockImplementationOnce(() => [dbUser]);
      mailSpy.mockImplementationOnce(() => true);
      expect(dbSpy).toHaveBeenCalledTimes(0);
      const response = await activate.resend({ nameoremail });
      expect(dbSpy).toHaveBeenCalledTimes(1);
      expect(mailSpy).toHaveBeenCalledTimes(1);
      expect(mailSpy).toHaveBeenCalledWith({
        id: dbUser.id,
        email: dbUser.email
      });
      expect(loggerSpy).toHaveBeenCalledTimes(0);
      expect(response.success).toBe(true);
      expect(response.message).toBeTruthy();
    });
  });
});
