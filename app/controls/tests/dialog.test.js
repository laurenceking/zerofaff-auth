import React from "react";
import { shallow } from "enzyme";

import { Dialog } from "../dialog";

describe("Dialog", () => {
  let props;
  let mountedDialog;
  const dialog = () => {
    if (!mountedDialog) {
      mountedDialog = shallow(
        <Dialog {...props}>
          <div className="child">child1</div>
          <div className="child">child2</div>
        </Dialog>
      );
    }
    return mountedDialog;
  };

  beforeEach(() => {
    props = {
      errors: null,
      leftButtons: [],
      rightButtons: [],
      title: ""
    };
    mountedDialog = undefined;
  });

  it("renders children", () => {
    expect(dialog().find(".child").length).toBe(2);
  });

  it("renders title as h1", () => {
    props.title = "Dialog title";
    expect(dialog().find("h1").length).toBe(1);
    expect(
      dialog()
        .find("h1")
        .text()
    ).toBe(props.title);
  });

  it("renders errors when passed", () => {
    props.errors = ["Some error"];
    expect(dialog().find("Errors").length).toBe(1);
    expect(
      dialog()
        .find("Errors")
        .props().errors
    ).toEqual(props.errors);
  });

  it("renders no errors when no errors are passed", () => {
    expect(dialog().find("Error").length).toBe(0);
  });

  it("renders left and right buttons either side of a single Spacer", () => {
    props.leftButtons = <div className="left">Left</div>;
    props.rightButtons = <div className="right">Right</div>;

    const buttonDivs = dialog()
      .find(".left")
      .parent()
      .get(0).props.children;

    expect(buttonDivs[0]).toBe(props.leftButtons);
    expect(buttonDivs[1].type.displayName).toBe("Spacer");
    expect(buttonDivs[2]).toBe(props.rightButtons);
    expect(dialog().find("Spacer").length).toBe(1);
    expect(dialog().find(".left").length).toBe(1);
    expect(dialog().find(".right").length).toBe(1);
  });
});
