import React from 'react'
import './LikeAnimation.css'

function LikeAnimation(props) {
  return (
    <div className={props.isLikeAnim ? 'like like-active' : 'like'}>
      You have liked this post
    </div>
  );
}

export default LikeAnimation;