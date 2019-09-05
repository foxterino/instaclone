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
    database.ref(`usernames/${this.state.activeUser}`).once('value', data => {
      let followedUsers = data.toJSON().followedUsers.split(',');

      const index = followedUsers.indexOf(this.state.user);

      followedUsers.splice(index, 1);
      followedUsers = followedUsers.join(',');

      database.ref(`usernames/${this.state.activeUser}`).update({ followedUsers: followedUsers });

      database.ref(`usernames/${this.state.user}`).once('value', data => {
        let followers = data.toJSON().followers.split(',');
        const index = followers.indexOf(this.state.activeUser);

        followers.splice(index, 1);
        followers = followers.join(',');

        database.ref(`usernames/${this.state.user}`).update({ followers: followers });
      });

      this.setState({ isModal: false });

    });
  }

  render() {
    let options;
    if (this.state.activeUser === this.state.user) {
      options = (
        <button className='dangerous-button' onClick={() => this.handleDeletePost()} >
          Delete
        </button>
      );
    } else {
      options = (
        <>
          <a className='dangerous-button' href='#'>Report inappropriate</a>
          <button className='dangerous-button' onClick={() => this.handleUnfollow()} >
            Unfollow
          </button>
        </>
      );
    }

    return (
      <EventHandler eventName='beforeunload' callback={() => this.updateBD()}>
        {
          this.state.isModal &&
          <OptionsModalWindow handleModalClose={(e) => this.handleModalClose(e)}>
            {options}
            <a href='#'>Go to post</a>
            <a href='#'>Share</a>
            <a href='#'>Copy link</a>
          </OptionsModalWindow>
        }
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
