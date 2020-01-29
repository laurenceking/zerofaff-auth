import React, { Component } from "react";
import PropTypes from "prop-types";

import { Dialog, FlatButton, RaisedButton, TextField } from "../controls";

import { login } from "../apiCalls";

export class LoginForm extends Component {
  redirect = null;

  state = {
    loggingIn: false,
    username: "",
    password: "",
    errors: []
  };

  focused = null;

  componentDidMount() {
    const urlParams = new URLSearchParams(window.location.search);
    this.redirect = urlParams.get("redirect");

    const { username } = this.props;
    if (username) {
      this.setState({ username });
    }

    if (this.focused) {
      this.focused.input.focus();
    }
  }

  onNameChange = event => {
    this.setState({ username: event.target.value });
  };

  onPasswordChange = event => {
    this.setState({ password: event.target.value });
  };

  onLogin = async () => {
    const { onRetryActivation } = this.props;
    const { password, username } = this.state;

    this.setState({ loggingIn: true });
    const response = await login({ username, password });

    if (response.success) {
      window.location = `${__LOGIN__}${this.redirect ? this.redirect : ""}#${
        response.token
      }`;
    } else if (response.activate) {
      this.setState({ loggingIn: false });
      onRetryActivation(username);
    } else if (response.messages) {
      this.setState({ loggingIn: false, errors: response.messages });
    } else if (response.message) {
      this.setState({ loggingIn: false, errors: [response.message] });
    } else {
      this.setState({ loggingIn: false, errors: ["Unknown error"] });
    }
  };

  getLoginButton = () => {
    const { loggingIn } = this.state;

    if (loggingIn) {
      return <RaisedButton key="login" label="Logging In" onClick={() => {}} />;
    }
    return <RaisedButton key="login" label="Login" onClick={this.onLogin} />;
  };

  render() {
    const { showChangePassword, showSignUp } = this.props;
    const { errors, password, username } = this.state;
    return (
      <Dialog
        errors={errors}
        leftButtons={[
          <FlatButton
            key="Change password"
            label="Change password"
            onClick={showChangePassword}
          />,
          <FlatButton key="Sign up" label="Sign up" onClick={showSignUp} />
        ]}
        rightButtons={[this.getLoginButton()]}
        title="Authentication"
      >
        <TextField
          label="Username or Email"
          value={username}
          onChange={this.onNameChange}
          onSubmit={this.onLogin}
          ref={ref => (this.focused = ref)}
        />
        <br />
        <TextField
          label="Password"
          password={true}
          value={password}
          onChange={this.onPasswordChange}
          onSubmit={this.onLogin}
        />
      </Dialog>
    );
  }
}

LoginForm.propTypes = {
  onRetryActivation: PropTypes.func,
  showChangePassword: PropTypes.func,
  showSignUp: PropTypes.func
};
