import React from "react";

import { shallow } from "enzyme";

import { SignUpForm } from "../signUpForm";

import { checkEmail, checkUsername, signUp } from "../../apiCalls";
jest.mock("../../apiCalls");

describe("SignUpForm", () => {
  let props;
  let mountedSignUpForm;
  const signUpForm = () => {
    if (!mountedSignUpForm) {
      mountedSignUpForm = shallow(<SignUpForm {...props} />);
    }
    return mountedSignUpForm;
  };

  beforeEach(() => {
    checkEmail.mockReset();
    checkUsername.mockReset();
    signUp.mockReset();
    props = {
      onCancel: jest.fn(),
      onRetryActivate: jest.fn(),
      onSignUp: jest.fn()
    };
    mountedSignUpForm = undefined;
  });

  it("renders in a dialog", () => {
    expect(signUpForm().find("Dialog").length).toBe(1);
    expect(
      signUpForm()
        .find("Dialog")
        .props().title
    ).toBe("Sign up");
  });

  it("renders 2 buttons", () => {
    const dialog = signUpForm().find("Dialog");
    expect(
      dialog.props().leftButtons.length + dialog.props().rightButtons.length
    ).toBe(2);
  });

  it("renders a cancel button that fires onCancel", () => {
    const dialog = signUpForm().find("Dialog");
    const cancelButton = dialog.props().leftButtons[0];

    expect(cancelButton.type.name).toBe("FlatButton");
    expect(cancelButton.props.label).toBe("Cancel");
    expect(props.onCancel).toHaveBeenCalledTimes(0);
    cancelButton.props.onClick();
    expect(props.onCancel).toHaveBeenCalledTimes(1);
  });

  it("renders a signUp button that fires the signUp api call", () => {
    const SignUpResponse = { success: false };
    signUp.mockResolvedValue(SignUpResponse);

    const newState = { username: "foo", email: "bar", password: "foobar" };
    signUpForm().setState(newState);

    const dialog = signUpForm().find("Dialog");
    const signUpButton = dialog.props().rightButtons[0];

    expect(signUp).toHaveBeenCalledTimes(0);
    signUpButton.props.onClick();
    expect(signUp).toHaveBeenCalledTimes(1);
    expect(signUp).toHaveBeenCalledWith(newState);
  });

  it("renders username, email, password and password confirmation textfields", () => {
    const textFields = signUpForm().find("TextField");
    expect(textFields.length).toBe(4);
    expect(textFields.at(0).props().label).toBe("Username");
    expect(textFields.at(1).props().label).toBe("Email");
    expect(textFields.at(2).props().label).toBe("Password");
    expect(textFields.at(2).props().password).toBe(true);
    expect(textFields.at(3).props().label).toBe("Password confirmation");
    expect(textFields.at(3).props().password).toBe(true);
  });

  it("sets error props on the relevant textfields", () => {
    expect(
      signUpForm()
        .find("TextField")
        .at(0)
        .props().error
    ).toBe(null);
    expect(
      signUpForm()
        .find("TextField")
        .at(1)
        .props().error
    ).toBe(null);
    expect(
      signUpForm()
        .find("TextField")
        .at(2)
        .props().error
    ).toBe(null);
    expect(
      signUpForm()
        .find("TextField")
        .at(3)
        .props().error
    ).toBe(null);
    const errors = {
      usernameError: "Username required",
      emailError: "Email required",
      passwordError: "Password too short",
      confirmationError: "Passwords don't match"
    };
    signUpForm().setState(errors);
    const textFields = signUpForm().find("TextField");
    expect(textFields.at(0).props().error).toBe(errors.usernameError);
    expect(textFields.at(1).props().error).toBe(errors.emailError);
    expect(textFields.at(2).props().error).toBe(errors.passwordError);
    expect(textFields.at(3).props().error).toBe(errors.confirmationError);
  });

  it("sets username in state when the username TextField changed", () => {
    const usernameEvent = {
      target: { value: "foo foo boo" }
    };
    expect(signUpForm().instance().state.username).toBe("");
    signUpForm()
      .find("TextField")
      .at(0)
      .simulate("change", usernameEvent);
    expect(signUpForm().instance().state.username).toBe(
      usernameEvent.target.value
    );
  });

  it("sets email in state when the email TextField changed", () => {
    const emailEvent = {
      target: { value: "foo@foobar.moo" }
    };
    expect(signUpForm().instance().state.email).toBe("");
    signUpForm()
      .find("TextField")
      .at(1)
      .simulate("change", emailEvent);
    expect(signUpForm().instance().state.email).toBe(emailEvent.target.value);
  });

  it("sets password in state when the password TextField changed", () => {
    const passwordEvent = {
      target: { value: "new_password" }
    };
    expect(signUpForm().instance().state.password).toBe("");
    signUpForm()
      .find("TextField")
      .at(2)
      .simulate("change", passwordEvent);
    expect(signUpForm().instance().state.password).toBe(
      passwordEvent.target.value
    );
  });

  it("sets confirmation in state when the confirmation TextField changed", () => {
    const confirmationEvent = {
      target: { value: "new_password" }
    };
    expect(signUpForm().instance().state.confirmation).toBe("");
    signUpForm()
      .find("TextField")
      .at(3)
      .simulate("change", confirmationEvent);
    expect(signUpForm().instance().state.confirmation).toBe(
      confirmationEvent.target.value
    );
  });

  it("sets confirmationError when the textfields don't match after a password field blur event", () => {
    const passwordEvent = {
      target: { value: "new_password" }
    };
    expect(signUpForm().instance().state.passwordError).toBe(null);
    expect(signUpForm().instance().state.confirmationError).toBe(null);
    signUpForm()
      .find("TextField")
      .at(2)
      .simulate("change", passwordEvent)
      .simulate("blur");
    expect(signUpForm().instance().state.confirmationError).not.toBe(null);
    expect(signUpForm().instance().state.passwordError).toBe(null);
  });

  it("sets confirmationError when the textfields don't match after a confirmation field blur event", () => {
    const passwordEvent = {
      target: { value: "new_password" }
    };
    expect(signUpForm().instance().state.passwordError).toBe(null);
    expect(signUpForm().instance().state.confirmationError).toBe(null);
    signUpForm()
      .find("TextField")
      .at(3)
      .simulate("change", passwordEvent)
      .simulate("blur");
    expect(signUpForm().instance().state.confirmationError).not.toBe(null);
    expect(signUpForm().instance().state.passwordError).toBe(null);
  });

  it("sets passwordError when the password is too short on a blur event", () => {
    const passwordEvent = {
      target: { value: "short" }
    };
    signUpForm().setState({
      confirmation: "short"
    });
    expect(signUpForm().instance().state.passwordError).toBe(null);
    expect(signUpForm().instance().state.confirmationError).toBe(null);
    signUpForm()
      .find("TextField")
      .at(2)
      .simulate("change", passwordEvent)
      .simulate("blur");
    expect(signUpForm().instance().state.confirmationError).toBe(null);
    expect(signUpForm().instance().state.passwordError).not.toBe(null);
  });

  it("sets confirmationError when the password doesn't match the confirmation on a blur event", () => {
    const passwordEvent = {
      target: { value: "new_password" }
    };
    expect(signUpForm().instance().state.passwordError).toBe(null);
    expect(signUpForm().instance().state.confirmationError).toBe(null);
    signUpForm()
      .find("TextField")
      .at(2)
      .simulate("change", passwordEvent)
      .simulate("blur");
    expect(signUpForm().instance().state.confirmationError).not.toBe(null);
    expect(signUpForm().instance().state.passwordError).toBe(null);
  });

  it("only calls signup when there are no errors", async () => {
    const signUpResponse = { success: false };
    signUp.mockResolvedValue(signUpResponse);

    signUpForm().setState({
      confirmationError: "Passwords do not match",
      passwordError: "password too short"
    });
    expect(signUp).toHaveBeenCalledTimes(0);
    await signUpForm()
      .instance()
      .onSignUp();
    expect(signUp).toHaveBeenCalledTimes(0);

    signUpForm().setState({
      confirmationError: null,
      passwordError: "password too short"
    });
    expect(signUp).toHaveBeenCalledTimes(0);
    await signUpForm()
      .instance()
      .onSignUp();
    expect(signUp).toHaveBeenCalledTimes(0);

    signUpForm().setState({
      confirmationError: "Passwords do not match",
      passwordError: null
    });
    expect(signUp).toHaveBeenCalledTimes(0);
    await signUpForm()
      .instance()
      .onSignUp();
    expect(signUp).toHaveBeenCalledTimes(0);

    signUpForm().setState({
      usernameError: "Required",
      emailError: null,
      confirmationError: null,
      passwordError: null
    });
    expect(signUp).toHaveBeenCalledTimes(0);
    await signUpForm()
      .instance()
      .onSignUp();
    expect(signUp).toHaveBeenCalledTimes(0);

    signUpForm().setState({
      usernameError: null,
      emailError: "Required",
      confirmationError: null,
      passwordError: null
    });
    expect(signUp).toHaveBeenCalledTimes(0);
    await signUpForm()
      .instance()
      .onSignUp();
    expect(signUp).toHaveBeenCalledTimes(0);

    signUpForm().setState({
      usernameError: null,
      emailError: null,
      confirmationError: null,
      passwordError: null
    });
    expect(signUp).toHaveBeenCalledTimes(0);
    await signUpForm()
      .instance()
      .onSignUp();
    expect(signUp).toHaveBeenCalledTimes(1);
  });

  it("sets errors in the state if the signUp call fails", async () => {
    const signUpResponse = { success: false, message: "error during signUp" };
    signUp.mockResolvedValue(signUpResponse);

    expect(signUpForm().instance().state.errors.length).toBe(0);
    expect(signUp).toHaveBeenCalledTimes(0);
    await signUpForm()
      .instance()
      .onSignUp();
    expect(signUp).toHaveBeenCalledTimes(1);
    expect(signUpForm().instance().state.errors[0]).toBe(
      signUpResponse.message
    );
  });

  it("sets unknown error in the state if the signUp call fails without a message", async () => {
    const signUpResponse = { success: false };
    signUp.mockResolvedValue(signUpResponse);

    expect(signUpForm().instance().state.errors.length).toBe(0);
    expect(signUp).toHaveBeenCalledTimes(0);
    await signUpForm()
      .instance()
      .onSignUp();
    expect(signUp).toHaveBeenCalledTimes(1);
    expect(signUpForm().instance().state.errors[0]).toBe("Unknown error");
  });

  it("does not call props.onSignUp if signUp fails", async () => {
    const signUpResponse = { success: false };
    signUp.mockResolvedValue(signUpResponse);

    expect(props.onSignUp).toHaveBeenCalledTimes(0);
    expect(signUp).toHaveBeenCalledTimes(0);
    await signUpForm()
      .instance()
      .onSignUp();
    expect(signUp).toHaveBeenCalledTimes(1);
    expect(props.onSignUp).toHaveBeenCalledTimes(0);
  });

  it("calls props.onSignUp if signUp is successful", async () => {
    const signUpResponse = { success: true };
    signUp.mockResolvedValue(signUpResponse);

    const newState = { username: "foo", email: "bar", password: "boo" };
    signUpForm().setState(newState);

    expect(props.onSignUp).toHaveBeenCalledTimes(0);
    expect(signUp).toHaveBeenCalledTimes(0);
    await signUpForm()
      .instance()
      .onSignUp();
    expect(signUp).toHaveBeenCalledTimes(1);
    expect(props.onSignUp).toHaveBeenCalledTimes(1);
    expect(props.onSignUp).toHaveBeenCalledWith(newState.username);
  });

  it("calls props.onRetryActivate when signUp api call responds with activate", async () => {
    const signUpResponse = { success: false, activate: true };
    signUp.mockResolvedValue(signUpResponse);

    const newState = { username: "foo", email: "bar", password: "boo" };
    signUpForm().setState(newState);

    expect(props.onSignUp).toHaveBeenCalledTimes(0);
    expect(props.onRetryActivate).toHaveBeenCalledTimes(0);
    expect(signUp).toHaveBeenCalledTimes(0);
    await signUpForm()
      .instance()
      .onSignUp();
    expect(signUp).toHaveBeenCalledTimes(1);
    expect(props.onSignUp).toHaveBeenCalledTimes(0);
    expect(props.onRetryActivate).toHaveBeenCalledTimes(1);
    expect(props.onRetryActivate).toHaveBeenCalledWith(newState.username);
  });
});
