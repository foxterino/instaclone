import React from 'react';
import './ProfilePage.css'
import { Redirect, Link } from 'react-router-dom'
import { database, auth } from '../../firebaseConfig';
import ProfilePicture from './Components/ProfilePicture/ProfilePicture';
import NotFound from '../../Shared/NotFound/NotFound';
import ModalPicture from './Components/ModalPicture/Container';
import ModalInfo from './Components/ModalInfo/ModalInfo';
import ModalInfoItem from './Components/ModalInfoItem/ModalInfoItem';
import Suggested from '../../Shared/Suggested/Suggested';
import OptionsModalWindow from '../../Shared/OptionsModalWindow/OptionsModalWindow';
import { handleFollow } from '../../Services/Api';

class ProfilePage extends React.Component {
  state = {
    redirect: false,
    activeUser: null,
    currentProfile: null,

    isExist: null,
    isFollowed: null,

    renderPostsId: [],
    profilePhoto: '',

    isModal: false,
    modalPostId: null,
    modalInfoType: null,

    followers: [],
    following: [],

    isSuggested: false,
    suggested: [],

    isOptionsModal: false,

    isChangePhotoModal: false,
    isChangePhotoInput: false,

    profilePhotoSrc: '',
    error: false
  };

  componentWillUnmount() {
    document.title = 'Instaclone';
  }

  componentDidMount() {
    database.ref(`users/${this.props.userId}`).once('value', data => {
      this.setState({ activeUser: data.toJSON().username });
    })
      .then(() => {
        this.setState({ currentProfile: this.props.match.params.profile });

        this.updateProfile();
        this.updateProfilePictures();
      });

    database.ref('posts').on('child_removed', data => {
      if (this.state.currentProfile === this.state.activeUser) {
        this.setState({
          renderPostsId: [],
          isModal: false
        });
        setTimeout(() => {
          this.updateProfilePictures();
        }, 400);
      }

      if (
        this.state.currentProfile !== this.state.activeUser &&
        this.state.modalPostId === data.toJSON().id &&
        this.state.isModal
      ) {
        alert('This post has been deleted');
        this.setState({ isModal: false });
      }
    });
  }

  componentDidUpdate() {
    if (this.state.currentProfile !== this.props.match.params.profile) {
      database.ref(`usernames/${this.state.activeUser}`).off();
      database.ref(`usernames/${this.state.currentProfile}`).off();

      this.setState({
        currentProfile: this.props.match.params.profile,
        renderPostsId: [],
        isFollowed: null,
        isModal: false,
        isExist: null,
        modalInfoType: null,
        followers: [],
        following: [],
        isSuggested: false,
        suggested: [],
        isOptionsModal: false,
        isChangePhotoModal: false,
        isChangePhotoInput: false,
        profilePhotoSrc: '',
        error: false
      });

      this.updateProfile();
      this.updateProfilePictures();
    }
  }

  updateProfile() {
    database.ref(`usernames/${this.state.activeUser}`).on('value', data => {
      if (!data.toJSON()) return;

      const followedUsers = data.toJSON().followedUsers.split(',');

      followedUsers.indexOf(this.props.match.params.profile) !== -1
        ? this.setState({ isFollowed: true })
        : this.setState({ isFollowed: false });
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
        const followedUsers = data.toJSON().followedUsers.split(',');
        const followers = data.toJSON().followers.split(',');

        this.setState({
          profilePhoto: data.toJSON().profilePhoto || '#',
          followersCount: followers[0] === '' ? 0 : followers.length,
          followingCount: followedUsers.length - 1
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

  handleFollow(activeUser, currentProfile) {
    handleFollow(activeUser, currentProfile, this.state.isFollowed);
    this.setState({ isFollowed: !this.state.isFollowed });
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
    if (
      e.target.className === 'modal-window-wrapper' ||
      e.target.className === 'hidden' ||
      e.key === 'Escape'
    )
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

  handleModalInfoOpen(modalInfoType) {
    this.setState({ modalInfoType: modalInfoType });
    this.updateModalInfo();
  }

  handleModalInfoClose(e) {
    if (
      e.target.className === 'modal-info-wrapper' ||
      e.target.className === 'close-button'
    ) {
      this.setState({ modalInfoType: null });
      this.updateModalInfo();
    }
  }

  updateModalInfo() {
    database.ref(`usernames`).once('value', usernames => {
      const followers = [];
      const following = [];
      const currentProfile = usernames.toJSON()[this.state.currentProfile];

      for (let key in usernames.toJSON()) {
        if (
          currentProfile.followedUsers.indexOf(key) !== -1 &&
          key !== this.state.currentProfile
        ) {
          following.push(
            <ModalInfoItem
              handleFollow={this.handleFollow}
              activeUser={this.state.activeUser}
              profile={key}
            >
              <Link to={key}>
                <img src={usernames.toJSON()[key].profilePhoto} alt='' />
                <span>{key}</span>
              </Link>
            </ModalInfoItem>
          );
        }

        if (currentProfile.followers.indexOf(key) !== -1) {
          followers.push(
            <ModalInfoItem
              handleFollow={this.handleFollow}
              activeUser={this.state.activeUser}
              profile={key}
            >
              <Link to={key}>
                <img src={usernames.toJSON()[key].profilePhoto} alt='' />
                <span>{key}</span>
              </Link>
            </ModalInfoItem>
          );
        }
      }

      following.reverse();
      followers.reverse();

      this.setState({
        followers: followers,
        following: following
      });
    });
  }

  handleSuggested(suggested) {
    if (suggested) this.setState({ suggested: suggested });
    else this.setState({ isSuggested: !this.state.isSuggested });
  }

  handleOptionsModal(e) {
    switch (e.target.className) {
      //fallthrough case
      case 'options-modal-window-wrapper':
      // eslint-disable-next-line no-fallthrough
      case 'options-close-button':
        this.setState({ isOptionsModal: false });
        break;

      case 'options-button':
        this.setState({ isOptionsModal: true });
        break;

      default: return;
    }
  }

  handleChangePhotoModal(e) {
    switch (e.target.className) {
      case 'remove-photo':
        database.ref(`usernames/${this.state.activeUser}`).update({ profilePhoto: '' });

        this.setState({
          isChangePhotoModal: false,
          isChangePhotoInput: false,
          profilePhotoSrc: '',
          error: false
        });
        break;

      case 'save-button':
        e.preventDefault();

        if (!this.state.profilePhotoSrc) {
          this.setState({ error: true });
        } else {
          database.ref(`usernames/${this.state.activeUser}`).update({ profilePhoto: this.state.profilePhotoSrc });

          this.setState({
            isChangePhotoModal: false,
            isChangePhotoInput: false,
            profilePhotoSrc: '',
            error: false
          });
        }
        break;

      //fallthrough case
      case 'options-modal-window-wrapper':
      // eslint-disable-next-line no-fallthrough
      case 'options-close-button':
        this.setState({
          isChangePhotoModal: false,
          isChangePhotoInput: false,
          profilePhotoSrc: '',
          error: false
        });
        break;

      case 'cancel-button':
        this.setState({
          isChangePhotoInput: false,
          profilePhotoSrc: '',
          error: false
        });
        break;

      case 'upload-photo':
        this.setState({
          isChangePhotoInput: true,
          profilePhotoSrc: ''
        });
        break

      case 'profile-photo active':
        this.setState({ isChangePhotoModal: true });
        break;

      default: return;
    }
  }

  handleChange(e) {
    this.setState({
      profilePhotoSrc: e.target.value,
      error: false
    });
  }

  render() {
    if (this.state.redirect) return <Redirect to='/login' />
    if (this.state.isExist === null) {
      return <div className='loading'>Loading...</div>;
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
          <div>☹</div>
          <span>No Posts Yet.</span>
        </div>;
    }

    if (Array.isArray(posts)) posts.reverse();

    let userInfoButtons;
    if (this.props.match.params.profile !== this.state.activeUser) {
      userInfoButtons = (
        <>
          <button
            className={
              this.state.isFollowed
                ? 'follow-button followed'
                : 'follow-button'
            }
            onClick={() => this.handleFollow(this.state.activeUser, this.state.currentProfile)}
          >
            {this.state.isFollowed ? 'Following' : 'Follow'}
          </button>
          <button
            className={
              this.state.isFollowed
                ? 'suggested-button followed'
                : 'suggested-button'
            }
            onClick={() => this.handleSuggested()}
          >
            ▼
          </button>
          <button className='options-button' onClick={(e) => this.handleOptionsModal(e)}>
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
            this.state.isOptionsModal &&
            <OptionsModalWindow handleModalClose={(e) => this.handleOptionsModal(e)}>
              <button className='dangerous-button'>Report User</button>
              <button className='dangerous-button'>Block this user</button>
            </OptionsModalWindow>
          }
          {
            this.state.isChangePhotoModal &&
            <OptionsModalWindow handleModalClose={(e) => this.handleChangePhotoModal(e)}>
              <h3>Change Profile Photo</h3>
              <button className='upload-photo'>Upload Photo</button>
              {
                this.state.isChangePhotoInput &&
                <div className='profile-photo-edit-wrapper'>
                  <form>
                    <input
                      type='text'
                      className={this.state.error && 'error'}
                      value={this.state.profilePhotoSrc}
                      onChange={(e) => this.handleChange(e)}
                      placeholder='Enter image url...'
                    />
                    <div className='buttons-wrapper'>
                      <input
                        type='submit'
                        value='Save'
                        className='save-button'
                      />
                      <button className='cancel-button'>Cancel</button>
                    </div>
                  </form>
                </div>
              }
              <button className='remove-photo'>Remove Current Photo</button>
            </OptionsModalWindow>
          }
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
            this.state.modalInfoType &&
            <ModalInfo
              type={this.state.modalInfoType.slice(0, 1).toUpperCase() + this.state.modalInfoType.slice(1)}
              handleModalInfoClose={(e) => this.handleModalInfoClose(e)}
            >
              {this.state[this.state.modalInfoType]}
            </ModalInfo>
          }
          <div className='user-info-wrapper'>
            <div className='user-info'>
              <img
                src={this.state.profilePhoto} alt=''
                className={this.state.activeUser === this.state.currentProfile ? 'profile-photo active' : 'profile-photo'}
                onClick={this.state.activeUser === this.state.currentProfile ? (e) => this.handleChangePhotoModal(e) : null}
              />
              <div className='main-info'>
                <div className='top-info'>
                  <p>{this.props.match.params.profile}</p>
                  <div className='top-info-buttons'>
                    {userInfoButtons}
                  </div>
                </div>
                <ul className='bottom-info'>
                  <li><span>{this.state.renderPostsId.length}</span> posts</li>
                  <li>
                    <div
                      className={this.state.followersCount && 'bottom-info-active'}
                      onClick={
                        this.state.followersCount ?
                          () => this.handleModalInfoOpen('followers')
                          : null
                      }>
                      <span>{this.state.followersCount}</span> followers
                    </div>
                  </li>
                  <li>
                    <div
                      className={this.state.followingCount && 'bottom-info-active'}
                      onClick={
                        this.state.followingCount
                          ? () => this.handleModalInfoOpen('following')
                          : null
                      }>
                      <span>{this.state.followingCount}</span> following
                      </div>
                  </li>
                </ul>
              </div>
            </div>
            {
              this.state.isSuggested &&
              <Suggested
                activeUser={this.state.activeUser}
                currentProfile={this.state.currentProfile}
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
            }
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