import React from "react";

import { shallow } from "enzyme";

import { ResetForm } from "../resetForm";

import { reset } from "../../apiCalls";
jest.mock("../../apiCalls");

describe("ResetForm", () => {
  let props;
  let mountedResetForm;
  const resetForm = () => {
    if (!mountedResetForm) {
      mountedResetForm = shallow(<ResetForm {...props} />);
    }
    return mountedResetForm;
  };

  beforeEach(() => {
    reset.mockReset();
    props = {
      onReset: jest.fn(),
      token: ""
    };
    mountedResetForm = undefined;
  });

  it("renders in a dialog", () => {
    expect(resetForm().find("Dialog").length).toBe(1);
    expect(
      resetForm()
        .find("Dialog")
        .props().title
    ).toBe("Reset password");
  });

  it("renders 2 buttons", () => {
    const dialog = resetForm().find("Dialog");
    expect(
      dialog.props().leftButtons.length + dialog.props().rightButtons.length
    ).toBe(2);
  });

  it("renders a cancel button which resets the window.location.href", () => {
    const dialog = resetForm().find("Dialog");
    const cancelButton = dialog.props().leftButtons[0];

    expect(cancelButton.type.name).toBe("FlatButton");
    expect(cancelButton.props.label).toBe("Cancel");

    delete global.window.location;
    global.window.location = {
      href: "/?recover=1231231"
    };

    expect(window.location.href).toBe(global.window.location.href);
    cancelButton.props.onClick();
    expect(window.location.href).toBe("/");
  });

  it("renders a reset button that fires the reset api call", () => {
    const resetResponse = { success: false };
    reset.mockResolvedValue(resetResponse);

    props.token = "1234567890";
    const newState = { password: "foobar" };
    resetForm().setState(newState);

    const dialog = resetForm().find("Dialog");
    const resetButton = dialog.props().rightButtons[0];

    expect(reset).toHaveBeenCalledTimes(0);
    resetButton.props.onClick();
    expect(reset).toHaveBeenCalledTimes(1);
    expect(reset).toHaveBeenCalledWith(newState.password, props.token);
  });

  it("renders password and password confirmation textfields", () => {
    const textFields = resetForm().find("TextField");
    expect(textFields.length).toBe(2);
    expect(textFields.at(0).props().label).toBe("Password");
    expect(textFields.at(0).props().password).toBe(true);
    expect(textFields.at(1).props().label).toBe("Password confirmation");
    expect(textFields.at(1).props().password).toBe(true);
  });

  it("sets error props on the relevant textfields", () => {
    expect(
      resetForm()
        .find("TextField")
        .at(0)
        .props().error
    ).toBe(null);
    expect(
      resetForm()
        .find("TextField")
        .at(1)
        .props().error
    ).toBe(null);
    const errors = {
      passwordLengthError: "Password too short",
      passwordMatchError: "Passwords don't match"
    };
    resetForm().setState(errors);
    expect(
      resetForm()
        .find("TextField")
        .at(0)
        .props().error
    ).toBe(errors.passwordLengthError);
    expect(
      resetForm()
        .find("TextField")
        .at(1)
        .props().error
    ).toBe(errors.passwordMatchError);
  });

  it("sets password in state when the password TextField changed", () => {
    const passwordEvent = {
      target: { value: "new_password" }
    };
    expect(resetForm().instance().state.password).toBe("");
    resetForm()
      .find("TextField")
      .at(0)
      .simulate("change", passwordEvent);
    expect(resetForm().instance().state.password).toBe(
      passwordEvent.target.value
    );
  });

  it("sets confirmation in state when the password TextField changed", () => {
    const confirmationEvent = {
      target: { value: "new_password" }
    };
    expect(resetForm().instance().state.confirmation).toBe("");
    resetForm()
      .find("TextField")
      .at(1)
      .simulate("change", confirmationEvent);
    expect(resetForm().instance().state.confirmation).toBe(
      confirmationEvent.target.value
    );
  });

  it("sets passwordMatchError/passwordLengthError when the textfields don't match or are too short", () => {
    const passwordEvent = {
      target: { value: "new_password" }
    };
    const shortPasswordEvent = {
      target: { value: "" }
    };
    const confirmationEvent = {
      target: { value: "new_password" }
    };
    expect(resetForm().instance().state.passwordMatchError).toBe(null);
    resetForm()
      .instance()
      .onPasswordChange(passwordEvent);
    expect(resetForm().instance().state.passwordMatchError).not.toBe(null);
    expect(resetForm().instance().state.passwordLengthError).toBe(null);
    resetForm()
      .instance()
      .onConfirmationChange(confirmationEvent);
    expect(resetForm().instance().state.passwordMatchError).toBe(null);
    expect(resetForm().instance().state.passwordLengthError).toBe(null);
    resetForm()
      .instance()
      .onPasswordChange(shortPasswordEvent);
    expect(resetForm().instance().state.passwordMatchError).not.toBe(null);
    expect(resetForm().instance().state.passwordLengthError).not.toBe(null);
  });

  it("only calls reset when there are no errors", async () => {
    const resetResponse = { success: false };
    reset.mockResolvedValue(resetResponse);

    resetForm().setState({
      passwordMatchError: "Passwords do not match",
      passwordLengthError: "password too short"
    });
    expect(reset).toHaveBeenCalledTimes(0);
    await resetForm()
      .instance()
      .onReset();
    expect(reset).toHaveBeenCalledTimes(0);

    resetForm().setState({
      passwordMatchError: "",
      passwordLengthError: "password too short"
    });
    expect(reset).toHaveBeenCalledTimes(0);
    await resetForm()
      .instance()
      .onReset();
    expect(reset).toHaveBeenCalledTimes(0);

    resetForm().setState({
      passwordMatchError: "Passwords do not match",
      passwordLengthError: ""
    });
    expect(reset).toHaveBeenCalledTimes(0);
    await resetForm()
      .instance()
      .onReset();
    expect(reset).toHaveBeenCalledTimes(0);

    resetForm().setState({ passwordMatchError: "", passwordLengthError: "" });
    expect(reset).toHaveBeenCalledTimes(0);
    await resetForm()
      .instance()
      .onReset();
    expect(reset).toHaveBeenCalledTimes(1);
  });

  it("sets errors in the state if the reset call fails", async () => {
    const resetResponse = { success: false, message: "error during reset" };
    reset.mockResolvedValue(resetResponse);

    expect(resetForm().instance().state.errors.length).toBe(0);
    expect(reset).toHaveBeenCalledTimes(0);
    await resetForm()
      .instance()
      .onReset();
    expect(reset).toHaveBeenCalledTimes(1);
    expect(resetForm().instance().state.errors[0]).toBe(resetResponse.message);
  });

  it("sets unknown error in the state if the reset call fails without a message", async () => {
    const resetResponse = { success: false };
    reset.mockResolvedValue(resetResponse);

    expect(resetForm().instance().state.errors.length).toBe(0);
    expect(reset).toHaveBeenCalledTimes(0);
    await resetForm()
      .instance()
      .onReset();
    expect(reset).toHaveBeenCalledTimes(1);
    expect(resetForm().instance().state.errors[0]).toBe("Unknown error");
  });

  it("does not call props.onReset if reset fails", async () => {
    const resetResponse = { success: false };
    reset.mockResolvedValue(resetResponse);

    expect(props.onReset).toHaveBeenCalledTimes(0);
    expect(reset).toHaveBeenCalledTimes(0);
    await resetForm()
      .instance()
      .onReset();
    expect(reset).toHaveBeenCalledTimes(1);
    expect(props.onReset).toHaveBeenCalledTimes(0);
  });

  it("calls props.onReset if reset is successful", async () => {
    const resetResponse = { success: true };
    reset.mockResolvedValue(resetResponse);
    expect(props.onReset).toHaveBeenCalledTimes(0);
    expect(reset).toHaveBeenCalledTimes(0);
    await resetForm()
      .instance()
      .onReset();
    expect(reset).toHaveBeenCalledTimes(1);
    expect(props.onReset).toHaveBeenCalledTimes(1);
  });
});
