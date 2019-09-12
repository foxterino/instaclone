import { connect } from 'react-redux'
import ExplorePage from './ExplorePage'

const mapStateToProps = state => {
  return {
    userId: state.userId
  };
}

export default connect(mapStateToProps)(ExplorePage);