import { LOGIN, LOGOUT } from '../Action-types/action-types'

const initialState = {
  userId: localStorage.getItem('userId'),
  isAuthenticated: localStorage.getItem('isLoggined') || false
}

function userInfo(state = initialState, actions) {
  switch (actions.type) {
    case LOGIN:
      return {
        userId: actions.userId,
        isAuthenticated: true
      }

    case LOGOUT:
      return {
        userId: '',
        isAuthenticated: false
      }

    default:
      return state;
  }
}

export default userInfo;