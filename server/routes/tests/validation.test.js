const logger = require("../../helpers/logger");
const db = require("../../helpers/db");
const jwt = require("../../helpers/jwt");

const validation = require("../validation");

jest.mock("../../helpers/logger");
jest.mock("../../helpers/db");
jest.mock("../../helpers/jwt");

describe("Validation", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("usernameOrEmail", () => {
    const dbSpy = jest.spyOn(db, "asyncQuery");
    const usernameOrEmail = "foobar";
    const loggerErrorSpy = jest.spyOn(logger, "error");

    it("will return success: false if no email is passed", async () => {
      const response = await validation.usernameOrEmail({});
      expect(dbSpy).toHaveBeenCalledTimes(0);
      expect(response.success).toBe(false);
      expect(response.status).toBe(400);
      expect(response.message).toBeTruthy();
    });

    it("will return success: false if email is already in the db", async () => {
      dbSpy.mockImplementationOnce(() => ["boo"]);

      const response = await validation.usernameOrEmail({ usernameOrEmail });
      expect(dbSpy).toHaveBeenCalledTimes(1);
      expect(response.success).toBe(false);
      expect(response.status).toBe(409);
      expect(response.message).toBeTruthy();
    });

    it("will return success: false if error is thrown", async () => {
      const error = new Error("Unexpected error");
      dbSpy.mockImplementationOnce(() => {
        throw error;
      });

      const response = await validation.usernameOrEmail({ usernameOrEmail });
      expect(dbSpy).toHaveBeenCalledTimes(1);
      expect(loggerErrorSpy).toHaveBeenCalledTimes(1);
      expect(loggerErrorSpy).toHaveBeenCalledWith(error);
      expect(response.success).toBe(false);
      expect(response.status).toBe(500);
    });

    it("will return success: true if no email found", async () => {
      dbSpy.mockImplementationOnce(() => []);

      const response = await validation.usernameOrEmail({ usernameOrEmail });
      expect(dbSpy).toHaveBeenCalledTimes(1);
      expect(dbSpy).toHaveBeenCalledWith(db.userSql.selectNoPassword, [
        usernameOrEmail,
        usernameOrEmail
      ]);
      expect(loggerErrorSpy).toHaveBeenCalledTimes(0);
      expect(response.success).toBe(true);
    });
  });

  describe("token", () => {
    const token = "###foo###";
    const jwtSpy = jest.spyOn(jwt, "verifyToken");

    it("will return success: false if no token", async () => {
      const response = await validation.token({});
      expect(jwtSpy).toHaveBeenCalledTimes(0);
      expect(response.success).toBe(false);
      expect(response.status).toBe(400);
      expect(response.message).toBeTruthy();
    });

    it("will return success: false if error is thrown", async () => {
      const error = new Error("Unexpected error");
      error.name = "TokenExpiredError";

      jwtSpy.mockImplementationOnce(() => {
        throw error;
      });

      const response = await validation.token({ token });
      expect(jwtSpy).toHaveBeenCalledTimes(1);
      expect(jwtSpy).toHaveBeenCalledWith(token);
      expect(response.success).toBe(false);
      expect(response.status).toBe(400);
      expect(response.expired).toBe(true);
      expect(response.message).toBeTruthy();
    });

    it("will return success: true and data if no errors", async () => {
      const data = { id: 1, email: "foobar" };

      jwtSpy.mockImplementationOnce(() => ({ data }));

      const response = await validation.token({ token });
      expect(jwtSpy).toHaveBeenCalledTimes(1);
      expect(response.success).toBe(true);
      expect(response.data).toBe(data);
    });
  });
});
