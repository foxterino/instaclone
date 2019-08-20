import { connect } from 'react-redux';
import PrivateRoute from './PrivateRoute'

const mapStateToProps = state => {
  return {
    isAuthenticated: state.isAuthenticated
  }
}

export default connect(mapStateToProps)(PrivateRoute);