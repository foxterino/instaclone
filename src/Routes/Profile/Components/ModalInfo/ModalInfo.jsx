import React from 'react';
import './ModalInfo.css';

function ModalInfo(props) {
  return (
    <div className='modal-info-wrapper'>
      <div className='modal-info'>
        <h1>{props.type}</h1>
        <ul>
          {props.children}
        </ul>
      </div>
    </div>
  );
}

export default ModalInfo;