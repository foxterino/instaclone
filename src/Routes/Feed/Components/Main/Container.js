import { connect } from 'react-redux'
import Main from './Main'

const mapStateToProps = state => {
  return {
    userId: state.userId
  }
}

export default connect(mapStateToProps)(Main);