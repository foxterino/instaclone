import { connect } from 'react-redux';
import ModalPicture from './ModalPicture'

const mapStateToProps = state => {
  return {
    userId: state.userId
  }
}

export default connect(mapStateToProps)(ModalPicture);