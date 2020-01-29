import React from "react";

import { shallow } from "enzyme";

import {
  Main,
  ACTIVATION,
  CHANGE_PASSWORD,
  LOGIN,
  RESET,
  SIGN_UP
} from "../main";

jest.mock("../variables");

describe("Main", () => {
  let mountedMain;

  const main = () => {
    if (!mountedMain) {
      mountedMain = shallow(<Main />);
    }
    return mountedMain;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mountedMain = undefined;
  });

  it("renders LOGIN page by default", () => {
    expect(main().state().form).toBe(LOGIN);
    expect(main().find("LoginForm").length).toBe(1);
  });

  it("renders ACTIVATION page if token in the location", () => {
    const token = "123123123";
    const spy = jest
      .spyOn(URLSearchParams.prototype, "get")
      .mockImplementation(key => (key === "token" ? token : null));
    expect(main().state().form).toBe(ACTIVATION);
    expect(main().state().token).toBe(token);
    expect(main().find("ActivationForm").length).toBe(1);
    spy.mockRestore();
  });

  it("renders RESET page if token in the location", () => {
    const recover = "456456456";
    const spy = jest
      .spyOn(URLSearchParams.prototype, "get")
      .mockImplementation(key => (key === "recover" ? recover : null));
    expect(main().state().form).toBe(RESET);
    expect(main().state().token).toBe(recover);
    expect(main().find("ResetForm").length).toBe(1);
    spy.mockRestore();
  });

  it("renders LOGIN when onActivated is called with username", () => {
    const username = "foofoobar";
    const activationMessage = "Account activated";
    main()
      .instance()
      .onActivated(username);
    expect(main().state().username).toBe(username);
    expect(main().state().message).toBe(activationMessage);
    expect(main().state().form).toBe(LOGIN);
    expect(
      main()
        .text()
        .indexOf(activationMessage)
    ).toBe(0);
    expect(
      main()
        .find("LoginForm")
        .props().username
    ).toBe(username);
  });

  it("renders LOGIN when onReset", () => {
    const resetMessage = "Password updated";
    main().setState({ token: "123123" });
    main()
      .instance()
      .onReset();
    expect(main().state().token).toBe(null);
    expect(main().state().username).toBe(null);
    expect(main().state().message).toBe(resetMessage);
    expect(main().state().form).toBe(LOGIN);
    expect(
      main()
        .text()
        .indexOf(resetMessage)
    ).toBe(0);
    expect(main().find("LoginForm").length).toBe(1);
    expect(
      main()
        .find("LoginForm")
        .props().username
    ).toBe(null);
  });

  it("renders LOGIN when onCancel", () => {
    main().setState({ token: "123123" });
    main()
      .instance()
      .onCancel();
    expect(main().state().token).toBe(null);
    expect(main().state().username).toBe(null);
    expect(main().state().message).toBe(null);
    expect(main().state().form).toBe(LOGIN);
    expect(main().find("LoginForm").length).toBe(1);
    expect(
      main()
        .find("LoginForm")
        .props().username
    ).toBe(null);
  });

  it("renders LOGIN when onSignUp is called with username", () => {
    const username = "foofoobar";
    const signUpMessage =
      "Sign up successful, you have been sent an email to activate your account";
    main()
      .instance()
      .onSignUp(username);
    expect(main().state().username).toBe(username);
    expect(main().state().message).toBe(signUpMessage);
    expect(main().state().form).toBe(LOGIN);
    expect(
      main()
        .text()
        .indexOf(signUpMessage)
    ).toBe(0);
    expect(
      main()
        .find("LoginForm")
        .props().username
    ).toBe(username);
  });

  it("renders ACTIVATION when onRetryActivation is called with username", () => {
    const username = "foofoobar";
    main()
      .instance()
      .onRetryActivation(username);
    expect(main().state().username).toBe(username);
    expect(main().state().token).toBe(null);
    expect(main().state().message).toBe(null);
    expect(main().state().form).toBe(ACTIVATION);
    const form = main().find("ActivationForm");
    expect(form.props().username).toBe(username);
    expect(form.props().token).toBe(null);
  });

  it("passes token and username to ActivationForm", () => {
    const newState = {
      form: ACTIVATION,
      token: "123456789",
      username: "foobar"
    };
    main().setState(newState);
    const form = main().find("ActivationForm");
    expect(form.length).toBe(1);
    expect(form.props().username).toBe(newState.username);
    expect(form.props().token).toBe(newState.token);
  });

  it("renders SIGN_UP when showSignUp", () => {
    main()
      .instance()
      .showSignUp();
    expect(main().state().username).toBe(null);
    expect(main().state().token).toBe(null);
    expect(main().state().message).toBe(null);
    expect(main().state().form).toBe(SIGN_UP);
    expect(main().find("SignUpForm").length).toBe(1);
  });

  it("renders CHANGE_PASSWORD when showChangePassword", () => {
    main()
      .instance()
      .showChangePassword();
    expect(main().state().username).toBe(null);
    expect(main().state().token).toBe(null);
    expect(main().state().message).toBe(null);
    expect(main().state().form).toBe(CHANGE_PASSWORD);
    expect(main().find("ChangePasswordForm").length).toBe(1);
  });
});
