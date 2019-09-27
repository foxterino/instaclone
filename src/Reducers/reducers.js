import { LOGIN, LOGOUT } from '../Action-types/action-types'

function userInfo(state, action) {
  switch (action.type) {
    case LOGIN:
      return {
        userId: action.userId,
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