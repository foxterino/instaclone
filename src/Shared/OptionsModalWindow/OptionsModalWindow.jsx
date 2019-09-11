import React from 'react'
import './OptionsModalWindow.css'

const OptionsModalWindow = (props) => {
  return (
    <div
      className='options-modal-window-wrapper'
      onClick={props.handleModalClose}
    >
      <div className='options-modal-window'>
        {props.children}
        <button className='options-close-button'>Cancel</button>
      </div>
    </div >
  );
}

export default OptionsModalWindow;