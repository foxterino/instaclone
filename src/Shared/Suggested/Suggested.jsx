import React, { useEffect, useState } from 'react';
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
        const activeFollowers = usernames.toJSON()[props.activeUser].followers.length === 0
          ? []
          : usernames.toJSON()[props.activeUser].followers.split(',');
        const suggested = [];
        const suggestedByUsername = [];

        currentFollowedUsers.reverse();
        activeFollowedUsers.reverse();

        currentFollowedUsers.forEach(item => {
          if (
            item === props.currentProfile ||
            suggested.length === props.amount ||
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

        if (suggested.length !== props.amount) {
          activeFollowers.forEach(item => {
            if (
              item === props.currentProfile ||
              suggested.length === props.amount
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

        if (suggested.length !== props.amount) {
          const usernamesArray = Object.keys(usernames.toJSON());
          usernamesArray.reverse();

          usernamesArray.forEach(item => {
            if (
              item === props.currentProfile ||
              suggested.length === props.amount ||
              item === props.activeUser
            ) return;

            if (suggestedByUsername.indexOf(item) === -1) {
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

  const [translateX, setTranslateX] = useState(0);

  function handleTranslateX(amount) {
    setTranslateX(translateX + amount);
  }

  let content;
  if (props.suggested.length === 0) {
    content = (
      <div className='empty'>
        We have nothing to suggest u now lol sorry
     </div>
    );
  } else {
    content = (
      <>
        {
          translateX <= '-796' &&
          <button
            className='left-button'
            onClick={() => handleTranslateX(796)}
          >
            {'<'}
          </button>
        }
        <div className='list-wrapper'>
          <ul style={{ transform: `translateX(${translateX}px)` }}>
            {props.suggested}
          </ul>
        </div>
        {
          props.suggested.length >= props.handledAmount &&
          translateX !== Math.floor(props.suggested.length / props.handledAmount) * (-796) &&
          <button className='right-button'
            onClick={() => handleTranslateX(-796)}
          >
            {'>'}
          </button>
        }
      </>
    );
  }

  return (
    <div className='suggested'>
      {props.children}
      {content}
    </div>
  );
}

export default Suggested;