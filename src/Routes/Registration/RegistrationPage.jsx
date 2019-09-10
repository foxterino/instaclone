import React from 'react'
import './RegistrationPage.css'
import { Link, Redirect } from "react-router-dom";
import FormInput from '../../Shared/FormInput/FormInput'
import { auth, database } from '../../firebaseConfig'

class RegistrationPage extends React.Component {
  state = {
    email: '',
    username: '',
    password: '',
    errors: {
      email: false,
      username: false,
      password: false
    },
    errorMessage: '',
    redirectToReferrer: false
  };

  handleEmailChange(e) {
    this.setState({
      email: e.target.value,
      errors: {
        email: false,
        username: this.state.errors.username,
        password: this.state.errors.password
      },
      errorMessage: ''
    });
  }

  handleUsernameChange(e) {
    this.setState({
      username: e.target.value,
      errors: {
        email: this.state.errors.email,
        username: false,
        password: this.state.errors.password
      },
      errorMessage: ''
    });
  }

  handlePasswordChange(e) {
    this.setState({
      password: e.target.value,
      errors: {
        email: this.state.errors.email,
        username: this.state.errors.username,
        password: false
      },
      errorMessage: ''
    });
  }

  registration() {
    let emailError = false;
    let usernameError = false;
    let passwordError = false;

    if (!this.state.email) emailError = true;
    if (!this.state.username) usernameError = true;
    if (!this.state.password) passwordError = true;

    auth.createUserWithEmailAndPassword(this.state.email, this.state.password)
      .then(() => {
        const username = this.state.username.toLocaleLowerCase();

        database.ref(`usernames/${username}`).set({
          profilePhoto: "",
          followedUsers: `${username}`,
          followers: ""
        });

        auth.signInWithEmailAndPassword(this.state.email, this.state.password)
          .then((u) => {
            setTimeout(() => {
              this.setState({ redirectToReferrer: true });

              this.props.login(u.user.uid);

              localStorage.setItem('userId', u.user.uid);
              localStorage.setItem('isLoggined', true);

              database.ref('users/' + u.user.uid).set({
                username: username,
                likedPosts: ''
              });
            }, 200);
          })
      })
      .catch(error => {
        let errorMessage;
        if (!emailError && !usernameError && !passwordError) {
          errorMessage = error.message;
        } else {
          errorMessage = 'This field is required.';
        }

        this.setState({
          errors: {
            email: emailError,
            username: usernameError,
            password: passwordError
          },
          errorMessage: errorMessage
        });
      });
  }

  handleSignup(e) {
    e.preventDefault();

    database.ref('usernames').once('value', data => {
      const usernameWithoutSpace = this.state.username.split(' ');
      const usernames = [];
      for (let key in data.toJSON()) {
        usernames.push(key);
      }

      if (usernames.indexOf(this.state.username.toLowerCase()) !== -1) {
        this.setState({
          errors: {
            username: true
          },
          errorMessage: 'This username isn\'t available.'
        });
      }
      else if (usernameWithoutSpace.length > 1) {
        this.setState({
          errors: {
            username: true
          },
          errorMessage: 'Usernames cannot contain spaces...'
        })
      }
      else {
        this.registration();
      }
    });
  }

  render() {
    if (this.state.redirectToReferrer || this.props.isAuthenticated)
      return <Redirect to={'/feed'} />;

    return (
      <div className='registration-page'>
        <div className='registration-wrapper'>
          <h2>Instaclone</h2>
          <div className='form-wrapper'>
            <form>
              <FormInput
                value={this.state.email}
                className={this.state.errors.email && 'error'}
                handleChange={(e) => this.handleEmailChange(e)}
                type='text'
                label='Email'
              />
              <FormInput
                value={this.state.username}
                className={this.state.errors.username && 'error'}
                handleChange={(e) => this.handleUsernameChange(e)}
                type='text'
                label='Username'
              />
              <FormInput
                value={this.state.password}
                className={this.state.errors.password && 'error'}
                handleChange={(e) => this.handlePasswordChange(e)}
                type='password'
                label='Password'
              />
              <input
                type='submit'
                value='Sign up'
                onClick={(e) => this.handleSignup(e)}
              />
            </form>
            <div className='signup-wrapper'>
              <span className={
                this.state.errorMessage ? 'error-message' : 'error-message hide'
              }>
                {this.state.errorMessage}
              </span>
            </div>

          </div>
        </div>
        <div className='login'>
          <span>Have an account?</span>
          <Link to='/login/'>Log in</Link>
        </div>
      </div >
    );
  }
}

export default RegistrationPage;