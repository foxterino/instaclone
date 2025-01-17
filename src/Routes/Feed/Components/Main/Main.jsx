import React from 'react';
import './Main.css'
import Post from '../Post/Post'
import { database } from '../../../../firebaseConfig'
import UpdateFeed from '../UpdateFeed/UpdateFeed';
import EventHandler from '../../../../Shared/EventHandler/EventHandler'
import Suggested from '../../../../Shared/Suggested/Suggested';
import { Link } from 'react-router-dom';
import { handleFollow } from '../../../../Services/Api';

class Main extends React.Component {
  state = {
    activeUser: null,
    followedUsers: '',

    renderPostsId: [],
    restPosts: [],

    isNewPosts: false,
    isLoaded: false,

    currentSuggestUser: null,
    suggested: [],

    paginationId: 0,
    isLoadingNewPosts: false,
    isRestPosts: false
  };

  async componentDidMount() {
    const username = await database.ref(`users/${this.props.userId}`).once('value').then(data => data.val());
    const posts = await database.ref('posts').once('value').then(data => data.val());
    const usernames = await database.ref(`usernames/${this.state.activeUser || username.username}`).once('value').then(data => data.val());
    const isNewPosts = this.state.isLoaded && usernames.followedUsers.length > this.state.followedUsers.length;

    await this.setState({
      activeUser: username.username,
      paginationId: Object.keys(posts).pop(),
      followedUsers: usernames.followedUsers,
      currentSuggestUser: usernames.followedUsers.split(',').slice(-1)[0],
      isNewPosts: isNewPosts
    });

    this.updateFeed();

    database.ref(`usernames/${this.state.activeUser || username.username}`).on('value', data => {
      if (this.state.isLoaded && data.toJSON().followedUsers.length > this.state.followedUsers.length) {
        this.setState({ isNewPosts: true });
      }

      this.setState({
        followedUsers: data.toJSON().followedUsers,
        currentSuggestUser: data.toJSON().followedUsers.split(',').slice(-1)[0]
      });
    });

    database.ref('posts').on('child_added', data => {
      const followedUsers = this.state.followedUsers.split(',');

      if (this.state.renderPostsId.length !== 0 &&
        followedUsers.indexOf(data.toJSON().user) !== -1) {
        this.setState({ isNewPosts: true });
      }
    });
  }

  async updateFeed() {
    const posts = await database.ref('posts').once('value').then(data => data.val());
    const followedUsers = this.state.followedUsers.split(',');
    let renderPostsId = [];
    let restPosts = [];
    let i;

    if (!this.state.isRestPosts) {
      for (i = this.state.paginationId; renderPostsId.length < 3 && i >= 0; i--) {
        if (!posts[i]) continue;

        if (followedUsers.indexOf(posts[i].user) !== -1) {
          renderPostsId = [...renderPostsId, posts[i].id];
        }
      }
    }

    if (i === -1) {
      const data = await database.ref('posts').once('value').then(data => data.val());

      this.setState({
        paginationId: Object.keys(data).pop(),
        isRestPosts: true
      });
    }

    setTimeout(() => {
      if (this.state.isRestPosts || i === -1) {
        for (i = this.state.paginationId; restPosts.length < 3 && i >= 0; i--) {
          if (!posts[i]) continue;

          if (followedUsers.indexOf(posts[i].user) === -1) {
            restPosts = [...restPosts, posts[i].id];
          }
        }
      }

      this.setState({
        paginationId: i,
        renderPostsId: [...this.state.renderPostsId, ...renderPostsId],
        restPosts: [...this.state.restPosts, ...restPosts],
        isLoaded: true,
        isLoadingNewPosts: false
      });
    }, 200);
  }

  async handleNewPosts() {
    const posts = await database.ref('posts').once('value').then(data => data.val());

    await this.setState({
      paginationId: Object.keys(posts).pop(),
      isRestPosts: false,
      isLoaded: false,
      renderPostsId: [],
      restPosts: [],
      isNewPosts: false
    });

    this.props.updateBD();

    this.updateFeed();
    window.scrollTo(0, 0);
  }

  async handleScroll() {
    if (!this.state.isLoaded) return;

    const pageY = window.pageYOffset || document.documentElement.scrollTop;
    if (pageY === 0 && this.state.isNewPosts) {
      this.handleNewPosts();
    }

    const condition = this.state.isRestPosts && this.state.paginationId === -1;
    const pageHeight = document.documentElement.scrollTop;
    const scrollPosition = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollOffset = pageHeight / scrollPosition;

    if (!condition && !this.state.isLoadingNewPosts && scrollOffset > 0.8) {
      await this.setState({ isLoadingNewPosts: true });

      this.updateFeed();
    }
  }

  handleFollow(activeUser, currentProfile) {
    handleFollow(activeUser, currentProfile, this.state.isFollowed);
    this.setState({ isFollowed: !this.state.isFollowed });
  }

  handleSuggested(suggested) {
    this.setState({ suggested: suggested });
  }

  render() {
    let restPosts = this.state.restPosts.map((item) => {
      return (
        <Post
          postId={item}
          userId={this.props.userId}
          handleModalOpen={(activeUser, user, postId) => this.props.handleModalOpen(activeUser, user, postId, false)}
          handleUndoDeletePost={() => this.props.handleUndoDeletePost(item)}
          isDeleted={this.props.deletedPosts.indexOf(item) !== -1}
          key={item}
        />
      );
    });;

    if (restPosts.length !== 0) {
      restPosts.unshift(
        <div className='rest-posts' key={'rest-posts'}>You may be interested in.</div>
      );
    }

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
            <div className="loading-image"></div>
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
            userId={this.props.userId}
            handleModalOpen={(activeUser, user, postId) => this.props.handleModalOpen(activeUser, user, postId, true)}
            handleUndoDeletePost={() => this.props.handleUndoDeletePost(item)}
            isDeleted={this.props.deletedPosts.indexOf(item) !== -1}
            key={item}
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
          key={'suggested'}
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
            <span className='empty-feed-alert'>
              {'Your feed is empty.\n'}
              <Link to='/explore/suggestions'>Subscribe someone.</Link>
            </span>
          </div>
          <div className='post-wrapper'>
            {restPosts}
          </div>
        </>
      );
    }

    if (Array.isArray(posts)) {
      posts.splice(1, 0,
        <Suggested
          activeUser={this.state.activeUser}
          currentProfile={this.state.currentSuggestUser}
          handleFollow={this.handleFollow}
          suggested={this.state.suggested}
          handleSuggested={(suggested) => this.handleSuggested(suggested)}
          amount={30}
          handledAmount={3}
          key={'suggested'}
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