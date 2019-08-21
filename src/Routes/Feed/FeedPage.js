import React from 'react';
import './FeedPage.css'
import Main from './Components/Main/Container'
import OptionsModalWindow from '../../Shared/OptionsModalWindow/OptionsModalWindow'
import { database } from '../../firebase';
import EventHandler from '../../Shared/EventHandler/EventHandler';

class FeedPage extends React.Component {
  state = {
    isModal: false,
    activeUser: null,
    user: null,
    postId: null,
    deletedPosts: []
  };

  componentWillUnmount() {
    this.updateBD();
  }

  handleModalOpen(activeUser, user, postId) {
    this.setState({
      isModal: true,
      activeUser: activeUser,
      user: user,
      postId: postId
    });
  }

  handleModalClose(e) {
    if (e.target.className === 'options-modal-window-wrapper' ||
      e.target.className === 'options-close-button')
      this.setState({ isModal: false });
  }

  handleDeletePost() {
    this.setState({
      deletedPosts: [...this.state.deletedPosts, this.state.postId],
      isModal: false
    });
  }

  handleUndoDeletePost(postId) {
    if (this.state.deletedPosts.length === 1) {
      this.setState({ deletedPosts: [] });
    } else {
      const index = this.state.deletedPosts.indexOf(postId);
      const deletedPosts = this.state.deletedPosts.slice();
      deletedPosts.splice(index, 1);

      this.setState({ deletedPosts: deletedPosts });
    }
  }

  updateBD() {
    this.state.deletedPosts.forEach((item) => {
      database.ref(`posts/${item}`).remove();
    });
  }

  handleUnfollow() {
    database.ref(`users/${this.props.userId}`).once('value', data => {
      let followedUsers = data.toJSON().followedUsers.split(',');

      if (followedUsers.length === 1) {
        followedUsers = '';
      } else {
        const index = followedUsers.indexOf(this.state.currentProfile);

        followedUsers.splice(index, 1);
        followedUsers = followedUsers.join(',');
      }

      database.ref(`usernames/${this.state.user}`).once('value', data => {
        database.ref(`usernames/${this.state.user}`).update({
          followers: data.toJSON().followers - 1
        });
      });

      database.ref(`users/${this.props.userId}`).update({
        followedUsers: followedUsers
      });

      const following = followedUsers.split(',').length - 1;
      database.ref(`usernames/${this.state.activeUser}`).update({ following: following });
    });

    this.setState({ isModal: false });
  }

  render() {
    return (
      <EventHandler eventName='beforeunload' callback={() => this.updateBD()}>
        <OptionsModalWindow
          isModal={this.state.isModal}
          handleModalClose={(e) => this.handleModalClose(e)}
          postId={this.state.postId}
          handleUnfollow={() => this.handleUnfollow()}
          handleDeletePost={
            this.state.activeUser === this.state.user ?
              () => this.handleDeletePost() : null
          }
        />
        <Main
          handleModalOpen={(activeUser, user, postId) => { this.handleModalOpen(activeUser, user, postId) }}
          deletedPosts={this.state.deletedPosts}
          handleUndoDeletePost={(postId) => this.handleUndoDeletePost(postId)}
        />
      </EventHandler>
    );
  }
}

export default FeedPage;
