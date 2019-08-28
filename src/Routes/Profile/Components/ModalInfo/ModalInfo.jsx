import React from 'react';
import './ModalInfo.css';

function ModalInfo(props) {
  return (
    <div
      className='modal-info-wrapper'
      onClick={(e) => props.handleModalInfoClose(e)}
    >
      <div className='modal-info'>
        <div className='header-wrapper'>
          <h1>{props.type}</h1>
          <button className='close-button'>X</button>
        </div>
        <ul>
          {props.children}
        </ul>
      </div>
    </div>
  );
}

export default ModalInfo;