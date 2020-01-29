import React from "react";

import { shallow } from "enzyme";

import { ActivationForm } from "../activationForm";

import { activate, resendActivation } from "../../apiCalls";
jest.mock("../../apiCalls");

describe("ActivationForm", () => {
  let props;
  let mountedActivationForm;
  const activationForm = () => {
    if (!mountedActivationForm) {
      mountedActivationForm = shallow(<ActivationForm {...props} />);
    }
    return mountedActivationForm;
  };

  beforeEach(() => {
    activate.mockReset();
    resendActivation.mockReset();
    props = {
      onActivated: jest.fn(),
      onCancel: jest.fn(),
      token: null,
      username: null
    };
    mountedActivationForm = undefined;
  });

  it("calls activate if a token is supplied", async () => {
    props.token = "tokentoken";
    const activateResponse = { success: true, email: "test@test.test" };
    activate.mockResolvedValue(activateResponse);

    expect(props.onActivated).toHaveBeenCalledTimes(0);
    await activationForm()
      .instance()
      .activate();
    expect(activate).toHaveBeenCalledTimes(2);
    expect(props.onActivated).toHaveBeenCalledTimes(2);
    expect(props.onActivated).toHaveBeenCalledWith(activateResponse.email);
  });

  it("does not call activate if a token is not supplied", async () => {
    const activateResponse = { success: true, email: "test@test.test" };
    activate.mockResolvedValue(activateResponse);

    expect(props.onActivated).toHaveBeenCalledTimes(0);
    await activationForm()
      .instance()
      .activate();
    expect(props.onActivated).toHaveBeenCalledTimes(1);
  });

  it("does not call onActivated if activate fails", async () => {
    props.token = "tokentoken";
    const activateResponse = { success: false, email: "test@test.com" };
    activate.mockResolvedValue(activateResponse);

    expect(props.onActivated).toHaveBeenCalledTimes(0);
    await activationForm()
      .instance()
      .activate();
    expect(props.onActivated).toHaveBeenCalledTimes(0);
    expect(activationForm().instance().state.email).toBe(
      activateResponse.email
    );
  });

  it("renders in a dialog", () => {
    expect(activationForm().find("Dialog").length).toBe(1);
  });

  it("displays activating during activation then resend after if activate fails", async () => {
    props.token = "tokentoken";
    const activateResponse = { success: false, email: "test@test.test" };
    activate.mockResolvedValue(activateResponse);
    const resendResponse = { success: true };
    resendActivation.mockResolvedValue(resendResponse);

    expect(props.onActivated).toHaveBeenCalledTimes(0);
    expect(activationForm().instance().state.activating);
    expect(
      activationForm()
        .find("h3")
        .text()
        .indexOf("Activating") > -1
    );
    await activationForm()
      .instance()
      .activate();
    expect(activationForm().instance().state.activating).toBe(false);
    expect(props.onActivated).toHaveBeenCalledTimes(0);

    expect(
      activationForm()
        .find("h3")
        .text()
        .indexOf("Error") > -1
    );
    expect(
      activationForm()
        .find("p")
        .text()
        .indexOf(activateResponse.email) > -1
    );
    const resendButton = activationForm().find("RaisedButton");
    expect(resendButton.length).toBe(1);
    expect(resendActivation).toHaveBeenCalledTimes(0);
    resendButton.simulate("click");
    expect(resendActivation).toHaveBeenCalledTimes(1);
    expect(resendActivation).toHaveBeenCalledWith(activateResponse.email);
  });

  it("displays resend if username supplied in props", () => {
    props.username = "test_username";
    const resendResponse = { success: true };
    resendActivation.mockResolvedValue(resendResponse);

    expect(
      activationForm()
        .find("h3")
        .text()
        .indexOf("Error") > -1
    );
    expect(
      activationForm()
        .find("p")
        .text()
        .indexOf(props.username) > -1
    );
    const resendButton = activationForm().find("RaisedButton");
    expect(resendButton.length).toBe(1);
    expect(resendActivation).toHaveBeenCalledTimes(0);
    resendButton.simulate("click");
    expect(resendActivation).toHaveBeenCalledTimes(1);
    expect(resendActivation).toHaveBeenCalledWith(props.username);
  });

  it("displays already active if resend responds with success false and active", async () => {
    props.username = "test_username";
    const resendResponse = { success: false, active: true };
    resendActivation.mockResolvedValue(resendResponse);

    await activationForm()
      .instance()
      .resendActivationEmail();
    expect(
      activationForm()
        .find("h3")
        .text()
        .indexOf("already") > -1
    ).toBe(true);
    const cancelButton = activationForm().find("FlatButton");
    expect(cancelButton.length).toBe(1);
    expect(props.onCancel).toHaveBeenCalledTimes(0);
    cancelButton.simulate("click");
    expect(props.onCancel).toHaveBeenCalledTimes(1);
  });

  it("displays check email if resend responds with success true", async () => {
    props.username = "test_username";
    const resendResponse = { success: true, email: "test@test.test" };
    resendActivation.mockResolvedValue(resendResponse);

    await activationForm()
      .instance()
      .resendActivationEmail();
    expect(
      activationForm()
        .find("h3")
        .text()
    ).toBe("Activation email sent");
    expect(
      activationForm()
        .find("p")
        .text()
        .indexOf(resendResponse.email) > -1
    ).toBe(true);
  });
});
