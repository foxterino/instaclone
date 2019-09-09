import React from 'react';
import './Main.css'
import Post from '../Post/Post'
import Stories from '../Stories/Stories'
import { database } from '../../../../firebase'
import UpdateFeed from '../UpdateFeed/UpdateFeed';
import EventHandler from '../../../../Shared/EventHandler/EventHandler'
import Suggested from '../../../../Shared/Suggested/Suggested';
import { Link } from 'react-router-dom';

class Main extends React.Component {
  state = {
    activeUser: null,
    followedUsers: '',
    renderPostsId: [],
    restPosts: [],
    isNewPosts: false,
    isLoaded: false,
    currentSuggestUser: null,
    suggested: []
  };

  componentDidMount() {
    database.ref(`users/${this.props.userId}`).once('value', data => {
      this.setState({ activeUser: data.toJSON().username });
    }).then(() => {
      database.ref(`usernames/${this.state.activeUser}`).on('value', data => {
        if (this.state.isLoaded && data.toJSON().followedUsers.length > this.state.followedUsers.length) {
          this.setState({ isNewPosts: true });
        }

        this.setState({
          followedUsers: data.toJSON().followedUsers,
          currentSuggestUser: data.toJSON().followedUsers.split(',').slice(-1)[0]
        });
      });

      this.updateFeed();

      database.ref('posts').on('child_added', data => {
        const followedUsers = this.state.followedUsers.split(',');

        if (this.state.renderPostsId.length !== 0 &&
          followedUsers.indexOf(data.toJSON().user) !== -1) {
          this.setState({ isNewPosts: true });
        }
      });
    });

    database.ref('posts').on('child_removed', data => {
      if (data.toJSON().user === this.state.activeUser) {
        this.setState({
          isLoaded: false,
          renderPostsId: []
        });

        this.updateFeed();
      }
    });
  }

  updateFeed() {
    database.ref('posts').once('value', data => {
      setTimeout(() => {
        const posts = [];
        let renderPostsId = [];
        const restPosts = [];
        const followedUsers = this.state.followedUsers.split(',');

        for (let key in data.toJSON()) {
          posts.push(data.toJSON()[key]);
        }

        posts.forEach((item) => {
          if (followedUsers.indexOf(item.user) !== -1) {
            renderPostsId = [...renderPostsId, item.id];
          } else {
            restPosts.push(item.id);
          }
        });

        restPosts.sort((a, b) => {
          return data.toJSON()[b].likeCount - data.toJSON()[a].likeCount;
        });

        this.setState({
          renderPostsId: renderPostsId,
          restPosts: restPosts,
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

    this.props.updateBD();

    this.updateFeed();
    window.scrollTo(0, 0);
  }

  handleScroll() {
    const pageY = window.pageYOffset || document.documentElement.scrollTop;
    if (pageY === 0 && this.state.isNewPosts) {
      this.handleNewPosts();
    }
  }

  handleFollow(activeUser, currentProfile) {
    database.ref(`usernames/${activeUser}`).once('value', data => {
      let followedUsers = data.toJSON().followedUsers.split(',');

      if (this.state.isFollowed) {
        const index = followedUsers.indexOf(currentProfile);

        followedUsers.splice(index, 1);
        followedUsers = followedUsers.join(',');

        database.ref(`usernames/${activeUser}`).update({ followedUsers: followedUsers });

        database.ref(`usernames/${currentProfile}`).once('value', data => {
          let followers = data.toJSON().followers.split(',');
          const index = followers.indexOf(activeUser);

          followers.splice(index, 1);
          followers = followers.join(',');

          database.ref(`usernames/${currentProfile}`).update({ followers: followers });
        });

        this.setState({ isFollowed: false });
      }
      else {
        followedUsers.push(currentProfile);
        followedUsers = followedUsers.join(',');

        database.ref(`usernames/${activeUser}`).update({ followedUsers: followedUsers });

        database.ref(`usernames/${currentProfile}`).once('value', data => {
          let followers = data.toJSON().followers.split(',');

          if (followers[0]) {
            followers.push(activeUser);
            followers = followers.join(',');
          } else {
            followers = activeUser;
          }

          database.ref(`usernames/${currentProfile}`).update({ followers: followers });
        });

        this.setState({ isFollowed: true });
      }
    });
  }

  handleSuggested(suggested) {
    this.setState({ suggested: suggested });
  }

  render() {
    let restPosts = this.state.restPosts.map((item) => {
      return (
        <Post
          postId={item}
          dbRefPath={`users/${this.props.userId}`}
          handleModalOpen={(activeUser, user, postId) => this.props.handleModalOpen(activeUser, user, postId, false)}
          handleUndoDeletePost={() => this.props.handleUndoDeletePost(item)}
          isDeleted={this.props.deletedPosts.indexOf(item) !== -1}
        />
      );
    });;

    restPosts.unshift(
      <div className='rest-posts'>You may be interested in.</div>
    );

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
            handleModalOpen={(activeUser, user, postId) => this.props.handleModalOpen(activeUser, user, postId, true)}
            handleUndoDeletePost={() => this.props.handleUndoDeletePost(item)}
            isDeleted={this.props.deletedPosts.indexOf(item) !== -1}
          />
        );
      });
    }
    else {
      restPosts.splice(2, 0,
        <Suggested
          activeUser={this.state.activeUser}
          currentProfile={this.state.currentSuggestUser}
          handleFollow={this.handleFollow}
          suggested={this.state.suggested}
          handleSuggested={(suggested) => this.handleSuggested(suggested)}
          amount={30}
          handledAmount={3}
        >
          <div className='top-buttons'>
            <span>Suggested</span>
            <Link to='/explore/suggestions'>See All</Link>
          </div>
        </Suggested>
      );

      posts = (
        <>
          <div className='empty-feed'>
            <span className='empty-feed-alert'>Your feed is empty. Subscribe someone.</span>
          </div>
          <div className='post-wrapper'>
            {restPosts}
          </div>
        </>
      );
    }

    if (Array.isArray(posts)) {
      posts.reverse();
      posts.splice(1, 0,
        <Suggested
          activeUser={this.state.activeUser}
          currentProfile={this.state.currentSuggestUser}
          handleFollow={this.handleFollow}
          suggested={this.state.suggested}
          handleSuggested={(suggested) => this.handleSuggested(suggested)}
          amount={30}
          handledAmount={3}
        >
          <div className='top-buttons'>
            <span>Suggested</span>
            <Link to='/explore/suggestions'>See All</Link>
          </div>
        </Suggested>
      );

      posts = [...posts, ...restPosts];
    }

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
        </main>
      </EventHandler>
    );
  }
}

export default Main;