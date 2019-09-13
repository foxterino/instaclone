import React from 'react';
import './ExplorePage.css'
import Suggested from '../../Shared/Suggested/Suggested';
import { handleFollow } from '../../Services/Api';
import { database } from '../../firebaseConfig';
import { Link } from 'react-router-dom';
import ModalPicture from '../Profile/Components/ModalPicture/Container';
import ProfilePicture from '../Profile/Components/ProfilePicture/ProfilePicture';
import EventHandler from '../../Shared/EventHandler/EventHandler';
import Loading from '../../Shared/Loading/Loading';

class ExplorePage extends React.Component {
  state = {
    activeUser: null,
    currentSuggestUser: null,
    followedUsers: '',

    isLoaded: false,

    renderPostsId: [],
    suggested: [],

    isModal: false,
    modalPostId: null,

    paginationId: 0,
    isLoadingNewPosts: false,
  }

  componentWillUnmount() {
    database.ref('posts').off();
  }

  async componentDidMount() {
    const username = await database.ref(`users/${this.props.userId}`).once('value').then(data => data.val());
    const currentSuggestUser = await database.ref(`usernames/${this.state.activeUser || username.username}`).once('value').then(data => data.val());
    const posts = await database.ref('posts').once('value').then(data => data.val());

    this.setState({
      activeUser: username.username,
      followedUsers: currentSuggestUser.followedUsers,
      currentSuggestUser: currentSuggestUser.followedUsers.split(',').slice(-1)[0],
      paginationId: Object.keys(posts).pop()
    });

    this.updateFeed();

    database.ref('posts').on('child_removed', data => {
      if (
        this.state.modalPostId === data.toJSON().id &&
        this.state.isModal
      ) {
        alert('This post has been deleted');
        this.setState({ isModal: false });
      }
    });
  }

  async updateFeed() {
    setTimeout(async () => {
      const posts = await database.ref('posts').once('value').then(data => data.val());
      const followedUsers = this.state.followedUsers.split(',');
      let renderPostsId = [];
      let i;

      for (i = this.state.paginationId; renderPostsId.length < 6 && i >= 0; i--) {
        if (!posts[i]) continue;

        if (followedUsers.indexOf(posts[i].user) === -1) {
          renderPostsId = [...renderPostsId, posts[i].id];
        }
      }

      this.setState({
        paginationId: i,
        renderPostsId: [...this.state.renderPostsId, ...renderPostsId],
        isLoaded: true,
        isLoadingNewPosts: false
      });
    }, 200);
  }

  async handleModalOpen(postId) {
    const data = await database.ref(`posts/${postId}`).once('value').then(data => data.val());
    const modalIndex = this.state.renderPostsId.indexOf(postId);

    if (!data) return;
    if (modalIndex === this.state.renderPostsId.length - 1 && this.state.paginationId !== -1) {
      this.setState({ isLoadingNewPosts: true });

      setTimeout(() => {
        this.updateFeed();
      }, 200);
    }

    this.setState({
      isModal: true,
      modalPostId: postId
    });
  }

  handleModalClose(e) {
    if (
      e.target.className === 'modal-window-wrapper' ||
      e.key === 'Escape'
    )
      this.setState({ isModal: false });
  }

  handleModalSwitch(e) {
    const modalIndex = this.state.renderPostsId.indexOf(this.state.modalPostId);
    const target = e.key || e.target;

    if (modalIndex >= this.state.renderPostsId.length - 3 && this.state.paginationId !== -1) {
      this.setState({ isLoadingNewPosts: true });

      setTimeout(() => {
        this.updateFeed();
      }, 200);
    }

    if (target === 'ArrowRight' || target.className === 'next-button') {
      this.setState({
        modalPostId: this.state.renderPostsId[modalIndex + 1],
      });
    }
    else if (target === 'ArrowLeft' || target.className === 'previous-button') {
      this.setState({
        modalPostId: this.state.renderPostsId[modalIndex - 1],
      });
    }
  }

  handleFollow(activeUser, currentProfile) {
    handleFollow(activeUser, currentProfile, this.state.isFollowed);
    this.setState({ isFollowed: !this.state.isFollowed });
  }

  handleSuggested(suggested) {
    this.setState({ suggested: suggested });
  }

  handleScroll() {
    const pageHeight = document.documentElement.scrollTop;
    const scrollPosition = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollOffset = pageHeight / scrollPosition;

    if (
      this.state.paginationId !== -1 &&
      !this.state.isLoadingNewPosts &&
      scrollOffset > 0.8
    ) {
      this.setState({ isLoadingNewPosts: true });

      setTimeout(() => {
        this.updateFeed();
      }, 200);
    }
  }

  render() {
    let posts;
    if (!this.state.isLoaded) {
      posts = <Loading />;
    } else if (this.state.renderPostsId.length !== 0) {
      posts = this.state.renderPostsId.map((item) => {
        return (
          <ProfilePicture
            postId={item}
            handleModalOpen={() => this.handleModalOpen(item)}
          />
        );
      });
    }

    const modalIndex = this.state.renderPostsId.indexOf(this.state.modalPostId);
    const isNextSwitch = modalIndex !== this.state.renderPostsId.length - 1;
    const isPrevSwitch = modalIndex !== 0;

    return (
      <EventHandler eventName='scroll' callback={() => this.handleScroll()}>
        <div className='explore'>
          {
            this.state.isModal &&
            <ModalPicture
              isModal={this.state.isModal}
              postId={this.state.modalPostId}
              handleModalClose={(e) => this.handleModalClose(e)}
              handleModalSwitch={(e) => this.handleModalSwitch(e)}
              isPrevSwitch={isPrevSwitch}
              isNextSwitch={isNextSwitch}
            />
          }
          {
            this.state.isLoaded &&
            <div className='suggested-wrapper'>
              <Suggested
                activeUser={this.state.activeUser}
                currentProfile={this.state.currentSuggestUser}
                handleFollow={this.handleFollow}
                suggested={this.state.suggested}
                handleSuggested={(suggested) => this.handleSuggested(suggested)}
                amount={30}
                handledAmount={4}
              >
                <div className='top-buttons'>
                  <span>Suggested</span>
                  <Link to='/explore/suggestions'>See All</Link>
                </div>
              </Suggested>
            </div>
          }
          <div className='main'>
            {posts}
          </div>
        </div>
      </EventHandler>
    );
  }
}

export default ExplorePage;