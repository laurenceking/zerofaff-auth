const bcrypt = require("bcrypt");
const logger = require("../../helpers/logger");
const db = require("../../helpers/db");
const mail = require("../../helpers/email");

const signup = require("../signup");

jest.mock("bcrypt");
jest.mock("../../helpers/logger");
jest.mock("../../helpers/db");
jest.mock("../../helpers/email");

describe("Signup", () => {
  const dbSpy = jest.spyOn(db, "asyncQuery");
  const bcryptSpy = jest.spyOn(bcrypt, "hashSync");
  const mailSpy = jest.spyOn(mail, "sendActivation");
  const loggerErrorSpy = jest.spyOn(logger, "error");

  const username = "foofoo";
  const email = "foobar";
  const password = "barbar";

  beforeEach(() => {
    jest.resetAllMocks();
    dbSpy.mockRestore();
  });

  it("will return success: false and messages if no username, email, password is passed", async () => {
    const response = await signup({});
    expect(dbSpy).toHaveBeenCalledTimes(0);
    expect(response.success).toBe(false);
    expect(response.status).toBe(400);
    expect(response.message.username).toBeTruthy();
    expect(response.message.password).toBeTruthy();
    expect(response.message.email).toBeTruthy();
  });

  it("will return success: false if username or email already registered", async () => {
    dbSpy.mockImplementationOnce(() => ["boo"]);

    const response = await signup({ username, email, password });
    expect(dbSpy).toHaveBeenCalledTimes(1);
    expect(dbSpy).toHaveBeenCalledWith(db.userSql.selectNoPassword, [
      username,
      email
    ]);
    expect(response.success).toBe(false);
    expect(response.status).toBe(409);
    expect(response.message).toBeTruthy();
  });

  it("will return success: false if insert fails", async () => {
    dbSpy.mockImplementation(query => (query === db.userSql.insert ? {} : []));
    bcryptSpy.mockImplementationOnce(() => "password_hash");

    const response = await signup({ username, email, password });
    expect(dbSpy).toHaveBeenCalledTimes(2);
    expect(bcryptSpy).toHaveBeenCalledWith(password, 8);
    expect(response.success).toBe(false);
    expect(response.status).toBe(500);
    expect(response.message).toBeTruthy();
  });

  it("will return success: false if activation email fails to send", async () => {
    const insertId = 1;
    dbSpy.mockImplementation(query =>
      query === db.userSql.insert ? { insertId } : []
    );
    bcryptSpy.mockImplementationOnce(() => "password_hash");
    mailSpy.mockImplementationOnce(() => false);

    const response = await signup({ username, email, password });
    expect(dbSpy).toHaveBeenCalledTimes(2);
    expect(bcryptSpy).toHaveBeenCalledWith(password, 8);
    expect(mailSpy).toHaveBeenCalledWith({ email, id: insertId });
    expect(response.success).toBe(false);
    expect(response.status).toBe(500);
    expect(response.activate).toBe(true);
    expect(response.message).toBeTruthy();
  });

  it("will return success: false if an error is thrown", async () => {
    const error = new Error("Unexpected error");
    dbSpy.mockImplementationOnce(() => []);
    bcryptSpy.mockImplementationOnce(() => {
      throw error;
    });

    const response = await signup({ username, email, password });
    expect(dbSpy).toHaveBeenCalledTimes(1);
    expect(bcryptSpy).toHaveBeenCalledWith(password, 8);
    expect(mailSpy).toHaveBeenCalledTimes(0);
    expect(loggerErrorSpy).toHaveBeenCalledWith(error);
    expect(response.success).toBe(false);
    expect(response.status).toBe(500);
    expect(response.message).toBe(error.message);
  });

  it("will return success: true the user is inserted and the email sent", async () => {
    const insertId = 1;
    dbSpy.mockImplementation(query =>
      query === db.userSql.insert ? { insertId } : []
    );
    bcryptSpy.mockImplementationOnce(() => "password_hash");
    mailSpy.mockImplementationOnce(() => true);

    const response = await signup({ username, email, password });
    expect(dbSpy).toHaveBeenCalledTimes(2);
    expect(bcryptSpy).toHaveBeenCalledWith(password, 8);
    expect(mailSpy).toHaveBeenCalledWith({ email, id: insertId });
    expect(loggerErrorSpy).toHaveBeenCalledTimes(0);
    expect(response.success).toBe(true);
    expect(response.message).toBe(undefined);
  });
});
