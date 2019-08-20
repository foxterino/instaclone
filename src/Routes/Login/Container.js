import { login } from '../../Actions/actions'
import { connect } from 'react-redux'
import LoginPage from './LoginPage'

const mapStateToProps = state => {
  return {
    isAuthenticated: state.isAuthenticated
  }
}

const mapDispatchToProps = dispatch => {
  return {
    login: userId => dispatch(login(userId))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginPage);