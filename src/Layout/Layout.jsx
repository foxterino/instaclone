import React from 'react'
import './Layout.css'
import Header from './Header/Header'
import UpdownButton from './UpdownButton/UpdownButton'
import { database } from '../firebaseConfig';

class Layout extends React.Component {
  state = { activeUser: null }

  componentDidMount() {
    database.ref(`users/${this.props.userId}`).once('value', data => {
      this.setState({ activeUser: data.toJSON().username });
    });

    database.ref('posts').on('child_removed', data => {
      database.ref('users').once('value', users => {
        this.updateLikes(users.toJSON(), data.toJSON().id);
      });
    });
  }

  componentWillUnmount() {
    database.ref('posts').off();
  }

  updateLikes(data, postId) {
    for (let key in data) {
      let likedPosts = data[key].likedPosts.split(',').map((item) => {
        return +item;
      });

      if (likedPosts.indexOf(postId) !== -1) {
        if (likedPosts.length === 1) {
          likedPosts = '';
        } else {
          const postIndex = likedPosts.indexOf(postId);

          likedPosts.splice(postIndex, 1);
          likedPosts = likedPosts.join(',');
        }

        database.ref(`users/${key}`).update({
          likedPosts: likedPosts
        });
      }
    }
  }

  render() {
    return (
      <>
        <Header activeUser={this.state.activeUser} />
        <UpdownButton />
        {this.props.children}
      </>
    );
  }
}

export default Layout;