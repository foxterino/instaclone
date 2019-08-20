import React from 'react';
import { Route, Switch } from "react-router-dom";
import FeedPage from './Feed/Container'
import LoginPage from './Login/Container'
import ProfilePage from './Profile/Container'
import ExplorePage from './Explore/ExplorePage';
import FeedbackPage from './Feedback/FeedbackPage';
import LoginWarning from './LoginWarning/Container';
import RegistrationPage from './Registration/Container';
import CreatePost from './CreatePost/Container';
import PrivateRoute from './PrivateRoute/Container';

class Routes extends React.Component {
  render() {
    return (
      <Switch>
        <Route exact path="/" component={RegistrationPage} />
        <Route path="/login" component={LoginPage} />
        <Route path="/loginWarning" component={LoginWarning} />
        <PrivateRoute path="/feed" component={FeedPage} />
        <PrivateRoute path="/explore" component={ExplorePage} />
        <PrivateRoute path="/feedback" component={FeedbackPage} />
        <PrivateRoute path='/create' component={CreatePost} />
        <PrivateRoute exact path="/:profile" component={ProfilePage} />
      </Switch >
    );
  }
}

export default Routes;