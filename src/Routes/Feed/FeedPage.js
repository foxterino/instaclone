import React from 'react';
import './FeedPage.css'
import Main from './Components/Main/Container'
import OptionsModalWindow from '../../Shared/OptionsModalWindow/OptionsModalWindow'
import { database } from '../../firebase';

class FeedPage extends React.Component {
  state = {
    isModal: false,
    activeUser: null,
    user: null,
    postId: null,
    deletedPosts: []
  };

  componentWillUnmount() {
    window.onbeforeunload = null;
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
    // database.ref(`posts/${this.state.postId}`).remove();
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
    window.onbeforeunload = () => this.updateBD();

    return (
      <>
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
      </>
    );
  }
}

export default FeedPage;
