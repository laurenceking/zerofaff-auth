const mysql = require("mysql");
const logger = require("../logger");
const db = require("../db");

jest.mock("mysql");
jest.mock("../logger");

describe("db", () => {
  let error = undefined;
  let rows = null;
  let query = "foo";
  let vars = "bar";
  let debug = false;

  const poolObj = { sql: "SELECT * FROM blah" };
  const querySpy = jest.fn();
  querySpy.mockImplementation((query, vars, callback) =>
    callback.bind(poolObj)(error, rows)
  );

  const mysqlSpy = jest.spyOn(mysql, "createPool");
  mysqlSpy.mockImplementation(() => ({ query: querySpy }));

  const loggerSpy = jest.spyOn(logger, "error");

  beforeEach(() => {
    jest.clearAllMocks();
    error = undefined;
    rows = null;
    query = "foo";
    vars = "bar";
    debug = false;
  });

  it("will return a promise from asyncQuery", () => {
    const promise = db.asyncQuery(query, vars, debug);
    expect(mysqlSpy).toHaveBeenCalledTimes(1);
    expect(querySpy).toHaveBeenCalledTimes(1);
    expect(promise.constructor.name).toBe("Promise");
  });

  it("will not recreate the pool as createPool has already been called", async () => {
    await db.asyncQuery(query, vars, debug);
    expect(mysqlSpy).toHaveBeenCalledTimes(0);
  });

  it("will call query with the passed in query and vars", async () => {
    await db.asyncQuery(query, vars, debug);
    expect(mysqlSpy).toHaveBeenCalledTimes(0);
    expect(querySpy).toHaveBeenCalledTimes(1);
    expect(querySpy).toHaveBeenCalledWith(query, vars, expect.any(Function));
  });

  it("will reject the promise if an error is passed to the query callback", async () => {
    error = "Unexpected error";

    try {
      await db.asyncQuery(query, vars, debug);
      expect(true).toBe(false);
    } catch (err) {
      expect(err).toBe(error);
    }
    expect(loggerSpy).toHaveBeenCalledTimes(1);
  });

  it("will resolve the promise if no error is passed to the query callback", async () => {
    rows = "some kind of returned value";

    let response = null;
    try {
      response = await db.asyncQuery(query, vars, debug);
    } catch (err) {
      expect(false).toBe(true);
    }
    expect(response).toBe(rows);
    expect(loggerSpy).toHaveBeenCalledTimes(0);
  });

  it("will not call console.log if debug is false", async () => {
    const consoleSpy = jest.spyOn(console, "log");

    await db.asyncQuery(query, vars, debug);
    expect(mysqlSpy).toHaveBeenCalledTimes(0);
    expect(querySpy).toHaveBeenCalledTimes(1);
    expect(consoleSpy).toHaveBeenCalledTimes(0);
  });

  it("will call console.log if debug is true", async () => {
    debug = true;

    const consoleSpy = jest.spyOn(console, "log");
    consoleSpy.mockImplementationOnce(() => {});

    await db.asyncQuery(query, vars, debug);
    expect(mysqlSpy).toHaveBeenCalledTimes(0);
    expect(querySpy).toHaveBeenCalledTimes(1);
    expect(consoleSpy).toHaveBeenCalledTimes(1);
    expect(consoleSpy).toHaveBeenCalledWith(poolObj.sql);
  });
});
