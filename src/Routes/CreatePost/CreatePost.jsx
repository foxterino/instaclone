import React from 'react'
import { database } from '../../firebaseConfig'
import { Redirect } from 'react-router-dom'
import './CreatePost.css'

class CreatePost extends React.Component {
  state = {
    imageSrc: '',
    caption: '',
    redirect: false,
    errors: {
      imageSrc: false,
      caption: false
    }
  };

  handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value,
      errors: {
        ...this.state.errors,
        [e.target.name]: false
      }
    });
  }

  handleSubmit(e) {
    e.preventDefault();

    let imageSrcError = false;
    let captionError = false;

    if (!this.state.imageSrc) imageSrcError = true;
    if (!this.state.caption) captionError = true;

    if (imageSrcError || captionError) {
      this.setState({
        errors: {
          imageSrc: imageSrcError,
          caption: captionError
        }
      });

      return;
    }

    let username;
    let postId;

    database.ref(`users/${this.props.userId}`).once('value', data => {
      username = data.toJSON().username;

      database.ref('posts').once('value', data => {
        const posts = [];
        for (let key in data.toJSON()) {
          posts.push(data.toJSON()[key]);
        }

        postId = data.toJSON() ? posts[posts.length - 1].id + 1 : 0;
      })
        .then(() => {
          database.ref('posts').update({
            [postId]: {
              caption: this.state.caption,
              imageSrc: this.state.imageSrc,
              likeCount: 0,
              user: username,
              id: postId
            }
          });
        });
    })
      .then(() => {
        this.setState({ redirect: true });
      });
  }

  render() {
    if (this.state.redirect) return <Redirect to='/feed' />

    const errorMessage = this.state.errors.imageSrc || this.state.errors.caption;
    return (
      <div className='create-post'>
        <div className='form-wrapper'>
          <h2>New publication</h2>
          <form>
            <input
              type='text'
              name='imageSrc'
              value={this.state.imageSrc}
              onChange={(e) => this.handleChange(e)}
              className={this.state.errors.imageSrc && 'error'}
              placeholder='Enter image url'
            />
            <input
              type='text'
              name='caption'
              value={this.state.caption}
              onChange={(e) => this.handleChange(e)}
              className={this.state.errors.caption && 'error'}
              placeholder='Add a caption'
            />
            <input
              type='submit'
              value='Publish'
              onClick={(e) => { this.handleSubmit(e) }} />
            <div
              className={errorMessage ? 'error-message' : 'error-message hide'}
            >
              This field is required.
            </div>
          </form>
        </div>
        <div className='image-wrapper'>
          <img
            text={this.state.imageSrc ? 'No picture via such url' : 'Picture preview'}
            src={this.state.imageSrc} alt=''
          />
        </div>
      </div>
    );
  }
}

export default CreatePost;