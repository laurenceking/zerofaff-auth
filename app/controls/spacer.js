import React from "react";
import PropTypes from "prop-types";
import { StyleSheet, css } from "aphrodite";

export const Spacer = ({ customStyles }) => (
  <div className={css(styles.style, customStyles)} />
);

Spacer.displayName = "Spacer";

Spacer.defaultProps = {
  customStyles: {}
};

Spacer.propTypes = {
  customStyles: PropTypes.object
};

const styles = StyleSheet.create({
  style: {
    flex: 1
  }
});
