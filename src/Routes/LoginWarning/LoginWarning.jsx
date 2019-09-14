import React from 'react'
import './LoginWarning.css'
import { Link, Redirect } from "react-router-dom";
import Header from '../../Layout/Header/Header'

class LoginWarning extends React.Component {
  render() {
    if (this.props.isAuthenticated)
      return <Redirect to={'/feed'} />;

    return (
      <>
        <Header />
        <div className='login-warning-wrapper'>
          <div className='login-warning'>
            <div className='text-wrapper'>
              <span>
                Log in to Instaclone
            </span>
              <span>
                Log in to see photos and videos from friends
              and discover other accounts you'll love
            </span>
            </div>
            <div className='link-wrapper'>
              <Link className='login-link' to={{
                pathname: '/login',
                state: { from: this.props.location.state.from }
              }}
              >
                Log in
              </Link>
              <Link to='/'>
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default LoginWarning;