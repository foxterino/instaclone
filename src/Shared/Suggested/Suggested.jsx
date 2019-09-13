import React, { useEffect, useState } from 'react';
import './Suggested.css';
import { database } from '../../firebaseConfig';
import SuggestedItem from '../../Shared/SuggestedItem/SuggestedItem';
import { Link } from 'react-router-dom';

const Suggested = (props) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [translateX, setTranslateX] = useState(0);

  useEffect(() => {
    const updateSuggeted = async () => {
      if (props.suggested.length === 0) {
        const usernames = await database.ref(`usernames`).once('value').then(data => data.val());
        const currentFollowedUsers = usernames[props.currentProfile].followedUsers.split(',');
        const activeFollowedUsers = usernames[props.activeUser].followedUsers.split(',');
        const activeFollowers = usernames[props.activeUser].followers.length === 0
          ? []
          : usernames[props.activeUser].followers.split(',');
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

          if (item && activeFollowedUsers.indexOf(item) === -1) {
            suggested.push(
              <SuggestedItem
                handleFollow={props.handleFollow}
                activeUser={props.activeUser}
                profile={item}
              >
                <Link to={`/${item}`}>
                  <img src={usernames[item].profilePhoto} alt='' />
                </Link>
                <Link to={`/${item}`} className='username-link'>{item}</Link>
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
                  <Link to={`/${item}`}>
                    <img src={usernames[item].profilePhoto} alt='' />
                  </Link>
                  <Link to={`/${item}`} className='username-link'>{item}</Link>
                </SuggestedItem>
              );

              suggestedByUsername.push(item);
            }
          });
        }

        if (suggested.length !== props.amount) {
          const usernamesArray = Object.keys(usernames);
          usernamesArray.reverse();

          usernamesArray.forEach(item => {
            if (
              item === props.currentProfile ||
              suggested.length === props.amount ||
              item === props.activeUser
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
                  <Link to={`/${item}`}>
                    <img src={usernames[item].profilePhoto} alt='' />
                  </Link>
                  <Link to={`/${item}`} className='username-link'>{item}</Link>
                </SuggestedItem>
              );

              suggestedByUsername.push(item);
            }
          });
        }

        props.handleSuggested(suggested);
        setIsLoaded(true);
      }
    }

    updateSuggeted();
  }, [props]);

  const handleTranslateX = (amount) => {
    setTranslateX(translateX + amount);
  }

  let content;
  if (!isLoaded) {
    content = <div className='suggested-loading'>Loading...</div>;
  }
  else if (props.suggested.length === 0) {
    content = (
      <div className='empty'>
        We have nothing to suggest u now lol sorry
     </div>
    );
  } else {
    content = (
      <>
        {
          translateX <= (-199 * props.handledAmount) &&
          <button
            className='left-button'
            onClick={() => handleTranslateX(199 * props.handledAmount)}
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
          translateX !== (Math.round(props.suggested.length / props.handledAmount + 0.25) - 1) * (-199 * props.handledAmount) &&
          <button className='right-button'
            onClick={() => handleTranslateX(-199 * props.handledAmount)}
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