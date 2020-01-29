import React from "react";
import { shallow } from "enzyme";

import { Errors } from "../errors";

describe("Errors", () => {
  let props;
  let mountedErrors;
  const errors = () => {
    if (!mountedErrors) {
      mountedErrors = shallow(<Errors {...props} />);
    }
    return mountedErrors;
  };

  beforeEach(() => {
    props = {
      error: null,
      errors: null,
      style: null
    };
    mountedErrors = undefined;
  });

  it("renders null when no errors", () => {
    expect(errors().type()).toBe(null);
  });

  it("renders single error", () => {
    props.error = "Some Error";
    expect(errors().text()).toBe(props.error);
  });

  it("renders multiple errors", () => {
    props.errors = ["Error 1", "Error 2"];
    const listItems = errors().find("li");
    expect(listItems.length).toBe(2);
    expect(listItems.at(0).text()).toBe(props.errors[0]);
    expect(listItems.at(1).text()).toBe(props.errors[1]);
  });
});
