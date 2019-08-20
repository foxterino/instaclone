import React from 'react'
import './OptionsModalWindow.css'

function OptionsModalWindow(props) {
  let options;
  if (props.handleDeletePost) {
    options = (
      <button className='delete-button' onClick={props.handleDeletePost} >
        Delete
      </button>
    );
  }
  else if (props.handleUnfollow) {
    options = (
      <>
        <a className='dangerous-button' href='#'>Report inappropriate</a>
        <button className='unfollow-button' onClick={props.handleUnfollow} >
          Unfollow
        </button>
      </>
    );
  }
  else {
    options = (
      <>
        <a className='dangerous-button' href='#'>Report inappropriate</a>
      </>
    );
  }

  if (props.isModal) {
    return (
      <div
        className='options-modal-window-wrapper'
        onClick={props.handleModalClose}
      >
        <div className='options-modal-window'>
          {options}
          <a href='#'>Go to post</a>
          <a href='#'>Share</a>
          <a href='#'>Copy link</a>
          <button
            className='options-close-button'
            onClick={props.handleModalClose}
          >
            Cancel
          </button>
        </div>
      </div >
    );
  }

  return null;
}

export default OptionsModalWindow;