import React from 'react';
import Layout from './Layout/Container';
import Routes from './Routes/routes';
import './App.css'
import { connect } from 'react-redux';
import { createStore } from 'redux'
import userInfo from './Reducers/reducers'

class App extends React.Component {
  render() {
    return (
      this.props.isAuthenticated
        ?
        <Layout>
          <Routes />
        </Layout >
        :
        <Routes />
    );
  };
}

const mapStateToProps = state => {
  return {
    isAuthenticated: state.isAuthenticated
  }
}

export const store = createStore(userInfo);

export default connect(mapStateToProps)(App);


