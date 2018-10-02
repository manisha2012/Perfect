import React from 'react';
import {Scene, Router, Actions} from 'react-native-router-flux';
import LandingPage from './components/LandingPage';
import IndexPage from './components/IndexPage';
import ChatUI from './components/ChatUI';
import Notifications from './components/Notifications';
import ChatsScreen from './components/ChatsScreen';

const RouterComponent = () => {
  return (
    <Router>
      <Scene key="root" hideNavBar={true}>
        <Scene key="auth">
          <Scene key="login" component={LandingPage} hideNavBar={true} />
        </Scene>
        <Scene key="main">
          <Scene key="index" component={IndexPage} hideNavBar={true}/>
          <Scene key="chat" component={ChatUI} hideNavBar={true}/>
          <Scene key="notif" component={Notifications} hideNavBar={true}/>
          <Scene key="chats" component={ChatsScreen} hideNavBar={true}/>
        </Scene>
      </Scene>
    </Router>
  )
};

export default RouterComponent;
