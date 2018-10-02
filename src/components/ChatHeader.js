import React, { Component } from 'react';
import {StyleSheet, View, TouchableOpacity, Alert} from 'react-native';
import {Header, Left, Body, Right, Button, Icon, Title, Badge, Text, Thumbnail} from 'native-base';
import Notification from 'react-native-in-app-notification';
import {connect} from 'react-redux';
import {Actions} from 'react-native-router-flux';
import {authLogout} from '../actions';
//import BackgroundSlideShow from './BackgroundSlideShow';

class ChatHeader extends Component {

  showChats () {
    return function (e) {
      Actions.chats();
    }
  }

  render () {
    return (
      <Header style={{backgroundColor: 'grey', paddingTop: 5, paddingBottom: 5}}>
        <Left>
          <Thumbnail source={{ uri: this.props.chatFriendData.picture }} />
        </Left>
        <Body>
          <Title style={{marginLeft: 10}}>{this.props.chatFriendData.name}</Title>
        </Body>
        <Right>
          <Button transparent onPress={this.showChats.bind(this)}>
            <Text>Back</Text>
          </Button>
        </Right>
      </Header>
    )
  }
}

const styles = StyleSheet.create({
    title: {
        color: 'white',
        marginLeft: 10
    },
    text: {
      textAlign: 'center',
      color: 'white'
    },
    buttonContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 460
    },
    button: {
      width: 250,
      paddingRight: 20,
      paddingLeft: 20
    },
    notifStyle: {
      top: 200,
      position: 'absolute'
    }
});

const mapStateToProps = state => ({
  chatFriendData: state.chatroom.meta.chatFriendData
});

export default connect(mapStateToProps, {authLogout})(ChatHeader);
