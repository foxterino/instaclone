import React from 'react';
import { database } from '../../../../firebaseConfig';
import LikeAnimation from '../../../../Shared/LikeAnimation/LikeAnimation';
import './Post.css'
import Comments from '../../../../Shared/Comments/Comments';
import { Link, Redirect } from 'react-router-dom';
import { handleLike } from '../../../../Services/Api';

class Post extends React.Component {
  state = {
    user: null,
    imageSrc: null,
    likeCount: null,
    caption: null,
    isLiked: null,
    isLikeAnim: false,
    activeUser: '',
    comments: [],
    redirect: false,
    profilePhoto: '',
    isLikeUpdating: false
  }

  componentDidMount() {
    database.ref(`posts/${this.props.postId}`).on('value', data => {
      if (!data.toJSON()) return;

      const info = data.toJSON();
      const comments = [];

      for (let key in info.comments) {
        comments.push(info.comments[key]);
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
      const likedPosts = data.toJSON().likedPosts.split(',').map((item) => {
        if (item === '') return item;
        else return +item;
      });

      const isLiked = likedPosts.indexOf(this.props.postId) !== -1;
      this.setState({
        isLiked: isLiked,
        activeUser: data.toJSON().username
      });
    });
  }

  handleLike(e) {
    if (this.state.isLikeUpdating) return;

    this.setState({ isLikeUpdating: true });
    handleLike(e, this.state.likeCount, this.state.isLiked, this.props.postId, this.props.userId);

    setTimeout(() => {
      this.setState({ isLikeUpdating: false });

      if (this.state.isLiked) {
        this.setState({ isLikeAnim: true });

        setTimeout(() => {
          this.setState({ isLikeAnim: false })
        }, 2000);
      }
    }, 200);
  }

  handleRedirectToProfile() {
    this.setState({ redirect: true });
  }

  render() {
    if (!this.state.user) return null;
    if (this.state.redirect) return <Redirect push to={`/${this.state.user}`} />
    if (this.props.isDeleted) {
      return (
        <div className='deleted-post'>
          <span>{`Post ${this.props.postId} has been removed.`}</span>
          {
            this.state.activeUser === this.state.user &&
            < button onClick={() => this.props.handleUndoDeletePost()}>Undo</button>
          }
        </div >
      );
    }

    return (
      <div className='post'>
        <div className='bar top-bar'>
          <div className='profile-picture-wrapper'>
            <img
              src={this.state.profilePhoto} alt=''
              onClick={() => this.handleRedirectToProfile()}
            />
            <Link to={`/${this.state.user}`}>
              {this.state.user}
            </Link>
          </div>
          <button
            className='post-options-button'
            onClick={() =>
              this.props.handleModalOpen(this.state.activeUser, this.state.user, this.props.postId)}
          >
            Options
        </button>
        </div>
        <div
          className='image-wrapper'
          onDoubleClick={(e) => this.handleLike(e)}
        >
          <LikeAnimation isLikeAnim={this.state.isLikeAnim} />
          <img src={this.state.imageSrc} alt='' />
        </div>
        <div className='bar bottom-bar'>
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
          <Comments
            comments={this.state.comments}
            activeUser={this.state.activeUser}
            postId={this.props.postId}
            postAuthor={this.state.user}
          />
        </div>
      </div>
    );
  }
}

export default Post;