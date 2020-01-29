import React from "react";
import PropTypes from "prop-types";

import { StyleSheet, css } from "aphrodite";

import { Errors, Spacer } from "./";

export const Dialog = ({
  children,
  errors,
  leftButtons,
  rightButtons,
  title
}) => (
  <div className={css(styles.container)}>
    <div className={css(styles.dialog)}>
      <h1 className={css(styles.title)}>{title}</h1>
      {errors && <Errors errors={errors} style={styles.errors} />}
      <div className={css(styles.contents)}>{children}</div>
      <div className={css(styles.buttons)}>
        {leftButtons}
        <Spacer customStyles={styles.spacer} />
        {rightButtons}
      </div>
    </div>
  </div>
);

Dialog.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]),
  errors: PropTypes.arrayOf(PropTypes.string),
  leftButtons: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.arrayOf(PropTypes.element)
  ]),
  rightButtons: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.arrayOf(PropTypes.element)
  ]),
  title: PropTypes.string
};

const styles = StyleSheet.create({
  buttons: {
    padding: "5px",
    borderTop: "1px solid #e0e0e0",
    margin: "5px",
    whiteSpace: "nowrap",
    display: "flex",
    "@media (max-width: 450px)": {
      display: "block",
      whiteSpace: "normal"
    }
  },
  container: {
    width: "100%",
    maxWidth: "600px",
    height: "100%",
    maxHeight: "300px",
    transform: "translate(-50%, -50%)",
    top: "50%",
    left: "50%",
    position: "absolute",
    display: "flex",
    "@media (max-height: 450px), (max-width: 450px)": {
      maxHeight: "100%",
      maxWidth: "100%",
      transform: "none",
      position: "relative",
      top: 0,
      left: 0
    }
  },
  contents: {
    flex: 1,
    overflowY: "auto",
    "@media (max-height: 400px)": {
      minHeight: "200px"
    }
  },
  dialog: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    margin: "0 16px",
    height: "100%",
    textAlign: "center",
    background: "rgba(255, 255, 255, 0.9)",
    boxShadow:
      "rgba(0, 0, 0, 0.247059) 0px 14px 45px, rgba(0, 0, 0, 0.219608) 0px 10px 18px",
    "@media (max-width: 450px), (max-height: 450px)": {
      margin: 0
    },
    overflowY: "auto"
  },
  errors: {
    fontSize: "1em",
    textAlign: "center"
  },
  spacer: {
    "@media (max-width: 450px)": {
      clear: "both"
    }
  },
  title: {
    borderBottom: "1px solid #e0e0e0",
    margin: "5px",
    padding: "5px",
    fontWeight: "bold",
    "@media (max-height: 450px), (max-width: 450px)": {
      fontSize: "1.2em",
      margin: "2px",
      padding: "2px"
    }
  }
});
