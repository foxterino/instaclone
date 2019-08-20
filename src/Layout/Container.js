import { connect } from 'react-redux';
import Layout from './Layout';

const mapStateToProps = state => {
  return {
    userId: state.userId
  }
}

export default connect(mapStateToProps)(Layout);