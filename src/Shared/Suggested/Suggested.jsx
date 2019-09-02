import React from 'react';
import './Suggested.css';

function Suggested(props) {
  let suggested;
  if (props.children.length === 0) {
    suggested = (
      <div className='empty'>
        We have nothing to suggest u now lol sorry
     </div>
    );
  } else {
    suggested = <ul>{props.children}</ul>;
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
      {suggested}
    </div>
  );
}

export default Suggested;