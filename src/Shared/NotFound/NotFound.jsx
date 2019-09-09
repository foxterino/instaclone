import React from 'react';
import './NotFound.css';
import { Link } from 'react-router-dom';

function NotFound(props) {
  return (
    <div className='not-found'>
      <h2>Sorry, this page isn't available</h2>
      <p>
        {'The link you followed may be broken, or the page may have been removed.\n'}
        <Link to='/feed'>Go back to Instaclone.</Link>
      </p>
    </div>

  );
}

export default NotFound;