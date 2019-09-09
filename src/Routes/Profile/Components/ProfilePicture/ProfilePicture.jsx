import React from 'react';
import { database } from '../../../../firebase';
import './ProfilePicture.css';

class ProfilePicture extends React.Component {
  state = {
    imageSrc: '',
    likeCount: null,
    commentCount: null
  }

  componentDidMount() {
    database.ref(`posts/${this.props.postId}`).on('value', data => {
      if (!data.toJSON()) return;

      const info = data.toJSON();
      let commentCount = 0;
      for (let key in info.comments) {
        commentCount++;
      }

      this.setState({
        imageSrc: info.imageSrc,
        likeCount: info.likeCount,
        commentCount: commentCount
      });
    });
  }

  render() {
    return (
      <div className='profile-picture'>
        <div className='picture-stats' onClick={() => this.props.handleModalOpen()}>
          <span>
            {'❤ ' + this.state.likeCount}
          </span>
          <span>
            {'// ' + this.state.commentCount}
          </span>
        </div>
        <img src={this.state.imageSrc} alt='' />
      </div>
    );
  }
}

export default ProfilePicture;