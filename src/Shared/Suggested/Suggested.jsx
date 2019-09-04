import React, { useEffect } from 'react';
import './Suggested.css';
import { database } from '../../firebase';
import SuggestedItem from '../../Shared/SuggestedItem/SuggestedItem';
import { Link } from 'react-router-dom';

function Suggested(props) {
  useEffect(() => {
    if (props.suggested.length === 0) {
      database.ref(`usernames`).once('value', usernames => {
        const currentFollowedUsers = usernames.toJSON()[props.currentProfile].followedUsers.split(',');
        const activeFollowedUsers = usernames.toJSON()[props.activeUser].followedUsers.split(',');
        const activeFollowers = usernames.toJSON()[props.activeUser].followers.split(',');
        const suggested = [];
        const suggestedByUsername = [];

        currentFollowedUsers.reverse();
        activeFollowedUsers.reverse();

        currentFollowedUsers.forEach(item => {
          if (
            item === props.currentProfile ||
            suggested.length === 5 ||
            item === props.activeUser
          ) return;

          if (activeFollowedUsers.indexOf(item) === -1) {
            suggested.push(
              <SuggestedItem
                handleFollow={props.handleFollow}
                activeUser={props.activeUser}
                profile={item}
              >
                <Link to={item}>
                  <img src={usernames.toJSON()[item].profilePhoto} alt='' />
                </Link>
                <Link to={item}>{item}</Link>
              </SuggestedItem>
            );

            suggestedByUsername.push(item);
          }
        });

        if (suggested.length !== 5) {
          activeFollowers.forEach(item => {
            if (
              item === props.currentProfile ||
              suggested.length === 5
            ) return;

            if (
              activeFollowedUsers.indexOf(item) === -1 &&
              suggestedByUsername.indexOf(item) === -1
            ) {
              suggested.push(
                <SuggestedItem
                  handleFollow={props.handleFollow}
                  activeUser={props.activeUser}
                  profile={item}
                >
                  <Link to={item}>
                    <img src={usernames.toJSON()[item].profilePhoto} alt='' />
                  </Link>
                  <Link to={item}>{item}</Link>
                </SuggestedItem>
              );

              suggestedByUsername.push(item);
            }
          });
        }

        props.handleSuggested(suggested);
      });
    }
  }, [props]);

  let content;
  if (props.suggested.length === 0) {
    content = (
      <div className='empty'>
        We have nothing to suggest u now lol sorry
     </div>
    );
  } else {
    content = <ul>{props.suggested}</ul>;
  }

  return (
    <div className='suggested'>
      <div className='top-buttons'>
        <span>
          Suggested
        </span>
        <button>
          See All
        </button>
      </div>
      {content}
    </div>
  );
}

export default Suggested;