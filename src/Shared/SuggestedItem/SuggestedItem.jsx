import React from 'react';
import './SuggestedItem.css';
import { database } from '../../firebase';

class SuggestedItem extends React.Component {
  state = {
    isFollowed: null
  };

  componentDidMount() {
    database.ref(`usernames/${this.props.activeUser}`).on('value', data => {
      const followedUsers = data.toJSON().followedUsers.split(',');

      followedUsers.indexOf(this.props.profile) !== -1
        ? this.setState({ isFollowed: true })
        : this.setState({ isFollowed: false });
    });

    this.handleFollow = this.props.handleFollow.bind(this);
  }

  render() {
    return (
      <li>
        {this.props.children}
        <button
          className={
            this.state.isFollowed
              ? 'follow-button followed'
              : 'follow-button'
          }
          onClick={() => this.handleFollow(this.props.activeUser, this.props.profile)}
        >
          {this.state.isFollowed ? 'Following' : 'Follow'}
        </button>
      </li>
    );
  }
}

export default SuggestedItem;