import React from "react";
import { StyleSheet } from "aphrodite";

import { Button } from "./button";

export const FlatButton = props => (
  <Button {...props} extendedStyles={styles} />
);

const styles = StyleSheet.create({
  button: {
    color: "rgb(255, 64, 129)",
    backgroundColor: "rgba(0, 0, 0, 0)",
    ":hover": {
      background: "rgba(153,153,153,0.2)"
    }
  },
  focused: {
    height: "120%",
    width: "120%",
    opacity: 1
  },
  highlight: {
    background: "rgba(153,153,153,0.2)"
  }
});
