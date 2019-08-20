import { LOGIN, LOGOUT } from '../Action-types/action-types'

export function login(userId) {
  return {
    type: LOGIN,
    userId
  }
}

export function logout() {
  return {
    type: LOGOUT
  }
}