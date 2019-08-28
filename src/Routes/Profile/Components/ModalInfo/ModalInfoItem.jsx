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
  }

  handleFollow() {
    database.ref(`usernames/${this.props.activeUser}`).once('value', data => {
      let followedUsers = data.toJSON().followedUsers.split(',');

      if (this.state.isFollowed) {
        const index = followedUsers.indexOf(this.props.profile);

        followedUsers.splice(index, 1);
        followedUsers = followedUsers.join(',');

        database.ref(`usernames/${this.props.activeUser}`).update({ followedUsers: followedUsers });

        database.ref(`usernames/${this.props.profile}`).once('value', data => {
          let followers = data.toJSON().followers.split(',');
          const index = followers.indexOf(this.props.activeUser);

          followers.splice(index, 1);

          followers = followers.join(',');

          database.ref(`usernames/${this.props.profile}`).update({ followers: followers });
        });

        this.setState({ isFollowed: false });
      }
      else {
        followedUsers.push(this.props.profile);
        followedUsers = followedUsers.join(',');

        database.ref(`usernames/${this.props.activeUser}`).update({ followedUsers: followedUsers });

        database.ref(`usernames/${this.props.profile}`).once('value', data => {
          let followers = data.toJSON().followers.split(',');

          if (followers[0] === '') {
            followers = this.props.activeUser;
          } else {
            followers.push(this.props.activeUser);
            followers = followers.join(',');
          }

          database.ref(`usernames/${this.props.profile}`).update({ followers: followers });
        });

        this.setState({ isFollowed: true });
      }
    });
  }

  render() {
    return (
      <li>
        {this.props.children}
        <button onClick={() => this.handleFollow()}>{this.state.isFollowed ? 'unfollow' : 'follow'}</button>
      </li>
    );
  }
}

export default ModalInfoItem;