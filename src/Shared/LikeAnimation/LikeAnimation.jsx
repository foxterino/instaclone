import React from 'react'
import './LikeAnimation.css'

const LikeAnimation = ({ isLikeAnim }) => {
  return (
    <div className={isLikeAnim ? 'like like-active' : 'like'}>
      You have liked this post
    </div>
  );
}

export default LikeAnimation;