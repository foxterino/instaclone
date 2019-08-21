import React from 'react';
import './ProfilePage.css'
import { auth } from '../../firebase'
import { Redirect, Link } from 'react-router-dom'
import { database } from '../../firebase';
import ProfilePicture from './Components/ProfilePicture/ProfilePicture';
import NotFound from './Components/NotFound/NotFound';
import ModalPicture from './Components/ModalPicture/Container';

class ProfilePage extends React.Component {
  state = {
    redirect: false,
    activeUser: null,
    isExist: null,
    renderPostsId: [],
    currentProfile: null,
    isFollowed: null,
    profilePhoto: "",
    isModal: false,
    modalPostId: null,
    followersCount: null,
    followingCount: null
  };

  componentWillUnmount() {
    document.title = 'Instaclone';
  }

  componentDidMount() {
    database.ref(`users/${this.props.userId}`).on('value', data => {
      this.setState({
        activeUser: data.toJSON().username
      });
    });

    this.setState({ currentProfile: this.props.match.params.profile });

    this.updateProfile();
    this.updateProfilePictures();

    database.ref('posts').on('child_added', data => {
      this.setState({ renderPostsId: [] });
      this.updateProfilePictures();
    });

    database.ref('posts').on('child_removed', data => {
      this.setState({
        renderPostsId: [],
        isModal: false
      });
      setTimeout(() => {
        this.updateProfilePictures();
      }, 400);
    });
  }

  componentDidUpdate() {
    if (this.state.currentProfile !== this.props.match.params.profile) {
      this.setState({
        currentProfile: this.props.match.params.profile,
        renderPostsId: [],
        isFollowed: null,
        isModal: false,
        isExist: null
      });

      this.updateProfile();
      this.updateProfilePictures();
    }
  }

  updateProfile() {
    database.ref(`users/${this.props.userId}/followedUsers`).on('value', data => {
      const followedUsers = data.toJSON();

      followedUsers.indexOf(this.props.match.params.profile) === -1
        ? this.setState({ isFollowed: false })
        : this.setState({ isFollowed: true });
    });

    database.ref('usernames').once('value', data => {
      const usernames = [];
      for (let key in data.toJSON()) {
        usernames.push(key);
      }

      if (usernames.indexOf(this.props.match.params.profile) === -1) {
        this.setState({ isExist: false });
      } else {
        this.setState({ isExist: true });
      }
    });

    database.ref(`usernames/${this.props.match.params.profile}`).on('value', data => {
      if (data.toJSON()) {
        this.setState({
          profilePhoto: data.toJSON().profilePhoto || '#',
          followersCount: data.toJSON().followers,
          followingCount: data.toJSON().following
        });
      }
    });
  }

  updateProfilePictures() {
    database.ref('posts').once('value', data => {
      setTimeout(() => {
        const posts = [];
        for (let key in data.toJSON()) {
          posts.push(data.toJSON()[key]);
        }

        let renderPostsId = [];
        posts.forEach((item) => {
          if (item.user === this.props.match.params.profile) {
            renderPostsId = [...renderPostsId, item.id];
          }
        })

        this.setState({ renderPostsId: renderPostsId });
      }, 200);
    });
  }

  handleFollow() {
    database.ref(`users/${this.props.userId}`).once('value', data => {
      let followedUsers = data.toJSON().followedUsers.split(',');

      if (this.state.isFollowed) {
        if (followedUsers.length === 1) {
          followedUsers = '';
        } else {
          const index = followedUsers.indexOf(this.state.currentProfile);

          followedUsers.splice(index, 1);
          followedUsers = followedUsers.join(',');
        }

        database.ref(`usernames/${this.state.currentProfile}`).once('value', data => {
          database.ref(`usernames/${this.state.currentProfile}`).update({ followers: data.toJSON().followers - 1 });
        });
        this.setState({ isFollowed: false });
      }
      else {
        if (followedUsers[0] === '') {
          followedUsers = this.state.currentProfile;
        } else {
          followedUsers.push(this.state.currentProfile);
          followedUsers = followedUsers.join(',');
        }

        database.ref(`usernames/${this.state.currentProfile}`).once('value', data => {
          database.ref(`usernames/${this.state.currentProfile}`).update({ followers: data.toJSON().followers + 1 });
        });
        this.setState({ isFollowed: true });
      }

      database.ref(`users/${this.props.userId}`).update({
        followedUsers: followedUsers
      });

      const following = followedUsers.split(',').length - 1;
      database.ref(`usernames/${this.state.activeUser}`).update({ following: following });
    });
  }

  handleLogout() {
    auth.signOut().then(() => {
      setTimeout(() => {
        localStorage.removeItem('isLoggined');
        localStorage.removeItem('userId');

        this.setState({ redirect: true });
        this.props.logout();
      }, 200);
    });
  }

  handleModalOpen(postId) {
    this.setState({
      isModal: true,
      modalPostId: postId
    });
  }

  handleModalClose(e) {
    if (e.target.className === 'modal-window-wrapper' ||
      e.target.className === 'hidden')
      this.setState({ isModal: false });
  }

  handleModalSwitch(e) {
    const modalIndex = this.state.renderPostsId.indexOf(this.state.modalPostId);

    if (e.target.className === 'next-button' || e.key === 'ArrowRight') {
      this.setState({
        modalPostId: this.state.renderPostsId[modalIndex - 1],
      });
    }
    else if (e.target.className === 'previous-button' || e.key === 'ArrowLeft') {
      this.setState({
        modalPostId: this.state.renderPostsId[modalIndex + 1],
      });
    }
  }

  render() {
    if (this.state.redirect) return <Redirect to='/login' />
    if (this.state.isExist === null) {
      return (
        <div className='loading'>Loading...</div>
      );
    }
    if (!this.state.isExist) return <NotFound />;

    document.title = `@${this.props.match.params.profile}
     • Instaclone photos and videos`;

    let posts;
    if (this.state.renderPostsId.length !== 0) {
      posts = this.state.renderPostsId.map((item) => {
        return (
          <ProfilePicture
            postId={item}
            handleModalOpen={() => this.handleModalOpen(item)}
          />
        );
      });
    }
    else {
      posts =
        <div className='empty-main'>
          Empty.
        </div>;
    }

    if (Array.isArray(posts)) posts.reverse();

    let userInfoButtons;
    // if (!this.state.profilePhoto) return <div>Load</div>;
    if (this.props.match.params.profile !== this.state.activeUser) {
      userInfoButtons = (
        <>
          <button
            className={
              this.state.isFollowed
                ? 'follow-button followed'
                : 'follow-button'
            }
            onClick={() => this.handleFollow()}
          >
            {this.state.isFollowed ? 'Following' : 'Follow'}
          </button>
          <button className='options-button'>
            Options
          </button>
        </>
      );
    }
    else {
      userInfoButtons = (
        <>
          <Link className='create-button' to='/create' >
            Create new post
          </Link>
          <button
            className='logout-button'
            onClick={() => this.handleLogout()}
          >
            Log out
          </button>
        </>
      );
    }

    const modalIndex = this.state.renderPostsId.indexOf(this.state.modalPostId);
    const isPrevSwitch = modalIndex !== this.state.renderPostsId.length - 1;
    const isNextSwitch = modalIndex !== 0;

    return (
      <div className='profile-wrapper'>
        <div className='profile'>
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
          <div className='user-info-wrapper'>
            <div className='user-info'>
              <img src={this.state.profilePhoto} alt='' className='profile-photo' />
              <div className='main-info'>
                <div className='top-info'>
                  <p>{this.props.match.params.profile}</p>
                  {userInfoButtons}
                </div>
                <div className='bottom-info'>
                  <span>{this.state.renderPostsId.length + ' posts'} </span>
                  <span>{this.state.followersCount + ' followers'} </span>
                  <span>{this.state.followingCount + ' following'} </span>
                </div>
              </div>
            </div>
          </div>
          <div className='main'>
            {posts}
          </div>
        </div>
      </div>
    );
  }
}

export default ProfilePage;