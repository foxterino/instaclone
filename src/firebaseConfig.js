import firebase from 'firebase'

var firebaseConfig = {
  apiKey: 'AIzaSyC9mIIGeIIbVeuW8FKr6Gl4WUKq_YS8Uu0',
  authDomain: 'instaclone-bd.firebaseapp.com',
  databaseURL: 'https://instaclone-bd.firebaseio.com',
  projectId: 'instaclone-bd',
  storageBucket: '',
  messagingSenderId: '222586982648',
  appId: '1:222586982648:web:7f010cbe36e32353'
};

firebase.initializeApp(firebaseConfig);

export const database = firebase.database();
export const auth = firebase.auth();