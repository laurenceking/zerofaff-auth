import React from "react";
import { shallow } from "enzyme";

import { Button } from "../button";

// extendedStyles: PropTypes.object,
// label: PropTypes.string,
// onClick: PropTypes.func,
// style: PropTypes.object

describe("Button", () => {
  let props;
  let mountedButton;
  const button = () => {
    if (!mountedButton) {
      mountedButton = shallow(<Button {...props} />);
    }
    return mountedButton;
  };

  beforeEach(() => {
    props = {
      extendedStyles: null,
      label: null,
      onClick: jest.fn(),
      style: null
    };
    mountedButton = undefined;
  });

  it("renders label prop as button text", () => {
    props.label = "Button content";
    expect(button().text()).toBe(props.label);
  });

  it("fires props onclick when clicked", () => {
    expect(props.onClick).toHaveBeenCalledTimes(0);
    button().simulate("click");
    expect(props.onClick).toHaveBeenCalledTimes(1);
  });

  it("sets focused state on focus & blur", () => {
    expect(button().state().focused).toEqual(false);
    button().simulate("blur");
    expect(button().state().focused).toEqual(false);
    button().simulate("focus");
    expect(button().state().focused).toEqual(true);
    button().simulate("focus");
    expect(button().state().focused).toEqual(true);
    button().simulate("blur");
    expect(button().state().focused).toEqual(false);
  });
});
