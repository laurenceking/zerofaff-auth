const email = require("../email");

const nodemailer = require("nodemailer");
const logger = require("../logger");
const jwt = require("../jwt");
const { emailContent } = require("../../../config");

jest.mock("nodemailer");
jest.mock("../logger");
jest.mock("../jwt");

describe("email", () => {
  const loggerSpy = jest.spyOn(logger, "log");

  const sendMailSpy = jest.fn();
  sendMailSpy.mockImplementation(() => true);

  const transportSpy = jest.spyOn(nodemailer, "createTransport");
  transportSpy.mockImplementation(() => ({ sendMail: sendMailSpy }));

  const hash = "tokenHash";
  const jwtSpy = jest.spyOn(jwt, "getToken").mockImplementation(() => hash);
  const data = {
    id: 1,
    email: "foobar"
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("sendActivation", () => {
    it("creates a token and returns a promise", () => {
      const promise = email.sendActivation(data);
      expect(jwtSpy).toHaveBeenCalledTimes(1);
      expect(jwtSpy).toHaveBeenCalledWith(data);
      expect(promise.constructor.name).toBe("Promise");
    });

    it("calls send with the correct properties", async () => {
      const sent = await email.sendActivation(data);
      expect(transportSpy).toHaveBeenCalledWith({
        logger: false,
        newline: "windows",
        sendmail: true
      });
      expect(sendMailSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          from: emailContent.from,
          to: data.email,
          subject: emailContent.activate.subject,
          text: emailContent.activate.text(hash),
          html: emailContent.activate.html(hash)
        })
      );
      expect(loggerSpy).toHaveBeenCalledTimes(0);
      expect(sent).toBe(true);
    });

    it("logs an error and returns false if an error is thrown in the sendMail", async () => {
      const error = new Error("unexpected error");
      sendMailSpy.mockImplementationOnce(() => {
        throw error;
      });

      const sent = await email.sendActivation(data);
      expect(loggerSpy).toHaveBeenCalledTimes(1);
      expect(loggerSpy).toHaveBeenCalledWith("email-error", error);
      expect(sent).toBe(false);
    });
  });

  describe("sendRecovery", () => {
    it("calls send with the correct properties", async () => {
      const sent = await email.sendRecovery(data);
      expect(transportSpy).toHaveBeenCalledWith({
        logger: false,
        newline: "windows",
        sendmail: true
      });
      expect(sendMailSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          from: emailContent.from,
          to: data.email,
          subject: emailContent.recover.subject,
          text: emailContent.recover.text(hash),
          html: emailContent.recover.html(hash)
        })
      );
      expect(loggerSpy).toHaveBeenCalledTimes(0);
      expect(sent).toBe(true);
    });
  });
});
