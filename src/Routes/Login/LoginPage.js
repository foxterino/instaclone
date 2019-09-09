import React from 'react';
import './LoginPage.css'
import { Link, Redirect } from "react-router-dom";
import FormInput from '../../Shared/FormInput/FormInput'
import { auth } from '../../firebase'

class LoginPage extends React.Component {
  state = {
    username: '',
    password: '',
    redirectToReferrer: false,
    errorMessage: ''
  };

  handleUserChange(e) {
    this.setState({
      username: e.target.value,
      errorMessage: ''
    });
  }

  handlePasswordChange(e) {
    this.setState({
      password: e.target.value,
      errorMessage: ''
    });
  }

  handleSubmit(e) {
    e.preventDefault();

    auth.signInWithEmailAndPassword(this.state.username, this.state.password)
      .then((u) => {
        setTimeout(() => {
          this.setState({ redirectToReferrer: true });

          this.props.login(u.user.uid);

          localStorage.setItem('userId', u.user.uid);
          localStorage.setItem('isLoggined', true);
        }, 200);
      })
      .catch((error) => {
        this.setState({ errorMessage: 'Incorrect email or password.' });
      });
  }

  render() {
    let { from } = this.props.location.state || { from: { pathname: "/feed" } };
    let { redirectToReferrer } = this.state;

    if (redirectToReferrer || localStorage.getItem('isLoggined'))
      return <Redirect to={from} />;

    return (
      <div className='login-page'>
        <div className='login-wrapper'>
          <h2>Instaclone</h2>
          <form>
            <FormInput
              value={this.state.username}
              handleChange={(e) => this.handleUserChange(e)}
              type='text'
              label='E-mail'
            />
            <FormInput
              value={this.state.password}
              handleChange={(e) => this.handlePasswordChange(e)}
              type='password'
              label='Password'
            />
            <input
              type='submit'
              value='Log in'
              className={!this.state.username && 'non-active'}
              onClick={this.state.username ? (e) => this.handleSubmit(e) : null}
            />
            <span className={
              this.state.errorMessage ? 'error-message' : 'error-message hide'
            }>
              {this.state.errorMessage}
            </span>
            <a href='#'>Forgot password?</a>
          </form>
        </div>
        <div className='signup-wrapper'>
          <span>Don't have an account?</span>
          <Link to='/'>Sign up</Link>
        </div>
      </div>
    );
  }
}

export default LoginPage;