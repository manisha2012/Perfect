import React, { Component } from 'react';
import { connect } from 'react-redux';

import { sendMessage, fetchMessages, fetchChatActiveFlag} from '../actions';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ListView,
  Image,
  Button,
  TextInput,
  Alert
} from "react-native";
import { GiftedChat } from "react-native-gifted-chat";
import firebase from "react-native-firebase";
import ChatHeader from './ChatHeader';

class ChatUI extends Component {
    state = {
      messages: this.props.messages
    };

    componentDidMount() {
      this.listenForItems();
    }

    componentWillReceiveProps(nextProps) {
      console.log("componentWillReceiveProps :", nextProps);
    }

    componentDidUpdate(prevProps) {
      // Typical usage (don't forget to compare props):
      if (this.props.messages.length !== prevProps.messages.length) {
        //this.fetchData(this.props.userID);
        console.log("componentDidUpdate ChatUI");
        this.setState({
            messages: this.props.messages
        //   };
        });
      }
    }

    listenForItems(chatRef) {
      console.log("listenForItems rendered");
      this.props.fetchMessages(this.props.chatFriendData, (message) => {
        this.setState((previousState) => {
          return {
            messages: GiftedChat.append(previousState.messages, message),
          };
        });
      });
    }

    onSend(messages = []) {
      var friendData = this.props.chatFriendData;
      console.log("mmmmmmmmmmmmmmm :", messages);
      console.log("friendData here : ", friendData);
      var alertMsg = "Cannot send message to " + friendData.name + " as the chat is inactive.";
      this.props.fetchChatActiveFlag(friendData, (inactiveFlag) => {
        if(friendData.chatActiveFlag == 'Inactive' || inactiveFlag) {
          console.log("yes it is inactive");
          Alert.alert(
            'Inactive Chat',
            alertMsg,
            [
              {text: 'OK', onPress: () => console.log('OK Pressed')},
            ],
            { cancelable: false }
          )
        } else {
          this.props.sendMessage(messages, friendData);
        }
      });
    }


    render() {
      console.log("Messages : ", this.state.messages);
        return (
          <View style={{flex: 1}}>
            <ChatHeader/>
            <GiftedChat
              messages={this.state.messages}
              onSend={this.onSend.bind(this)}
              user={{
                _id: this.props.user.user.providerData[0].uid
              }}
              isAnimated
            />
          </View>
        )
    }
}

  //generate ChatId works cause when you are the user sending chat you take user.uid and your friend takes uid
  // when your friend is using the app to send message s/he takes user.uid and you take the uid cause you are the friend

  // componentWillUnmount() {
  //   this.chatRefData.off();
  // }


const mapStateToProps = (state) => ({
    user: state.auth.user,
    messages: state.chatroom.messages,
    chatFriendData: state.chatroom.meta.chatFriendData
});

export default connect(mapStateToProps, {sendMessage, fetchMessages, fetchChatActiveFlag})(ChatUI);
