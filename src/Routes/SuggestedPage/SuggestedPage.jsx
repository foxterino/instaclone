import React from 'react';
import './SuggestedPage.css';
import { database } from '../../firebase';
import Suggested from '../../Shared/Suggested/Suggested';

class SuggestedPage extends React.Component {
  state = {
    activeUser: null,
    currentSuggestUser: null,
    suggested: []
  }

  componentDidMount() {
    database.ref(`users/${this.props.userId}`).once('value', data => {
      this.setState({ activeUser: data.toJSON().username });

      database.ref(`usernames/${data.toJSON().username}`).once('value', data => {
        this.setState({ currentSuggestUser: data.toJSON().followedUsers.split(',').slice(-1)[0] });
      });
    });
  }

  handleSuggested(suggested) {
    this.setState({ suggested: suggested });
  }

  handleFollow(activeUser, currentProfile) {
    database.ref(`usernames/${activeUser}`).once('value', data => {
      let followedUsers = data.toJSON().followedUsers.split(',');

      if (this.state.isFollowed) {
        const index = followedUsers.indexOf(currentProfile);

        followedUsers.splice(index, 1);
        followedUsers = followedUsers.join(',');

        database.ref(`usernames/${activeUser}`).update({ followedUsers: followedUsers });

        database.ref(`usernames/${currentProfile}`).once('value', data => {
          let followers = data.toJSON().followers.split(',');
          const index = followers.indexOf(activeUser);

          followers.splice(index, 1);
          followers = followers.join(',');

          database.ref(`usernames/${currentProfile}`).update({ followers: followers });
        });

        this.setState({ isFollowed: false });
      }
      else {
        followedUsers.push(currentProfile);
        followedUsers = followedUsers.join(',');

        database.ref(`usernames/${activeUser}`).update({ followedUsers: followedUsers });

        database.ref(`usernames/${currentProfile}`).once('value', data => {
          let followers = data.toJSON().followers.split(',');

          if (followers[0]) {
            followers.push(activeUser);
            followers = followers.join(',');
          } else {
            followers = activeUser;
          }

          database.ref(`usernames/${currentProfile}`).update({ followers: followers });
        });

        this.setState({ isFollowed: true });
      }
    });
  }

  render() {
    return (
      <div className='suggested-page'>
        {
          this.state.activeUser && this.state.currentSuggestUser &&
          <>
            <h4>Suggested</h4>
            <Suggested
              activeUser={this.state.activeUser}
              currentProfile={this.state.currentSuggestUser}
              handleFollow={this.handleFollow}
              suggested={this.state.suggested}
              handleSuggested={(suggested) => this.handleSuggested(suggested)}
              amount={30}
            />
          </>
        }
      </div>
    );
  }
}

export default SuggestedPage;