import { connect } from 'react-redux';
import CreatePost from './CreatePost'

const mapStateToProps = state => {
  return {
    userId: state.userId
  };
}

export default connect(mapStateToProps)(CreatePost);