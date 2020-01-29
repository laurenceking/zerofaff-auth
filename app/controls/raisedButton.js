import React from "react";
import { StyleSheet } from "aphrodite";

import { Button } from "./button";

export const RaisedButton = props => (
  <Button {...props} extendedStyles={styles} />
);

const styles = StyleSheet.create({
  button: {
    color: "rgb(255, 64, 129)",
    backgroundColor: "rgb(0, 188, 212)"
  },
  highlight: {
    background: "rgba(255,255,255,0.4)"
  },
  span: {
    color: "rgba(255,255,255,1)",
    ":hover": {
      background: "rgba(255,255,255,0.4)"
    }
  }
});
