import React from 'react';
import './Header.css'
import { NavLink } from "react-router-dom";

class Header extends React.Component {
  state = { value: '' };

  handleChange(e) {
    this.setState({ value: e.target.value });
  }

  render() {
    return (
      <header>
        <nav>
          <p>That's my instaclone btw wow</p>
          <input
            value={this.state.value}
            onChange={(e) => this.handleChange(e)}
            placeholder='Search'
          />
          <ul>
            <li>
              <NavLink to='/feed'
                activeClassName='active'
              >
                Home
              </NavLink >
            </li>
            <li>
              <NavLink to='/explore'
                activeClassName='active'
              >
                Explore
              </NavLink >
            </li>
            <li>
              <NavLink to='/feedback'
                activeClassName='active'
              >
                Feedback
              </NavLink >
            </li>
            <li>
              <NavLink to={`/${this.props.activeUser}`}
                activeClassName='active'
              >
                Profile
              </NavLink >
            </li>
          </ul>
        </nav>
      </header >
    );
  }
}

export default Header;