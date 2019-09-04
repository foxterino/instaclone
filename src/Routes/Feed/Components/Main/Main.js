import React from 'react';
import './Main.css'
import Post from '../Post/Post'
import Stories from '../Stories/Stories'
import { database } from '../../../../firebase'
import UpdateFeed from '../UpdateFeed/UpdateFeed';
import EventHandler from '../../../../Shared/EventHandler/EventHandler'

class Main extends React.Component {
  state = {
    activeUser: null,
    followedUsers: '',
    renderPostsId: [],
    isNewPosts: false,
    isLoaded: false
  };
  
  componentDidMount() {
    database.ref(`users/${this.props.userId}`).once('value', data => {
      this.setState({ activeUser: data.toJSON().username });
    }).then(() => {
      database.ref(`usernames/${this.state.activeUser}`).on('value', data => {
        this.setState({ followedUsers: data.toJSON().followedUsers });
      });

      this.updateFeed();

      database.ref('posts').on('child_added', data => {
        const followedUsers = this.state.followedUsers.split(',');

        if (this.state.renderPostsId.length !== 0 &&
          followedUsers.indexOf(data.toJSON().user) !== -1) {
          this.setState({ isNewPosts: true });
        }
      });

      database.ref(`usernames/${this.state.activeUser}`).on('value', data => {
        this.setState({ renderPostsId: [] });
        this.updateFeed();
      });
    });
  }

  updateFeed() {
    database.ref('posts').once('value', data => {
      setTimeout(() => {
        const posts = [];
        let renderPostsId = [];
        const followedUsers = this.state.followedUsers.split(',');

        for (let key in data.toJSON()) {
          posts.push(data.toJSON()[key]);
        }

        posts.forEach((item) => {
          if (followedUsers.indexOf(item.user) !== -1) {
            renderPostsId = [...renderPostsId, item.id];
          }
        });

        this.setState({
          renderPostsId: renderPostsId,
          isLoaded: true
        });
      }, 200);
    });
  }

  handleNewPosts() {
    this.setState({
      isLoaded: false,
      renderPostsId: [],
      isNewPosts: false
    });
    this.updateFeed();
    window.scrollTo(0, 0);
  }

  handleScroll() {
    const pageY = window.pageYOffset || document.documentElement.scrollTop;
    if (pageY === 0 && this.state.isNewPosts) {
      this.setState({
        renderPostsId: [],
        isNewPosts: false
      });
      setTimeout(() => this.updateFeed());
    }
  }

  render() {
    let posts;
    if (!this.state.isLoaded) {
      posts = (
        <div className='post loading'>
          <div className='bar top-bar'>
            <div className='profile-picture-wrapper'>
              <div className='profile-photo' />
              <span>UserNameUsername</span>
            </div>
            <span>Options</span>
          </div>
          <div className='image-wrapper'>
            <img src='#' alt='' />
          </div>
          <div className='bar bottom-bar'>
            <div className='like-wrapper'>
              <div><span>Likessss</span></div>
              <div><span>Liasdasdke</span></div>
            </div>
            <div className='caption'>
              <span>captionnnnnnnnnnnnnnnnnn</span>
            </div>
            <div className='loading-input'>
              <div><span>Add a comment...</span></div>
              <div><span>posttt</span></div>
            </div>
          </div>
        </div>
      );
    }
    else if (this.state.renderPostsId.length !== 0) {
      posts = this.state.renderPostsId.map((item) => {
        return (
          <Post
            postId={item}
            dbRefPath={`users/${this.props.userId}`}
            handleModalOpen={(activeUser, user, postId) => this.props.handleModalOpen(activeUser, user, postId)}
            handleUndoDeletePost={() => this.props.handleUndoDeletePost(item)}
            isDeleted={this.props.deletedPosts.indexOf(item) !== -1}
          />
        );
      });
    }
    else {
      posts =
        <div className='empty-feed'>
          Your feed is empty. Subscribe someone.
        </div>;
    }

    if (Array.isArray(posts)) posts.reverse();

    return (
      <EventHandler eventName='scroll' callback={() => this.handleScroll()} >
        <main>
          {
            this.state.isNewPosts &&
            <UpdateFeed handleNewPosts={() => this.handleNewPosts()} />
          }
          <div className='post-wrapper'>
            {posts}
          </div>
          <Stories />
        </main>
      </EventHandler>
    );
  }
}

export default Main;