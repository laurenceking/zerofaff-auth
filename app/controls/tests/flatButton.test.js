import React from "react";
import { shallow } from "enzyme";

import { FlatButton } from "../flatButton";

describe("FlatButton", () => {
  let props;
  let mountedFlatButton;
  const flatButton = () => {
    if (!mountedFlatButton) {
      mountedFlatButton = shallow(<FlatButton {...props} />);
    }
    return mountedFlatButton;
  };

  beforeEach(() => {
    props = {
      prop1: true,
      prop2: false
    };
    mountedFlatButton = undefined;
  });

  it("renders a button and passes props down", () => {
    const button = flatButton().find("Button");
    expect(button.length).toBe(1);
    expect(button.props().prop1).toEqual(props.prop1);
    expect(button.props().prop2).toEqual(props.prop2);
  });

  it("passes extra styles to button", () => {
    const buttonProps = flatButton()
      .find("Button")
      .props();
    expect(buttonProps.extendedStyles).not.toEqual(undefined);
    expect(typeof buttonProps.extendedStyles).toEqual("object");
    expect(Object.keys(buttonProps).length).toBe(3);
  });
});
