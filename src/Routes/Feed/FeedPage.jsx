import React from 'react';
import './FeedPage.css'
import Main from './Components/Main/Container'
import OptionsModalWindow from '../../Shared/OptionsModalWindow/OptionsModalWindow'
import { database } from '../../firebaseConfig';
import EventHandler from '../../Shared/EventHandler/EventHandler';
import { handleFollow } from '../../Services/Api';

class FeedPage extends React.Component {
  state = {
    isModal: false,
    activeUser: null,
    user: null,
    postId: null,
    deletedPosts: [],
    isFollowed: null
  };

  componentWillUnmount() {
    this.updateBD();
  }

  componentDidMount() {
    database.ref('posts').on('child_removed', data => {
      this.setState({ deletedPosts: [...this.state.deletedPosts, data.toJSON().id] });
    });
  }

  handleModalOpen(activeUser, user, postId, isFollowed) {
    this.setState({
      isModal: true,
      activeUser: activeUser,
      user: user,
      postId: postId,
      isFollowed: isFollowed
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

  async updateBD() {
    let data = await database.ref('posts').once('value', data => data);
    data = data.toJSON();

    const deletedPostsByActiveUser = this.state.deletedPosts.filter(item => {
      return data[item] && this.state.activeUser === data[item].user;
    });

    deletedPostsByActiveUser.forEach((item) => {
      database.ref(`posts/${item}`).remove();
    });

    this.setState({ deletedPosts: [] });
  }

  async handleUnfollow() {
    handleFollow(this.state.activeUser, this.state.user, true);
    this.setState({ isModal: false });
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
          <button className='dangerous-button'>Report inappropriate</button>
          {
            this.state.isFollowed &&
            <button className='dangerous-button' onClick={() => this.handleUnfollow()} >
              Unfollow
            </button>
          }
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
          handleModalOpen={(activeUser, user, postId, isFollowed) => { this.handleModalOpen(activeUser, user, postId, isFollowed) }}
          deletedPosts={this.state.deletedPosts}
          handleUndoDeletePost={(postId) => this.handleUndoDeletePost(postId)}
          updateBD={() => this.updateBD()}
        />
      </EventHandler>
    );
  }
}

export default FeedPage;
