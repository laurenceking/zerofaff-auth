import React, { Component } from "react";
import PropTypes from "prop-types";

import { StyleSheet, css } from "aphrodite";

import { Dialog, FlatButton, RaisedButton, TextField } from "../controls";

import { checkEmail, checkUsername, signUp } from "../apiCalls";

export class SignUpForm extends Component {
  state = {
    username: "",
    password: "",
    confirmation: "",
    email: "",
    emailError: null,
    usernameError: null,
    confirmationError: null,
    passwordError: null,
    errors: []
  };

  focused = null;

  componentDidMount() {
    if (this.focused) {
      this.focused.input.focus();
    }
  }

  onUsername = {
    change: event => {
      this.setState({
        username: event.target.value,
        usernameError: null
      });
    },
    blur: async () => {
      const { username } = this.state;
      if (username.length == 0) {
        this.setState({ usernameError: "Username is required" });
      } else {
        const response = await checkUsername(username);
        if (response.success) {
          this.setState({ usernameError: null });
        } else {
          this.setState({ usernameError: response.message });
        }
      }
    }
  };

  onEmail = {
    change: event => {
      this.setState({
        email: event.target.value,
        emailError: null
      });
    },
    blur: async () => {
      const { email } = this.state;
      if (email.length == 0) {
        this.setState({ emailError: "Email is required" });
      } else {
        const response = await checkEmail(email);
        if (response.success) {
          this.setState({ emailError: null });
        } else {
          this.setState({ emailError: response.message });
        }
      }
    }
  };

  onPassword = {
    change: event => {
      this.setState({
        confirmationError: null,
        password: event.target.value,
        passwordError: null
      });
    },
    blur: () => {
      const { confirmation, password } = this.state;
      this.setState({
        confirmationError:
          password !== confirmation ? "Passwords do not match" : null,
        passwordError:
          password.length < 6 ? "Password must be > 5 characters" : null
      });
    }
  };

  onConfirmation = {
    change: event => {
      this.setState({
        confirmation: event.target.value,
        confirmationError: null
      });
    },
    blur: () => {
      const { confirmation, password } = this.state;
      this.setState({
        confirmationError:
          password !== confirmation ? "Passwords do not match" : null
      });
    }
  };

  onLoad = ref => {
    if (ref) {
      ref.input.focus();
    }
  };

  onSignUp = async () => {
    const { onRetryActivate, onSignUp } = this.props;
    const {
      email,
      emailError,
      password,
      passwordError,
      confirmationError,
      username,
      usernameError
    } = this.state;
    const signUpData = {
      email,
      username,
      password
    };

    if (!emailError && !usernameError && !confirmationError && !passwordError) {
      const response = await signUp(signUpData);
      if (response.success) {
        onSignUp(signUpData.username);
      } else if (response.activate) {
        onRetryActivate(signUpData.username);
      } else if (response.message && typeof response.message === "object") {
        this.setState({
          usernameError: response.message.username || null,
          emailError: response.message.email || null,
          passwordError: response.message.password || null
        });
      } else if (response.message) {
        this.setState({ errors: [response.message] });
      } else {
        this.setState({ errors: ["Unknown error"] });
      }
    }
  };

  render() {
    const { onCancel } = this.props;
    const {
      confirmation,
      email,
      emailError,
      errors,
      password,
      passwordError,
      confirmationError,
      username,
      usernameError
    } = this.state;

    return (
      <Dialog
        errors={errors}
        leftButtons={[
          <FlatButton key="cancel" label="Cancel" onClick={onCancel} />
        ]}
        rightButtons={[
          <RaisedButton key="sign up" label="Sign up" onClick={this.onSignUp} />
        ]}
        title="Sign up"
      >
        <div className={css(styles.content)}>
          <TextField
            error={usernameError}
            label="Username"
            onBlur={this.onUsername.blur}
            onChange={this.onUsername.change}
            onSubmit={this.onSignUp}
            ref={ref => (this.focused = ref)}
            value={username}
          />
          <TextField
            error={emailError}
            label="Email"
            onBlur={this.onEmail.blur}
            onChange={this.onEmail.change}
            onSubmit={this.onSignUp}
            value={email}
          />
          <TextField
            error={passwordError}
            label="Password"
            onBlur={this.onPassword.blur}
            onChange={this.onPassword.change}
            onSubmit={this.onSignUp}
            password={true}
            value={password}
          />
          <TextField
            error={confirmationError}
            label="Password confirmation"
            onBlur={this.onConfirmation.blur}
            onChange={this.onConfirmation.change}
            onSubmit={this.onSignUp}
            password={true}
            value={confirmation}
          />
        </div>
      </Dialog>
    );
  }
}

SignUpForm.propTypes = {
  onCancel: PropTypes.func,
  onRetryActivate: PropTypes.func,
  onSignUp: PropTypes.func
};

const styles = StyleSheet.create({
  content: {
    padding: "5px"
  }
});
