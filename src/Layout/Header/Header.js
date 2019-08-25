import React from 'react';
import './Header.css'
import { NavLink } from "react-router-dom";
import { database } from '../../firebase'

class Header extends React.Component {
  state = {
    value: '',
    searchResults: [],
    isModal: false
  };

  handleChange(e) {
    this.setState({ value: e.target.value });

    if (!e.target.value) {
      this.setState({ searchResults: [] });
      return;
    }

    database.ref('usernames').once('value', data => {
      let searchResults = [];
      for (let key in data.toJSON()) {
        if (key.includes(this.state.value)) {
          searchResults.push(
            <a href={key} className='search-bar'>
              <img src={data.toJSON()[key].profilePhoto} alt='' />
              <span>{key}</span>
            </a>
          );
        }
      }

      this.setState({ searchResults: searchResults });
    });
  }

  handleModal(e) {
    if (e.target.className === 'search-bar') {
      this.setState({ isModal: true });
      window.onclick = (e) => this.handleModal(e);
    }
    else {
      this.setState({ isModal: false });
      window.onclick = null;
    }
  }

  render() {
    let searchResults;
    if (this.state.searchResults.length !== 0) {
      searchResults = <div>{this.state.searchResults}</div>;
    }
    else if (this.state.searchResults.length === 0 && this.state.value) {
      searchResults = <div className='search-bar no-results'>No results found.</div>;
    }
    else {
      searchResults = null;
    }

    return (
      <header>
        <nav>
          <p>That's my instaclone btw wow</p>
          <div className='search-bar-wrapper' onClick={(e) => this.handleModal(e)}>
            <input
              value={this.state.value}
              onChange={(e) => this.handleChange(e)}
              placeholder='Search'
              type='search'
              className='search-bar'
            />
            {this.state.isModal && searchResults}
          </div>
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
                onClick={(e) => !this.props.activeUser && e.preventDefault()}
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