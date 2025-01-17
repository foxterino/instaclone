import React from 'react';
import './ModalPicture.css';
import { database } from '../../firebaseConfig'
import { handleLike } from '../../Services/Api';
import { Link } from 'react-router-dom';
import LikeAnimation from '../LikeAnimation/LikeAnimation';
import Comments from '../Comments/Comments';
import OptionsModalWindow from '../OptionsModalWindow/OptionsModalWindow';
import EventHandler from '../EventHandler/EventHandler';

class ModalPicture extends React.Component {
  state = {
    user: null,
    imageSrc: null,
    likeCount: null,
    caption: null,
    isLiked: null,
    isLikeAnim: false,
    activeUser: '',
    comments: [],
    profilePhoto: '',
    isOptionsModal: false,
    isLikeUpdating: false
  }

  componentDidMount() {
    this.handleUpdate();
  }

  handleUpdate() {
    database.ref(`posts/${this.props.postId}`).on('value', data => {
      if (!data.toJSON()) return;

      const info = data.toJSON();
      const comments = [];

      for (let key in data.toJSON().comments) {
        comments.push(data.toJSON().comments[key]);
      }

      this.setState({
        user: info.user,
        imageSrc: info.imageSrc,
        likeCount: info.likeCount,
        caption: info.caption,
        comments: comments
      });

      database.ref(`usernames/${info.user}`).on('value', data => {
        this.setState({ profilePhoto: data.toJSON().profilePhoto });
      });
    });

    database.ref(`users/${this.props.userId}`).on('value', data => {
      const likedPosts = data.toJSON().likedPosts.split(',').map(item => item === '' ? item : +item);
      const isLiked = likedPosts.indexOf(this.props.postId) !== -1;

      this.setState({
        isLiked: isLiked,
        activeUser: data.toJSON().username
      });
    });
  }

  async handleLike(e) {
    if (this.state.isLikeUpdating) return;

    this.setState({ isLikeUpdating: true });
    await handleLike(e, this.state.likeCount, this.state.isLiked, this.props.postId, this.props.userId);

    this.setState({ isLikeUpdating: false });

    if (!this.state.isLiked) {
      this.setState({ isLikeAnim: true });

      setTimeout(() => {
        this.setState({ isLikeAnim: false })
      }, 2000);
    }
  }

  async handleSwitch(e) {
    if (this.state.isOptionsModal) return;
    if (e.key === 'ArrowRight' && !this.props.isNextSwitch) return;
    if (e.key === 'ArrowLeft' && !this.props.isPrevSwitch) return;

    if (
      e.target.className === 'next-button' ||
      e.key === 'ArrowRight' ||
      e.target.className === 'previous-button' ||
      e.key === 'ArrowLeft'
    ) {
      await this.props.handleModalSwitch(e);
      this.setState({ isLikeAnim: false });

      this.handleUpdate();
    }
  }

  handleOptionsModalOpen() {
    this.setState({ isOptionsModal: true });
  }

  handleOptionsModalClose(e) {
    if (e.target.className === 'options-modal-window-wrapper' ||
      e.target.className === 'options-close-button')
      this.setState({ isOptionsModal: false });
  }

  handleDeletePost() {
    database.ref(`posts/${this.props.postId}`).remove();
    this.setState({ isOptionsModal: false });
  }

  render() {
    if (!this.state.user) return null;

    let options;
    if (this.state.activeUser === this.state.user) {
      options = (
        <button className='dangerous-button' onClick={() => this.handleDeletePost()} >
          Delete
        </button>
      );
    } else {
      options = <a className='dangerous-button' href='#'>Report inappropriate</a>;
    }

    return (
      <EventHandler
        eventName='keyup'
        callback={(e) => {
          this.handleSwitch(e);
          this.props.handleModalClose(e);
        }}
      >
        <div
          className={'modal-window-wrapper'}
          onClick={this.props.handleModalClose}
        >
          {
            this.state.isOptionsModal &&
            <OptionsModalWindow handleModalClose={(e) => this.handleOptionsModalClose(e)}>
              {options}
              <a href='#'>Go to post</a>
              <a href='#'>Share</a>
              <a href='#'>Copy link</a>
              <button
                className='options-close-button'
                onClick={(e) => this.handleOptionsModalClose(e)}
              >
                Cancel
              </button>
            </OptionsModalWindow>
          }
          <button
            className={this.props.isPrevSwitch ? 'previous-button' : 'hidden'}
            onClick={this.props.isPrevSwitch ? (e) => this.handleSwitch(e) : null}
          >
            <div className={this.props.isPrevSwitch ? 'previous-button' : 'hidden'}></div>
          </button>
          <div className='modal-window'>
            <div
              className='image-wrapper'
              onDoubleClick={(e) => this.handleLike(e)}
            >
              <LikeAnimation isLikeAnim={this.state.isLikeAnim} />
              <img src={this.state.imageSrc} alt='' />
            </div>
            <div className='comments-wrapper'>
              <div className='bar top-bar'>
                <div className='modal-picture-options-wrapper'>
                  <div className='profile-picture-wrapper'>
                    <img
                      src={this.state.profilePhoto} alt=''
                    />
                    <Link to={`/${this.state.user}`}>
                      {this.state.user}
                    </Link>
                  </div>
                  <button
                    className='modal-picture-options-button'
                    onClick={() => this.handleOptionsModalOpen()}
                  >
                    Options
              </button>
                </div>
                <div>
                  <div className='like-wrapper'>
                    <button
                      className={this.state.isLiked ? 'like-button liked' : 'like-button'}
                      onClick={(e) => this.handleLike(e)}
                    >
                      {this.state.isLiked ? 'Liked ' : 'Like '} ❤
               </button>
                    <span className={this.state.isLiked ? 'liked' : ''}>
                      {this.state.likeCount} {this.state.likeCount === 1 ? ' like' : ' likes'}
                    </span>
                  </div>
                  <div className='caption'>
                    <Link to={`/${this.state.user}`}>{this.state.user}</Link>
                    <span>{this.state.caption}</span>
                  </div>
                </div>
              </div>
              <Comments
                comments={this.state.comments}
                activeUser={this.state.activeUser}
                postId={this.props.postId}
                postAuthor={this.state.user}
              />
            </div>
          </div>
          <button
            className={this.props.isNextSwitch ? 'next-button' : 'hidden'}
            onClick={this.props.isNextSwitch ? (e) => this.handleSwitch(e) : null}
          >
            <div className={this.props.isNextSwitch ? 'next-button' : 'hidden'}></div>
          </button>
        </div>
      </EventHandler>
    );
  }
}

export default ModalPicture;