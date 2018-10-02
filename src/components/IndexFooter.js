import React, { Component } from 'react';
import {StyleSheet, View, TouchableOpacity, Alert} from 'react-native';
import {Footer, FooterTab, Button, Text} from 'native-base';
import Notification from 'react-native-in-app-notification';
import {connect} from 'react-redux';
import {Actions} from 'react-native-router-flux';
import {authLogout, showChatsComp} from '../actions';
//import BackgroundSlideShow from './BackgroundSlideShow';

class IndexFooter extends Component {

  showChats () {
    this.props.showChatsComp();
  };

  render () {
    return (
      <Footer style={styles.footer}>
          <FooterTab>
            <Button onPress={() => Actions.index()}>
              <Text>Friends</Text>
            </Button>
            <Button onPress={this.showChats.bind(this)}>
              <Text>Chats</Text>
            </Button>
          </FooterTab>
        </Footer>
    )
  }
}

const styles = StyleSheet.create({
    footer: {
      bottom: 0,
      position: 'absolute'
    }
});

// const mapStateToProps = state => ({
//   notifCount: state.notifications.length
// });

export default connect(null, {authLogout, showChatsComp})(IndexFooter);
