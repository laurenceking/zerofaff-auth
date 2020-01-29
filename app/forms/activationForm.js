import React, { Component } from "react";
import PropTypes from "prop-types";

import { Dialog, FlatButton, RaisedButton } from "../controls";

import { activate, resendActivation } from "../apiCalls";

export class ActivationForm extends Component {
  redirect = null;

  state = {
    active: false,
    activating: false,
    checkEmail: false,
    email: null,
    resend: true
  };

  focused = null;

  componentDidMount() {
    const { token } = this.props;
    if (token) {
      this.activate();
    }
  }

  activate = async () => {
    const { onActivated, token } = this.props;
    this.setState({ activating: true });
    const response = await activate(token);
    if (response.success) {
      this.setState({ activating: false });
      onActivated(response.email);
    } else if (response.email) {
      this.setState({ activating: false, email: response.email });
    }
  };

  resendActivationEmail = async () => {
    const nameoremail = this.state.email || this.props.username;

    const response = await resendActivation(nameoremail);
    if (response.success) {
      this.setState({ checkEmail: true, email: response.email });
    } else if (response.active) {
      this.setState({ active: true });
    } else {
      this.setState({ email: response.email });
    }
  };

  renderContent() {
    const { active, activating, checkEmail, email } = this.state;
    const { onCancel, username } = this.props;

    const nameoremail = email || username;

    if (activating) {
      return (
        <div>
          <h3>Activating account...</h3>
        </div>
      );
    }
    if (checkEmail) {
      return (
        <div>
          <h3>Activation email sent</h3>
          <p>Check your email account ({email}) for the activation link</p>
        </div>
      );
    }
    if (active) {
      return (
        <div>
          <h3>Account already activated</h3>
          <FlatButton label="Go to login" onClick={onCancel} />
        </div>
      );
    }
    if (nameoremail) {
      return (
        <div>
          <h3>Error activating account</h3>
          <p>Please try again for account: {nameoremail}</p>
          <RaisedButton
            label="Resend activation email"
            onClick={this.resendActivationEmail}
          />
        </div>
      );
    }
  }

  render() {
    const { errors } = this.state;
    return (
      <Dialog errors={errors} title="Activation">
        {this.renderContent()}
      </Dialog>
    );
  }
}

ActivationForm.propTypes = {
  onActivated: PropTypes.func,
  onCancel: PropTypes.func,
  token: PropTypes.string,
  username: PropTypes.string
};
