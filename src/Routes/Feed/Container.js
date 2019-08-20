import { connect } from 'react-redux';
import FeedPage from './FeedPage'

const mapStateToProps = state => {
  return {
    userId: state.userId
  };
}

export default connect(mapStateToProps)(FeedPage);