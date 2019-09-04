import { connect } from 'react-redux';
import SuggestedPage from './SuggestedPage';

const mapStateToProps = state => {
  return {
    userId: state.userId
  }
}

export default connect(mapStateToProps)(SuggestedPage);