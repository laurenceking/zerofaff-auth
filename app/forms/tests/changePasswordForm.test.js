import React from "react";

import { shallow } from "enzyme";

import { ChangePasswordForm } from "../changePasswordForm";

import { recover } from "../../apiCalls";
jest.mock("../../apiCalls");

describe("ChangePasswordForm", () => {
  let props;
  let mountedChangeForm;
  const changeForm = () => {
    if (!mountedChangeForm) {
      mountedChangeForm = shallow(<ChangePasswordForm {...props} />);
    }
    return mountedChangeForm;
  };

  beforeEach(() => {
    recover.mockReset();
    props = {
      onCancel: jest.fn()
    };
    mountedChangeForm = undefined;
  });

  it("renders a dialog with 3 buttons and a 3 textfields", async () => {
    const dialog = changeForm().find("Dialog");
    expect(dialog.length).toBe(1);
    expect(dialog.props().leftButtons.length).toBe(1);
    expect(dialog.props().rightButtons.length).toBe(1);
    expect(dialog.find("TextField").length).toBe(3);
    expect(dialog.find("FlatButton").length).toBe(1);
  });

  it("sets the username in the state on input change", async () => {
    const event = {
      target: { value: "test_username" }
    };
    expect(changeForm().instance().state.username).toBe("");
    changeForm()
      .find("TextField")
      .at(0)
      .simulate("change", event);
    expect(changeForm().instance().state.username).toBe(event.target.value);
  });

  it("renders in a dialog", () => {
    expect(changeForm().find("Dialog").length).toBe(1);
  });

  it("calls recover on the FlatButton on the form if username is set", () => {
    const recoverResponse = { success: true, message: "some message" };
    recover.mockResolvedValue(recoverResponse);
    changeForm().instance().state.username = "Foofoo";

    const button = changeForm()
      .find("Dialog")
      .children()
      .find("FlatButton")
      .get(0);
    expect(recover).toHaveBeenCalledTimes(0);
    button.props.onClick();
    expect(recover).toHaveBeenCalledTimes(1);
  });

  it("does not call recover on the FlatButton on the form if username is not set", () => {
    changeForm()
      .find("Dialog")
      .children()
      .find("FlatButton")
      .get(0)
      .props.onClick();
    expect(recover).toHaveBeenCalledTimes(0);
  });

  it("calls recover and displays the message from the response", async () => {
    const recoverResponse = { success: true, message: "some message" };
    recover.mockResolvedValue(recoverResponse);

    changeForm().instance().state.username = "Foofoo";

    expect(recover).toHaveBeenCalledTimes(0);
    expect(changeForm().instance().state.message).toBe(null);
    expect(
      changeForm()
        .find("p")
        .text()
    ).toBe("");
    await changeForm()
      .instance()
      .onForgottenPassword();
    expect(recover).toHaveBeenCalledTimes(1);
    expect(changeForm().instance().state.message).toBe(recoverResponse.message);
    expect(
      changeForm()
        .find("p")
        .text()
    ).toBe(recoverResponse.message);
  });
});
