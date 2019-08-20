import { connect } from 'react-redux';
import { logout } from '../../Actions/actions'
import ProfilePage from './ProfilePage'

const mapStateToProps = state => {
  return {
    userId: state.userId
  }
}

const mapDispatchToProps = dispatch => {
  return {
    logout: () => dispatch(logout())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProfilePage);