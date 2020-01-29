const bcrypt = require("bcrypt");
const db = require("../../helpers/db");
const utils = require("../../helpers/utils");

const change = require("../change");

jest.mock("bcrypt");
jest.mock("../../helpers/utils");
jest.mock("../../helpers/logger");
jest.mock("../../helpers/db");

describe("Change", () => {
  const dbSpy = jest.spyOn(db, "asyncQuery");
  const hashSpy = jest.spyOn(bcrypt, "hashSync");
  const compareSpy = jest.spyOn(bcrypt, "compare");
  const validateSpy = jest.spyOn(utils, "validatePassword");

  const username = "foofoo";
  const password = "barbar";
  const newPassword = "moomoo";

  beforeEach(() => {
    jest.resetAllMocks();
    dbSpy.mockRestore();
  });

  it("will return success: false and messages if no username, email, password is passed", async () => {
    const response = await change.password({});
    expect(validateSpy).toHaveBeenCalledTimes(0);
    expect(dbSpy).toHaveBeenCalledTimes(0);
    expect(response.success).toBe(false);
    expect(response.status).toBe(400);
    expect(response.message).toBeTruthy();
  });

  it("will return success: false if newPassword is not valid", async () => {
    const validateResponse = { valid: false, message: "No Comment" };
    validateSpy.mockImplementationOnce(() => validateResponse);

    const response = await change.password({ username, password, newPassword });
    expect(validateSpy).toHaveBeenCalledTimes(1);
    expect(validateSpy).toHaveBeenCalledWith(newPassword);
    expect(dbSpy).toHaveBeenCalledTimes(0);
    expect(response.success).toBe(false);
    expect(response.status).toBe(400);
    expect(response.message).toBe(validateResponse.message);
  });

  it("will return success: false if select cannot find user", async () => {
    validateSpy.mockImplementationOnce(() => ({ valid: true }));
    dbSpy.mockImplementation(() => []);
    const response = await change.password({ username, password, newPassword });
    expect(validateSpy).toHaveBeenCalledTimes(1);
    expect(dbSpy).toHaveBeenCalledTimes(1);
    expect(compareSpy).toHaveBeenCalledTimes(0);
    expect(response.success).toBe(false);
    expect(response.status).toBe(400);
    expect(response.message).toBeTruthy();
  });

  it("will return success: false if user is not active", async () => {
    validateSpy.mockImplementationOnce(() => ({ valid: true }));
    const dbUser = { id: 1, active: 0 };
    dbSpy.mockImplementation(() => [dbUser]);
    const response = await change.password({ username, password, newPassword });
    expect(validateSpy).toHaveBeenCalledTimes(1);
    expect(dbSpy).toHaveBeenCalledTimes(1);
    expect(compareSpy).toHaveBeenCalledTimes(0);
    expect(response.success).toBe(false);
    expect(response.activate).toBe(true);
    expect(response.status).toBe(401);
    expect(response.message).toBeTruthy();
  });

  it("will return success: false if bcrypt does not match the password", async () => {
    validateSpy.mockImplementationOnce(() => ({ valid: true }));
    const dbUser = { id: 1, active: 1, password: "non-matching-password" };
    dbSpy.mockImplementation(() => [dbUser]);
    compareSpy.mockImplementationOnce(() => false);

    const response = await change.password({ username, password, newPassword });
    expect(validateSpy).toHaveBeenCalledTimes(1);
    expect(dbSpy).toHaveBeenCalledTimes(1);
    expect(compareSpy).toHaveBeenCalledTimes(1);
    expect(compareSpy).toHaveBeenCalledWith(password, dbUser.password);
    expect(response.success).toBe(false);
    expect(response.status).toBe(400);
    expect(response.message).toBeTruthy();
  });

  it("will return success: false if the new password is hashed but not inserted into the database", async () => {
    validateSpy.mockImplementationOnce(() => ({ valid: true }));
    const dbUser = { id: 1, active: 1, password };
    dbSpy.mockImplementation(query =>
      query === db.userSql.updatePassword ? { affectedRows: 0 } : [dbUser]
    );
    compareSpy.mockImplementationOnce(() => true);

    const response = await change.password({ username, password, newPassword });
    expect(validateSpy).toHaveBeenCalledTimes(1);
    expect(compareSpy).toHaveBeenCalledTimes(1);
    expect(compareSpy).toHaveBeenCalledWith(password, password);
    expect(hashSpy).toHaveBeenCalledTimes(1);
    expect(hashSpy).toHaveBeenCalledWith(newPassword, 8);
    expect(dbSpy).toHaveBeenCalledTimes(2);
    expect(response.error).toBeTruthy();
    expect(response.success).toBe(false);
    expect(response.status).toBe(500);
    expect(response.message).toBeTruthy();
  });

  it("will return success: false if hashing throws an error", async () => {
    validateSpy.mockImplementationOnce(() => ({ valid: true }));
    const dbUser = { id: 1, active: 1, password };
    dbSpy.mockImplementation(query =>
      query === db.userSql.updatePassword ? { affectedRows: 0 } : [dbUser]
    );
    compareSpy.mockImplementationOnce(() => true);
    hashSpy.mockImplementationOnce(() => {
      throw Error("hasing error");
    });

    const response = await change.password({ username, password, newPassword });
    expect(validateSpy).toHaveBeenCalledTimes(1);
    expect(compareSpy).toHaveBeenCalledTimes(1);
    expect(compareSpy).toHaveBeenCalledWith(password, password);
    expect(hashSpy).toHaveBeenCalledTimes(1);
    expect(dbSpy).toHaveBeenCalledTimes(1);
    expect(response.error).toBeTruthy();
    expect(response.success).toBe(false);
    expect(response.status).toBe(500);
    expect(response.message).toBeTruthy();
  });
});
