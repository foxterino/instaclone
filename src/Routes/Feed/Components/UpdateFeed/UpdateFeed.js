import React from 'react';
import './UpdateFeed.css';

function UpdateFeed(props) {
  return (
    <div className={'update-feed'}>
      <button onClick={() => props.handleNewPosts()}>New posts.</button>
    </div >
  );
}

export default UpdateFeed;