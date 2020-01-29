import React from "react";

import { StyleSheet } from "aphrodite";

import { shallow } from "enzyme";

import { Spacer } from "../spacer";

describe("Errors", () => {
  let props;
  let mountedSpacer;
  const spacer = () => {
    if (!mountedSpacer) {
      mountedSpacer = shallow(<Spacer {...props} />);
    }
    return mountedSpacer;
  };

  beforeEach(() => {
    props = {
      customStyles: null
    };
    mountedSpacer = undefined;
  });

  it("renders a div and doesn't customStyles to the classname", () => {
    expect(
      spacer()
        .props()
        .className.indexOf("customStyles")
    ).toEqual(-1);
  });
  it("renders a div and adds customStyles to the classname", () => {
    const styles = StyleSheet.create({
      customStyles: {
        display: "none"
      }
    });
    props.customStyles = styles.customStyles;
    expect(
      spacer()
        .props()
        .className.indexOf("customStyles") > -1
    );
  });
});
