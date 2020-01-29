const bcrypt = require("bcrypt");

const logger = require("../../helpers/logger");
const db = require("../../helpers/db");
const jwt = require("../../helpers/jwt");

const login = require("../login");

jest.mock("bcrypt");
jest.mock("../../helpers/logger");
jest.mock("../../helpers/db");
jest.mock("../../helpers/jwt");

describe("Login", () => {
  const dbSpy = jest.spyOn(db, "asyncQuery");
  const bcryptSpy = jest.spyOn(bcrypt, "compare");
  const jwtSpy = jest.spyOn(jwt, "getToken");
  const loggerInfoSpy = jest.spyOn(logger, "info");
  const loggerErrorSpy = jest.spyOn(logger, "error");

  const username = "foofoo";
  const password = "barbar";

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("will return success: false if no username is passed", async () => {
    const response = await login({});
    expect(response.success).toBe(false);
    expect(response.status).toBe(400);
    expect(response.message).toBeTruthy();
  });

  it("will return success: false if username but no password is passed", async () => {
    const response = await login({ username });
    expect(response.success).toBe(false);
    expect(response.status).toBe(400);
    expect(response.message).toBeTruthy();
  });

  it("will return success: false and activate: true user is not active", async () => {
    dbSpy.mockImplementationOnce(() => [{ active: 0 }]);
    expect(dbSpy).toHaveBeenCalledTimes(0);
    const response = await login({ username, password });
    expect(dbSpy).toHaveBeenCalledTimes(1);
    expect(dbSpy).toHaveBeenCalledWith(db.userSql.select, [username, username]);

    expect(response.activate).toBe(true);
    expect(response.success).toBe(false);
    expect(response.status).toBe(401);
    expect(response.message).toBeTruthy();
  });

  it("will return success: false if user cannot be found", async () => {
    dbSpy.mockImplementationOnce(() => []);
    expect(dbSpy).toHaveBeenCalledTimes(0);
    const response = await login({ username, password });
    expect(dbSpy).toHaveBeenCalledTimes(1);

    expect(response.success).toBe(false);
    expect(response.status).toBe(400);
    expect(response.message).toBeTruthy();
  });

  it("will return success: false if password comparison doesn't match", async () => {
    const savedPassword = "foobar";
    dbSpy.mockImplementationOnce(() => [
      { username, password: savedPassword, active: 1 }
    ]);

    expect(dbSpy).toHaveBeenCalledTimes(0);
    expect(bcryptSpy).toHaveBeenCalledTimes(0);
    const response = await login({ username, password });
    expect(dbSpy).toHaveBeenCalledTimes(2);
    expect(bcryptSpy).toHaveBeenCalledTimes(1);
    expect(bcryptSpy).toHaveBeenCalledWith(password, savedPassword);

    expect(response.success).toBe(false);
    expect(response.status).toBe(400);
    expect(response.message).toBeTruthy();
  });

  it("will return success: false if password comparison doesn't match", async () => {
    const savedPassword = "foobar";
    dbSpy.mockImplementationOnce(() => [
      { username, password: savedPassword, active: 1, attempts: 5 }
    ]);
    bcryptSpy.mockImplementationOnce((p1, p2) => p1 === p2);

    expect(dbSpy).toHaveBeenCalledTimes(0);
    expect(bcryptSpy).toHaveBeenCalledTimes(0);
    const response = await login({ username, password });
    expect(dbSpy).toHaveBeenCalledTimes(2);
    expect(bcryptSpy).toHaveBeenCalledTimes(1);
    expect(bcryptSpy).toHaveBeenCalledWith(password, savedPassword);

    expect(response.attempts).toBe(6);
    expect(response.success).toBe(false);
    expect(response.status).toBe(400);
    expect(response.message).toBeTruthy();
  });

  it("will return success: true if password comparison matches", async () => {
    const userRecord = {
      sub: 1,
      admin: 1,
      name: username,
      password,
      active: 1
    };
    const newToken = "New_Token";
    dbSpy.mockImplementationOnce(() => [userRecord]);
    bcryptSpy.mockImplementationOnce((p1, p2) => p1 === p2);
    jwtSpy.mockImplementationOnce(() => newToken);

    expect(dbSpy).toHaveBeenCalledTimes(0);
    expect(bcryptSpy).toHaveBeenCalledTimes(0);
    const response = await login({ username, password });
    expect(dbSpy).toHaveBeenCalledTimes(2);
    expect(bcryptSpy).toHaveBeenCalledTimes(1);
    expect(bcryptSpy).toHaveBeenCalledWith(password, password);

    const tokenData = {
      id: userRecord.sub,
      admin: true,
      username,
      last_login: expect.any(Number)
    };

    expect(loggerInfoSpy).toHaveBeenCalledTimes(1);
    expect(loggerInfoSpy).toHaveBeenCalledWith(tokenData);
    expect(jwtSpy).toHaveBeenCalledTimes(1);
    expect(jwtSpy).toHaveBeenCalledWith(tokenData);
    expect(response.success).toBe(true);
    expect(response.token).toBe(newToken);
  });

  it("will return success: false if too many attempts too quickly", async () => {
    const userRecord = {
      sub: 1,
      admin: 1,
      name: username,
      password,
      active: 1,
      attempts: 5,
      last_attempt: Date.now()
    };
    const error = new Error("There has been an error in bcrypt");

    dbSpy.mockImplementationOnce(() => [userRecord]);
    bcryptSpy.mockImplementationOnce(() => {
      throw error;
    });

    expect(dbSpy).toHaveBeenCalledTimes(0);
    expect(bcryptSpy).toHaveBeenCalledTimes(0);
    const response = await login({ username, password });
    expect(dbSpy).toHaveBeenCalledTimes(1);
    expect(bcryptSpy).toHaveBeenCalledTimes(1);

    expect(jwtSpy).toHaveBeenCalledTimes(0);
    expect(loggerErrorSpy).toHaveBeenCalledTimes(1);
    expect(loggerErrorSpy).toHaveBeenCalledWith(error);
    expect(response.attempts).toBe(undefined);
    expect(response.success).toBe(false);
    expect(response.error).toBe(error);
    expect(response.message).toBeTruthy();
    expect(response.status).toBe(500);
  });

  it("will return success: false if bcrypt throws an error", async () => {
    const userRecord = {
      sub: 1,
      admin: 1,
      name: username,
      password,
      active: 1
    };
    const error = new Error("There has been an error in bcrypt");

    dbSpy.mockImplementationOnce(() => [userRecord]);
    bcryptSpy.mockImplementationOnce(() => {
      throw error;
    });

    expect(dbSpy).toHaveBeenCalledTimes(0);
    expect(bcryptSpy).toHaveBeenCalledTimes(0);
    const response = await login({ username, password });
    expect(dbSpy).toHaveBeenCalledTimes(1);
    expect(bcryptSpy).toHaveBeenCalledTimes(1);

    expect(jwtSpy).toHaveBeenCalledTimes(0);
    expect(loggerErrorSpy).toHaveBeenCalledTimes(1);
    expect(loggerErrorSpy).toHaveBeenCalledWith(error);
    expect(response.attempts).toBe(undefined);
    expect(response.success).toBe(false);
    expect(response.error).toBe(error);
    expect(response.message).toBeTruthy();
    expect(response.status).toBe(500);
  });

  it("will return success: false if jwt.getToken throws an error", async () => {
    const userRecord = {
      sub: 1,
      admin: 1,
      name: username,
      password,
      active: 1
    };
    const error = new Error("There has been an error in bcrypt");

    dbSpy.mockImplementationOnce(() => [userRecord]);
    bcryptSpy.mockImplementationOnce((p1, p2) => p1 === p2);
    jwtSpy.mockImplementationOnce(() => {
      throw error;
    });

    expect(dbSpy).toHaveBeenCalledTimes(0);
    expect(bcryptSpy).toHaveBeenCalledTimes(0);
    const response = await login({ username, password });
    expect(dbSpy).toHaveBeenCalledTimes(2);
    expect(bcryptSpy).toHaveBeenCalledTimes(1);

    expect(jwtSpy).toHaveBeenCalledTimes(1);
    expect(loggerErrorSpy).toHaveBeenCalledTimes(1);
    expect(loggerErrorSpy).toHaveBeenCalledWith(error);
    expect(response.attempts).toBe(undefined);
    expect(response.success).toBe(false);
    expect(response.error).toBe(error);
    expect(response.message).toBeTruthy();
    expect(response.status).toBe(500);
  });
});
