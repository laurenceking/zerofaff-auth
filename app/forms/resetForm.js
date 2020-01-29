import React, { Component } from "react";
import PropTypes from "prop-types";

import { StyleSheet, css } from "aphrodite";

import { Dialog, FlatButton, RaisedButton, TextField } from "../controls";

import { reset } from "../apiCalls";

export class ResetForm extends Component {
  state = {
    password: "",
    confirmation: "",
    passwordMatchError: null,
    passwordLengthError: null,
    errors: []
  };

  focused = null;

  componentDidMount() {
    if (this.focused) {
      this.focused.input.focus();
    }
  }

  onCancel = () => {
    window.location.href = "/";
  };

  onLoad = ref => {
    if (ref) {
      ref.input.focus();
    }
  };

  onConfirmationChange = event => {
    this.checkPasswords(this.state.password, event.target.value);
  };

  onPasswordChange = event => {
    this.checkPasswords(event.target.value, this.state.confirmation);
  };

  checkPasswords = (password, confirmation) => {
    this.setState({
      errors: [],
      password,
      confirmation,
      passwordMatchError:
        password !== confirmation ? "Passwords do not match" : null,
      passwordLengthError:
        password.length < 7 ? "Password must be > 5 characters" : null
    });
  };

  onReset = async () => {
    const { onReset, token } = this.props;
    const { password, passwordLengthError, passwordMatchError } = this.state;

    if (!passwordMatchError && !passwordLengthError) {
      const response = await reset(password, token);
      if (response.success) {
        onReset();
        window.location.href = "/";
      } else if (response.message) {
        this.setState({ errors: [response.message] });
      } else {
        this.setState({ errors: ["Unknown error"] });
      }
    }
  };

  render() {
    const {
      confirmation,
      errors,
      password,
      passwordLengthError,
      passwordMatchError
    } = this.state;

    return (
      <Dialog
        errors={errors}
        leftButtons={[
          <FlatButton key="cancel" label="Cancel" onClick={this.onCancel} />
        ]}
        rightButtons={[
          <RaisedButton key="reset" label="Reset" onClick={this.onReset} />
        ]}
        title="Reset password"
      >
        <div className={css(styles.content)}>
          <TextField
            label="Password"
            value={password}
            password={true}
            onChange={this.onPasswordChange}
            error={passwordLengthError}
          />
          <br />
          <TextField
            label="Password confirmation"
            value={confirmation}
            password={true}
            onChange={this.onConfirmationChange}
            error={passwordMatchError}
          />
        </div>
      </Dialog>
    );
  }
}

ResetForm.propTypes = {
  onReset: PropTypes.func,
  token: PropTypes.string
};

const styles = StyleSheet.create({
  content: {
    padding: "5px"
  }
});
