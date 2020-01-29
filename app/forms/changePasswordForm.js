import React, { Component } from "react";
import PropTypes from "prop-types";

import { changePassword, recover } from "../apiCalls";

import { Dialog, FlatButton, RaisedButton, TextField } from "../controls";

export class ChangePasswordForm extends Component {
  state = {
    changing: false,
    username: "",
    password: "",
    newPassword: "",
    recovering: false,
    message: null,
    error: null
  };

  focused = null;

  componentDidMount() {
    if (this.focused) {
      this.focused.input.focus();
    }
  }

  onNameChange = event => {
    this.setState({ error: null, username: event.target.value });
  };

  onPasswordChange = event => {
    this.setState({ error: null, password: event.target.value });
  };

  onNewPasswordChange = event => {
    this.setState({ error: null, newPassword: event.target.value });
  };

  onChangePassword = async () => {
    const { onPasswordChanged } = this.props;
    const { newPassword, password, username } = this.state;
    if (username === "" || password === "" || newPassword === "") {
      this.setState({ error: "All fields are required to change password" });
      return;
    }
    this.setState({ changing: true });
    const response = await changePassword({ username, password, newPassword });
    if (response.success) {
      onPasswordChanged();
    } else {
      this.setState({
        changing: false,
        error: response.message
      });
    }
  };

  onForgottenPassword = async () => {
    const { username } = this.state;
    if (username === "") {
      this.setState({ error: "Username/email required for password reminder" });
      return;
    }
    this.setState({ recovering: true });
    const response = await recover(username);
    if (response.success) {
      this.setState({
        recovering: false,
        message: response.message
      });
    } else {
      this.setState({
        recovering: false,
        error: response.message
      });
    }
  };

  render() {
    const { onCancel } = this.props;
    const {
      changing,
      error,
      message,
      newPassword,
      password,
      recovering,
      username
    } = this.state;
    return (
      <Dialog
        errors={[error]}
        leftButtons={[
          <FlatButton
            disabled={changing || recovering}
            key="cancel"
            label="Cancel"
            onClick={onCancel}
          />
        ]}
        rightButtons={[
          <RaisedButton
            key="change"
            disabled={changing || recovering}
            label={changing ? "Updating password" : "Update password"}
            onClick={this.onChangePassword}
          />
        ]}
        title="Change password"
      >
        <p>{message}</p>
        <TextField
          label="Username or Email"
          value={username}
          onChange={this.onNameChange}
          ref={ref => (this.focused = ref)}
        />
        <FlatButton
          disabled={recovering || changing}
          key="send"
          label={recovering ? "Sending reminder" : "Send reminder"}
          onClick={this.onForgottenPassword}
          style={{ marginTop: "30px" }}
        />
        <TextField
          label="Old password"
          value={password}
          onChange={this.onPasswordChange}
          password={true}
        />
        <TextField
          label="New password"
          value={newPassword}
          onChange={this.onNewPasswordChange}
          password={true}
        />
      </Dialog>
    );
  }
}

ChangePasswordForm.propTypes = {
  onCancel: PropTypes.func,
  onPasswordChanged: PropTypes.func
};
