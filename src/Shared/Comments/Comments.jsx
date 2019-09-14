import React from 'react';
import './Comments.css';
import Comment from '../Comment/Comment'
import { database } from '../../firebaseConfig';

class Comments extends React.Component {
  state = {
    comment: '',
    isShowAll: false,
    isEditing: false
  }

  handleIsEditing(state) {
    this.setState({ isEditing: state });
  }

  handleShowAll() {
    this.setState({ isShowAll: !this.state.isShowAll });
  }

  handleChange(e) {
    this.setState({ comment: e.target.value });
  }

  handleSubmit(e) {
    e.preventDefault();

    if (!this.state.comment) return;

    const id = this.props.comments.length === 0
      ? 0
      : this.props.comments[this.props.comments.length - 1].id + 1;

    database.ref(`posts/${this.props.postId}/comments/${id}`).update({
      id: id,
      text: this.state.comment,
      user: this.props.activeUser
    });

    this.setState({ comment: '' });
  }

  render() {
    let comments = this.props.comments.map((item, i) => {
      return <Comment
        text={item.text}
        user={item.user}
        id={item.id}
        activeUser={this.props.activeUser}
        postId={this.props.postId}
        postAuthor={this.props.postAuthor}
        isEditing={this.state.isEditing}
        handleIsEditing={(state) => this.handleIsEditing(state)}
        key={item.id}
      />
    })

    return (
      <div className='comments'>
        <button
          className={comments.length > 5 ? 'show-all-button' : 'show-all-button non-active'}
          onClick={comments.length > 5 ? () => this.handleShowAll() : null}
        >
          {this.state.isShowAll ? 'Hide all comments' : 'Show all comments'}
        </button>
        {
          comments.length > 0 &&
          <ul>
            {this.state.isShowAll ? comments : comments.slice(-5)}
          </ul>
        }
        <div className='form-wrapper'>
          <form>
            <input
              type='text'
              value={this.state.comment}
              onChange={(e) => this.handleChange(e)}
              placeholder='Add a comment...'
            />
            <input
              type='submit'
              value='Post'
              onClick={(e) => { this.handleSubmit(e) }}
              className={this.state.comment ? null : 'non-active'}
            />
          </form>
        </div>
      </div >
    );
  }
}

export default Comments;