import React from "react";
import PropTypes from "prop-types";

import { StyleSheet, css } from "aphrodite";

export const Errors = ({ error, errors, style }) => {
  if (!error && (!errors || errors.length === 0)) {
    return null;
  }
  if (error) {
    return (
      <span className={css(styles.error, style)} title={error}>
        {error}
      </span>
    );
  }
  return (
    <ul className={css(styles.errors, style)}>
      {errors.map((err, index) => (
        <li key={index} title={err}>
          {err}
        </li>
      ))}
    </ul>
  );
};

Errors.propTypes = {
  error: PropTypes.string,
  errors: PropTypes.array,
  style: PropTypes.object
};

const commonStyles = {
  fontSize: "0.8em",
  color: "rgb(244, 67, 54)",
  textAlign: "left"
};
const styles = StyleSheet.create({
  error: {
    ...commonStyles,
    display: "block"
  },
  errors: {
    ...commonStyles,
    listStyleType: "none",
    margin: 0,
    padding: 0
  }
});
