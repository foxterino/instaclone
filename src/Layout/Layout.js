import React from 'react'
import './Layout.css'
import Header from './Header/Header'
import UpdownButton from './UpdownButton/UpdownButton'
import { database } from '../firebase';

class Layout extends React.Component {
  state = { activeUser: null }

  componentDidMount() {
    database.ref(`users/${this.props.userId}`).once('value', data => {
      this.setState({ activeUser: data.toJSON().username.toLowerCase() });
    });
  }

  render() {
    return (
      <>
        <Header activeUser={this.state.activeUser} />
        <UpdownButton />
        {this.props.children}
      </>
    );
  }
}

export default Layout;