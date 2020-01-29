import React, { Component } from "react";
import PropTypes from "prop-types";

import { StyleSheet, css } from "aphrodite";

export class Button extends Component {
  state = {
    customStyles: null,
    focused: false
  };

  button = null;

  componentDidMount() {
    const { style } = this.props;

    if (style) {
      this.setState({ customStyles: StyleSheet.create({ style }) });
    }
  }

  onFocus = () => {
    this.setState({ focused: true });
  };

  onBlur = () => {
    this.setState({ focused: false });
  };

  render() {
    const { disabled, extendedStyles, label, onClick } = this.props;
    const { customStyles, focused } = this.state;

    return (
      <button
        className={css(
          styles.button,
          extendedStyles && extendedStyles.button,
          customStyles && customStyles.style,
          disabled && styles.disabled
        )}
        disabled={disabled}
        onBlur={this.onBlur}
        onClick={onClick}
        onFocus={this.onFocus}
        ref={ref => (this.button = ref)}
      >
        <span
          className={css(
            styles.highlight,
            extendedStyles && extendedStyles.highlight,
            focused && styles.focused
          )}
        />
        <span
          className={css(styles.span, extendedStyles && extendedStyles.span)}
        >
          {label}
        </span>
      </button>
    );
  }
}

Button.propTypes = {
  disabled: PropTypes.bool,
  extendedStyles: PropTypes.object,
  label: PropTypes.string,
  onClick: PropTypes.func,
  style: PropTypes.object
};

const styles = StyleSheet.create({
  button: {
    border: "10px",
    display: "inline-block",
    cursor: "pointer",
    margin: 0,
    padding: 0,
    outline: 0,
    position: "relative",
    transition: "all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms",
    borderRadius: "2px",
    userSelect: "none",
    overflow: "hidden",
    textAlign: "center"
  },
  disabled: {
    opacity: 0.6,
    cursor: "normal"
  },
  focused: {
    height: "130%",
    width: "130%",
    opacity: 1
  },
  highlight: {
    borderRadius: "1000px",
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 0,
    height: 0,
    opacity: 0,
    transition: "all 800ms cubic-bezier(0.23, 1, 0.32, 1) 0ms",
    transform: "translate(-50%, -50%)"
  },
  span: {
    height: "36px",
    lineHeight: "36px",
    display: "block",
    position: "relative",
    padding: "0 16px",
    textTransform: "uppercase",
    fontWeight: 500,
    fontSize: "14px",
    whiteSpace: "nowrap"
  }
});
