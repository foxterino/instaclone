import { database } from '../firebaseConfig'

export const handleFollow = async (activeUser, currentProfile, isFollowed) => {
  let data = await database.ref(`usernames/${activeUser}`).once('value', data => data);
  data = data.toJSON();
  let usernames = await database.ref(`usernames/${currentProfile}`).once('value', data => data);
  usernames = usernames.toJSON();
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