import React, { Component } from "react";
import PropTypes from "prop-types";
import { StyleSheet, css } from "aphrodite";

import { Errors } from "./";

export class TextField extends Component {
  state = {
    focused: false
  };

  input = null;

  onKeyPress = e => {
    const { onSubmit } = this.props;
    if (onSubmit && e.key === "Enter") {
      onSubmit();
    }
  };

  onFocus = () => {
    const { onFocus } = this.props;
    if (onFocus) {
      onFocus();
    }
    if (this.input) {
      this.input.focus();
    }
    this.setState({ focused: true });
  };

  onBlur = () => {
    const { onBlur } = this.props;
    if (onBlur) {
      onBlur();
    }
    this.setState({ focused: false });
  };

  render() {
    const { error, errors, label, onChange, password, value } = this.props;
    const { focused } = this.state;

    return (
      <div className={css(styles.container)}>
        <label
          className={css(styles.label, (value || focused) && styles.highLabel)}
          onClick={this.onFocus}
        >
          {label}
        </label>
        <input
          className={css(styles.input)}
          onBlur={this.onBlur}
          onChange={onChange}
          onFocus={this.onFocus}
          onKeyPress={this.onKeyPress}
          ref={ref => (this.input = ref)}
          type={password ? "password" : ""}
          value={value}
        />
        <hr className={css(styles.hr)} />
        <hr
          className={css(
            styles.hr,
            styles.hrHighlight,
            focused && styles.hrHighlighted
          )}
        />
        <Errors errors={errors} error={error} style={styles.errors} />
      </div>
    );
  }
}

TextField.propTypes = {
  error: PropTypes.string,
  errors: PropTypes.array,
  label: PropTypes.string,
  onBlur: PropTypes.func,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  onSubmit: PropTypes.func,
  password: PropTypes.bool,
  value: PropTypes.string
};

const styles = StyleSheet.create({
  container: {
    fontSize: "16px",
    lineHeight: "24px",
    minWidth: "256px",
    height: "72px",
    display: "inline-block",
    position: "relative",
    backgroundColor: "transparent",
    verticalAlign: "top",
    transition: "height 200ms cubic-bezier(0.23, 1, 0.32, 1) 0ms",
    "@media (max-width: 350px)": {
      width: "100%"
    }
  },
  input: {
    padding: 0,
    position: "relative",
    width: "calc(100% - 10px)",
    border: 0,
    outline: 0,
    backgroundColor: "rgba(0, 0, 0, 0)",
    color: "rgba(0, 0, 0, 0.87)",
    opacity: 1,
    height: "100%",
    marginTop: "14px",
    padding: "0 5px"
  },
  label: {
    position: "absolute",
    lineHeight: "22px",
    padding: "0 5px",
    top: "38px",
    transition: "all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms",
    zIndex: 1,
    transformOrigin: "left top",
    userSelect: "none",
    color: "rgba(0, 0, 0, 0.3)",
    cursor: "text"
  },
  highLabel: {
    color: "rgb(0, 188, 212)",
    transform: "scale(0.75) translate(0px, -28px)",
    cursor: "normal"
  },
  hr: {
    border: "1px solid rgb(224, 224, 224)",
    borderWidth: "0 0 1px 0",
    bottom: "8px",
    margin: 0,
    position: "absolute",
    width: "100%"
  },
  hrHighlight: {
    border: "2px solid rgb(0, 188, 212)",
    borderWidth: "0 0 2px 0",
    transform: "scaleX(0)",
    transition: "all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms"
  },
  hrHighlighted: {
    transform: "scaleX(1)"
  },
  errors: {
    position: "absolute",
    bottom: "-18px",
    left: "5px",
    width: "calc(100% - 10px)",
    overflow: "hidden",
    textOverflow: "ellipsis"
  }
});
