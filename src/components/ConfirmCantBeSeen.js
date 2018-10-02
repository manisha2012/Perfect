import React, {Component} from 'react';
import {Text, View, Modal} from 'react-native';
import {CardItem, Button, Picker, Form, Item} from 'native-base';
import Confirm from './Confirm';
import MatchedModal from './MatchedModal';
import { connect } from 'react-redux';

import { sendMessage, sendMatchRequestToFriend, showChatsComp, updateChats, updateUsersOnAccept } from '../actions';

class ConfirmCantBeSeen extends Component {

  state = {
    showMatchedModal: false
  };

  onAccept () {
    this.props.onAccept();
    this.props.sendMatchRequestToFriend(this.props.selectedFriendData, this.props.user.additionalUserInfo.profile.picture.data.url);
  }

  componentWillReceiveProps(nextProps) {
    console.log("componentWillReceiveProps :", nextProps);
    if(nextProps.match_request && this.props.match_request != nextProps.match_request) {
      const {selectedFriendData } = this.props;
      var chatFriendData = selectedFriendData;
      chatFriendData.picture = selectedFriendData.picture.data.url;
      const createdAt = new Date();
      this.setState({
        showMatchedModal: true
      });
      this.props.updateChats(chatFriendData, 'Say Hi', createdAt);
      this.props.updateUsersOnAccept(chatFriendData, true);
    }
  }

  startChatting = () => {
    this.setState({
      showMatchedModal: false
    });
    this.props.showChatsComp();
  };

  renderData = () => {
    const {containerStyle, textStyle, cardSectionStyle} = styles;
    const {visible, selectedFriendData } = this.props;
    if(selectedFriendData != null) {
      return (
            <Text style={textStyle}>{selectedFriendData.name} cannot view this request until she/he also sends a request</Text>
      )
    }
  };

  render () {
    console.log("ConfirmCantBeSeen render :", this.props);
    const {visible, selectedFriendData, onAccept, onDecline} = this.props;
    return (
      <View>
        <Confirm visible={visible} onAccept={this.onAccept.bind(this)} onDecline={onDecline}>
          {this.renderData()}
        </Confirm>
        <MatchedModal
          visible={this.state.showMatchedModal}
          startChatting={this.startChatting}
        />
      </View>
    );
  }

}

const styles = {
  cardSectionStyle: {
    justifyContent: 'center'
  },
  textStyle: {
    flex: 1,
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 30
  },
  containerStyle: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    position: 'relative',
    flex: 1,
    justifyContent: 'center'
  }
};

const mapStateToProps = (state) => ({
  selectedFriendData: state.user_friends.selectedFriendData,
  user: state.auth.user,
  match_request: state.match_request
});

export default connect(mapStateToProps, {sendMessage, sendMatchRequestToFriend, showChatsComp, updateChats, updateUsersOnAccept})(ConfirmCantBeSeen);
