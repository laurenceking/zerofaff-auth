import React, { Component } from "react";

import { StyleSheet, css } from "aphrodite";

import "./stylesheets/main.scss";

import {
  ActivationForm,
  ChangePasswordForm,
  LoginForm,
  ResetForm,
  SignUpForm
} from "./forms";

import { SITE_TITLE } from "./variables";

export const LOGIN = 0;
export const CHANGE_PASSWORD = 1;
export const SIGN_UP = 2;
export const ACTIVATION = 3;
export const RESET = 4;

export class Main extends Component {
  state = {
    form: LOGIN,
    message: null,
    token: null,
    username: null
  };

  componentDidMount() {
    document.title = SITE_TITLE;
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    if (token) {
      this.setState({
        form: ACTIVATION,
        token
      });
    }

    const recover = urlParams.get("recover");
    if (recover) {
      this.setState({
        form: RESET,
        token: recover
      });
    }
  }

  onActivated = username => {
    this.setState({
      form: LOGIN,
      message: "Account activated",
      username
    });
  };

  onSignUp = username => {
    this.setState({
      form: LOGIN,
      message:
        "Sign up successful, you have been sent an email to activate your account",
      username
    });
  };

  showSignUp = () => {
    this.setState({ form: SIGN_UP, message: null });
  };

  showChangePassword = () => {
    this.setState({ form: CHANGE_PASSWORD, message: null });
  };

  onRetryActivation = username => {
    this.setState({
      form: ACTIVATION,
      token: null,
      username
    });
  };

  onReset = () => {
    this.setState({
      form: LOGIN,
      token: null,
      message: "Password updated"
    });
  };

  onCancel = () => {
    this.setState({
      form: LOGIN,
      token: null
    });
  };

  renderContents() {
    const { form, token, username } = this.state;
    switch (form) {
      case ACTIVATION:
        return (
          <ActivationForm
            onActivated={this.onActivated}
            token={token}
            username={username}
            onCancel={this.onCancel}
          />
        );
      case CHANGE_PASSWORD:
        return (
          <ChangePasswordForm
            onCancel={this.onCancel}
            onPasswordChanged={this.onReset}
          />
        );
      case SIGN_UP:
        return (
          <SignUpForm
            onRetryActivation={this.onRetryActivation}
            onSignUp={this.onSignUp}
            onCancel={this.onCancel}
          />
        );
      case LOGIN:
        return (
          <LoginForm
            onRetryActivation={this.onRetryActivation}
            showChangePassword={this.showChangePassword}
            showSignUp={this.showSignUp}
            username={username}
          />
        );
      case RESET:
        return <ResetForm onReset={this.onReset} token={token} />;
      default:
        return null;
    }
  }

  render() {
    const { message } = this.state;

    return (
      <div className={css(styles.main)}>
        {message && (
          <div className={css(styles.messageContainer)}>
            <div className={css(styles.message)}>{message}</div>
          </div>
        )}
        {this.renderContents()}
      </div>
    );
  }
}

const styles = StyleSheet.create({
  main: {
    height: "100%",
    display: "flex",
    flexDirection: "column"
  },
  messageContainer: {
    textAlign: "center"
  },
  message: {
    display: "inline-block",
    background: "rgba(255,255,255,1)",
    padding: "16px",
    borderRadius: "0 0 5px 5px",
    fontWeight: "bold",
    boxShadow: "0 0 10px rgba(0,0,0,0.4)",
    fontSize: "1.4em",
    "@media (max-width: 450px)": {
      borderRadius: 0,
      display: "block",
      background: "rgba(0, 0, 0, 0)"
    }
  }
});
