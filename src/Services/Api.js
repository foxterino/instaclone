import { database } from '../firebaseConfig'

export const handleFollow = async (activeUser, currentProfile, isFollowed) => {
  const data = await database.ref(`usernames/${activeUser}`).once('value').then(data => data.val());
  const usernames = await database.ref(`usernames/${currentProfile}`).once('value').then(data => data.val());
  let followedUsers = data.followedUsers.split(',');

  if (isFollowed) {
    const index = followedUsers.indexOf(currentProfile);

    followedUsers.splice(index, 1);
    followedUsers = followedUsers.join(',');

    database.ref(`usernames/${activeUser}`).update({ followedUsers: followedUsers });

    let followers = usernames.followers.split(',');
    const usernamesIndex = followers.indexOf(activeUser);

    followers.splice(usernamesIndex, 1);
    followers = followers.join(',');

    database.ref(`usernames/${currentProfile}`).update({ followers: followers });
  }
  else {
    followedUsers.push(currentProfile);
    followedUsers = followedUsers.join(',');

    database.ref(`usernames/${activeUser}`).update({ followedUsers: followedUsers });

    let followers = usernames.followers.split(',');

    if (followers[0]) {
      followers.push(activeUser);
      followers = followers.join(',');
    } else {
      followers = activeUser;
    }

    database.ref(`usernames/${currentProfile}`).update({ followers: followers });
  }
}

export const handleLike = async (e, currentLikeCount, isLiked, postId, userId) => {
  e.target.classList.toggle('liked');

  let likeCount = isLiked
    ? currentLikeCount - 1
    : currentLikeCount + 1;

  updateLikedPosts(isLiked, postId, userId);
  database.ref(`posts/${postId}`).update({ likeCount: likeCount });
}

export const updateLikedPosts = async (isLiked, postId, userId) => {
  const data = await database.ref(`users/${userId}`).once('value').then(data => data.val());

  let likedPosts;

  if (isLiked) {
    likedPosts = data.likedPosts.split(',').map((item) => {
      return +item;
    });

    if (likedPosts.length === 1) {
      likedPosts = '';
    } else {
      const postIndex = likedPosts.indexOf(postId);

      likedPosts.splice(postIndex, 1);
      likedPosts = likedPosts.join(',');
    }
  }
  else {
    likedPosts = data.likedPosts.split(',');

    if (likedPosts[0]) {
      likedPosts.push(postId);
      likedPosts = likedPosts.join(',');
    } else {
      likedPosts = `${postId}`;
    }
  }

  database.ref(`users/${userId}`).update({
    likedPosts: likedPosts
  });
}