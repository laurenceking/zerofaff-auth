import React from "react";

import { StyleSheet } from "aphrodite";

import { shallow } from "enzyme";

import { TextField } from "../textField";

describe("TextField", () => {
  let props;
  let mountedTextField;
  const textField = () => {
    if (!mountedTextField) {
      mountedTextField = shallow(<TextField {...props} />);
    }
    return mountedTextField;
  };

  beforeEach(() => {
    props = {
      error: null,
      errors: null,
      label: null,
      onBlur: jest.fn(),
      onChange: jest.fn(),
      onFocus: jest.fn(),
      password: null,
      value: null
    };
    mountedTextField = undefined;
  });

  it("renders correctly", () => {
    expect(textField().find("label").length).toEqual(1);
    expect(textField().find("input").length).toEqual(1);
    expect(textField().find("hr").length).toEqual(2);
    expect(textField().find("Errors").length).toEqual(1);
  });

  it("renders label prop in label", () => {
    props.label = "text label";
    expect(
      textField()
        .find("label")
        .text()
    ).toBe(props.label);
  });

  it("renders value prop in input", () => {
    props.value = "input value";
    expect(
      textField()
        .find("input")
        .props().value
    ).toBe(props.value);
    expect(
      textField()
        .find("input")
        .props().type
    ).toEqual("");
  });

  it("renders a password input based on password prop", () => {
    props.password = true;
    expect(
      textField()
        .find("input")
        .props().type
    ).toEqual("password");
  });

  it("fires onFocus, onBlur and onChange on the input, and onFocus on clicking the label", () => {
    const input = textField().find("input");
    expect(props.onFocus).toHaveBeenCalledTimes(0);
    expect(props.onBlur).toHaveBeenCalledTimes(0);
    expect(props.onChange).toHaveBeenCalledTimes(0);
    input.simulate("change");
    input.simulate("blur");
    input.simulate("focus");
    expect(props.onFocus).toHaveBeenCalledTimes(1);
    expect(props.onBlur).toHaveBeenCalledTimes(1);
    expect(props.onChange).toHaveBeenCalledTimes(1);
    textField()
      .find("label")
      .simulate("click");
    expect(props.onFocus).toHaveBeenCalledTimes(2);
  });

  it("renders errors via an Errors component", () => {
    props.errors = ["error 1", "error 2"];
    props.error = "another error";

    const errors = textField().find("Errors");
    expect(errors.length).toBe(1);
    expect(errors.props().errors).toBe(props.errors);
    expect(errors.props().error).toBe(props.error);
  });
});
