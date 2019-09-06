import React from 'react';
import { database } from '../../../../firebase';
import LikeAnimation from '../../../../Shared/LikeAnimation/LikeAnimation';
import './Post.css'
import Comments from '../../../../Shared/Comments/Comments';
import { Link, Redirect } from 'react-router-dom';

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
    profilePhoto: ''
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
        if (data.toJSON().profilePhoto) {
          this.setState({ profilePhoto: data.toJSON().profilePhoto });
        } else {
          this.setState({ profilePhoto: '#' });
        }
      });
    });

    database.ref(this.props.dbRefPath).on('value', data => {
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
    e.target.classList.toggle('liked');

    let likeCount = this.state.isLiked ?
      this.state.likeCount - 1 : this.state.likeCount + 1;

    database.ref(`posts/${this.props.postId}`).update({ likeCount: likeCount })
      .then(() => {
        database.ref(this.props.dbRefPath).once('value', data => {
          this.updateIsLiked(data.toJSON());
        });
      })
      .then(() => {
        if (this.state.isLiked) {
          this.setState({ isLikeAnim: true });

          setTimeout(() => {
            this.setState({ isLikeAnim: false })
          }, 2000);
        }
      });
  }

  updateIsLiked(data) {
    let likedPosts;

    if (this.state.isLiked) {
      likedPosts = data.likedPosts.split(',').map((item) => {
        return +item;
      });

      if (likedPosts.length === 1) {
        likedPosts = '';
      } else {
        const postIndex = likedPosts.indexOf(this.props.postId);

        likedPosts.splice(postIndex, 1);
        likedPosts = likedPosts.join(',');
      }
    }
    else {
      likedPosts = data.likedPosts.split(',');

      if (likedPosts[0]) {
        likedPosts.push(this.props.postId);
        likedPosts = likedPosts.join(',');
      } else {
        likedPosts = `${this.props.postId}`;
      }
    }

    database.ref(this.props.dbRefPath).update({
      likedPosts: likedPosts
    });
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
          <button onClick={() => this.props.handleUndoDeletePost()}>Undo</button>
        </div>
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