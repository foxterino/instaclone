import React from 'react';
import './Main.css'
import Post from '../Post/Post'
import Stories from '../Stories/Stories'
import { database } from '../../../../firebase'
import UpdateFeed from '../UpdateFeed/UpdateFeed';

class Main extends React.Component {
  state = {
    followedUsers: '',
    renderPostsId: [],
    isNewPosts: false
  };

  componentDidMount() {
    database.ref(`users/${this.props.userId}/followedUsers`).on('value', data => {
      this.setState({ followedUsers: data.toJSON() });
    });

    database.ref('posts').on('child_added', data => {
      if (this.state.renderPostsId.length !== 0)
        this.setState({ isNewPosts: true });
    });

    // database.ref('posts').on('child_removed', data => {
    //   this.setState({ renderPostsId: [] });
    //   setTimeout(() => {
    //     this.updateFeed();
    //   }, 400);
    // });

    database.ref(`users/${this.props.userId}/followedUsers`).on('value', data => {
      this.setState({ renderPostsId: [] });
      this.updateFeed();
    });

    this.updateFeed();
  }

  updateFeed() {
    database.ref('posts').once('value', data => {
      setTimeout(() => {
        const posts = [];
        for (let key in data.toJSON()) {
          posts.push(data.toJSON()[key]);
        }

        let renderPostsId = [];
        posts.forEach((item) => {
          if (this.state.followedUsers.indexOf(item.user.toLowerCase()) !== -1) {
            renderPostsId = [...renderPostsId, item.id];
          }
        })

        this.setState({ renderPostsId: renderPostsId });
      }, 200);
    });
  }

  handleNewPosts() {
    this.setState({
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
    window.addEventListener('scroll', () => this.handleScroll());
    
    let posts;
    if (this.state.renderPostsId.length !== 0) {
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
      <main>
        {
          this.state.isNewPosts &&
          <UpdateFeed handleNewPosts={() => this.handleNewPosts()} />
        }
        <div className='post-wrapper'>
          {posts}
        </div>
        <Stories />
      </main >
    );
  }
}

export default Main;