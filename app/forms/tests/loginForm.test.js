import React from "react";

import { shallow } from "enzyme";

import { LoginForm } from "../loginForm";

import { login } from "../../apiCalls";
jest.mock("../../apiCalls");

describe("LoginForm", () => {
  let props;
  let mountedLoginForm;
  const loginForm = () => {
    if (!mountedLoginForm) {
      mountedLoginForm = shallow(<LoginForm {...props} />);
    }
    return mountedLoginForm;
  };

  beforeEach(() => {
    login.mockReset();
    props = {
      onRetryActivation: jest.fn(),
      showChangePassword: jest.fn(),
      showSignUp: jest.fn()
    };
    mountedLoginForm = undefined;
  });

  it("renders in a dialog", () => {
    expect(loginForm().find("Dialog").length).toBe(1);
    expect(
      loginForm()
        .find("Dialog")
        .props().title
    ).toBe("Authentication");
  });

  it("renders 3 buttons", () => {
    const dialog = loginForm().find("Dialog");
    expect(
      dialog.props().leftButtons.length + dialog.props().rightButtons.length
    ).toBe(3);
  });

  it("renders a change password button that fires showFChangePassword", () => {
    const dialog = loginForm().find("Dialog");
    const changeButton = dialog.props().leftButtons[0];

    expect(changeButton.type.name).toBe("FlatButton");
    expect(changeButton.props.label).toBe("Change password");
    expect(props.showChangePassword).toHaveBeenCalledTimes(0);
    changeButton.props.onClick();
    expect(props.showChangePassword).toHaveBeenCalledTimes(1);
  });

  it("renders a sign up button that fires showSignUp", () => {
    const dialog = loginForm().find("Dialog");
    const signUpButton = dialog.props().leftButtons[1];

    expect(signUpButton.type.name).toBe("FlatButton");
    expect(signUpButton.props.label).toBe("Sign up");
    expect(props.showSignUp).toHaveBeenCalledTimes(0);
    signUpButton.props.onClick();
    expect(props.showSignUp).toHaveBeenCalledTimes(1);
  });

  it("renders a login button", () => {
    const dialog = loginForm().find("Dialog");
    const loginButton = dialog.props().rightButtons[0];

    expect(loginButton.type.name).toBe("RaisedButton");
    expect(loginButton.props.label).toBe("Login");
  });

  it("renders username and password textFields", () => {
    const textFields = loginForm().find("TextField");
    expect(textFields.length).toBe(2);
    expect(textFields.get(0).props.label).toBe("Username or Email");
    expect(textFields.get(1).props.label).toBe("Password");
    expect(textFields.get(1).props.password).toBe(true);
  });

  it("sets the username and password state when the textfields change", () => {
    const usernameEvent = {
      target: { value: "test_username" }
    };
    const passwordEvent = {
      target: { value: "test_username" }
    };

    expect(loginForm().instance().state.username).toBe("");
    loginForm()
      .find("TextField")
      .at(0)
      .simulate("change", usernameEvent);
    expect(loginForm().instance().state.username).toBe(
      usernameEvent.target.value
    );

    expect(loginForm().instance().state.password).toBe("");
    loginForm()
      .find("TextField")
      .at(1)
      .simulate("change", passwordEvent);
    expect(loginForm().instance().state.password).toBe(
      passwordEvent.target.value
    );
  });

  it("changes the textFields value when the state changes", () => {
    expect(
      loginForm()
        .find("TextField")
        .at(0)
        .props().value
    ).toBe("");
    loginForm().setState({ username: "foo" });
    expect(
      loginForm()
        .find("TextField")
        .at(0)
        .props().value
    ).toBe("foo");

    expect(
      loginForm()
        .find("TextField")
        .at(1)
        .props().value
    ).toBe("");
    loginForm().setState({ password: "bar" });
    expect(
      loginForm()
        .find("TextField")
        .at(1)
        .props().value
    ).toBe("bar");
  });

  it("renders a login button that fires the login api call", () => {
    const loginResponse = { success: false };
    login.mockResolvedValue(loginResponse);

    const newState = { username: "foo@bar.moo", password: "foobar" };
    loginForm().setState(newState);

    const dialog = loginForm().find("Dialog");
    const loginButton = dialog.props().rightButtons[0];

    expect(login).toHaveBeenCalledTimes(0);
    loginButton.props.onClick();
    expect(login).toHaveBeenCalledTimes(1);
    expect(login).toHaveBeenCalledWith(newState);
  });

  it("calls onRetryActivation if login returns success: false and activate", async () => {
    const loginResponse = { success: false, activate: true };
    login.mockResolvedValue(loginResponse);

    loginForm().setState({ username: "foofoo" });
    expect(props.onRetryActivation).toHaveBeenCalledTimes(0);
    await loginForm()
      .instance()
      .onLogin();
    expect(props.onRetryActivation).toHaveBeenCalledTimes(1);
    expect(props.onRetryActivation).toHaveBeenCalledWith(
      loginForm().instance().state.username
    );
  });

  it("sets errors if login returns success: false and a message", async () => {
    const loginResponse = { success: false, message: "no account found" };
    login.mockResolvedValue(loginResponse);

    await loginForm()
      .instance()
      .onLogin();
    expect(props.onRetryActivation).toHaveBeenCalledTimes(0);
    expect(loginForm().instance().state.errors[0]).toBe(loginResponse.message);
  });

  it("sets errors if login returns success: false and messages", async () => {
    const loginResponse = {
      success: false,
      messages: ["invalid password", "invalid username"]
    };
    login.mockResolvedValue(loginResponse);

    await loginForm()
      .instance()
      .onLogin();
    expect(props.onRetryActivation).toHaveBeenCalledTimes(0);
    expect(loginForm().instance().state.errors).toBe(loginResponse.messages);
  });

  it("passes any errors to the dialog", () => {
    const errors = ["lots of errors"];
    expect(
      loginForm()
        .find("Dialog")
        .props().errors.length
    ).toBe(0);
    loginForm().setState({ errors });
    expect(
      loginForm()
        .find("Dialog")
        .props().errors
    ).toBe(errors);
  });
});
