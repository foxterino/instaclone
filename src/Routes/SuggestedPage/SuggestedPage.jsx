import React from 'react';
import './SuggestedPage.css';
import { database } from '../../firebaseConfig';
import Suggested from '../../Shared/Suggested/Suggested';
import { handleFollow } from '../../Services/Api';

class SuggestedPage extends React.Component {
  state = {
    activeUser: null,
    currentSuggestUser: null,
    suggested: []
  }

  async componentDidMount() {
    const activeUser = await database.ref(`users/${this.props.userId}`).once('value').then(data => data.val());
    const userInfo = await database.ref(`usernames/${activeUser.username}`).once('value').then(data => data.val());

    this.setState({ activeUser: activeUser.username });
    this.setState({ currentSuggestUser: userInfo.followedUsers.split(',').slice(-1)[0] });
  }

  handleSuggested(suggested) {
    this.setState({ suggested: suggested });
  }

  handleFollow(activeUser, currentProfile) {
    handleFollow(activeUser, currentProfile, this.state.isFollowed);
    this.setState({ isFollowed: !this.state.isFollowed });
  }

  render() {
    return (
      <div className="suggested-page-wrapper">
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
                handledAmount={this.state.suggested.length}
              />
            </>
          }
        </div>
      </div>
    );
  }
}

export default SuggestedPage;