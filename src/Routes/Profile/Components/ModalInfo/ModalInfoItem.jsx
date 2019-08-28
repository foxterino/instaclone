import React, { Component } from 'react';
import { database } from '../../../../firebase';

export class ModalInfoItem extends Component {
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
        {
          this.props.activeUser !== this.props.profile &&
          <button
            onClick={() => this.handleFollow(this.props.activeUser, this.props.profile)}
          >
            {this.state.isFollowed ? 'unfollow' : 'follow'}
          </button>
        }
      </li>
    );
  }
}

export default ModalInfoItem;