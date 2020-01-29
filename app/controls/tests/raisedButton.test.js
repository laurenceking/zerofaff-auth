import React from "react";
import { shallow } from "enzyme";

import { RaisedButton } from "../raisedButton";

describe("RaisedButton", () => {
  let props;
  let mountedRaisedButton;
  const raisedButton = () => {
    if (!mountedRaisedButton) {
      mountedRaisedButton = shallow(<RaisedButton {...props} />);
    }
    return mountedRaisedButton;
  };

  beforeEach(() => {
    props = {
      prop1: true,
      prop2: false
    };
    mountedRaisedButton = undefined;
  });

  it("renders a button and passes props down", () => {
    const button = raisedButton().find("Button");
    expect(button.length).toBe(1);
    expect(button.props().prop1).toEqual(props.prop1);
    expect(button.props().prop2).toEqual(props.prop2);
  });

  it("passes extra styles to button", () => {
    const buttonProps = raisedButton()
      .find("Button")
      .props();
    expect(buttonProps.extendedStyles).not.toEqual(undefined);
    expect(typeof buttonProps.extendedStyles).toEqual("object");
    expect(Object.keys(buttonProps).length).toBe(3);
  });
});
