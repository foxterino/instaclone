import { connect } from 'react-redux';
import LoginWarning from './LoginWarning'

const mapStateToProps = state => {
  return {
    isAuthenticated: state.isAuthenticated
  }
}

export default connect(mapStateToProps)(LoginWarning);