import React, {Component} from 'react';
import {ListView, TouchableWithoutFeedback, TouchableOpacity} from 'react-native';
import { Container, Header, View, Content, List, ListItem, Thumbnail, Text, Left, Body, Right, Button, Toast, Root, CardItem } from 'native-base';
import {connect} from 'react-redux';
import {Actions} from 'react-native-router-flux';
import {openChatWindow, updateNotifications, setChatFriendData, changeActiveChatFlag, fetchChats} from '../actions';
import IndexHeader from './IndexHeader';
import IndexFooter from './IndexFooter';
import MatchedModal from './MatchedModal';
import ChatMenu from './ChatMenu';
import {NO_OF_ACTIVE_CHATS} from '../constants';

class ChatsScreen extends Component {

  constructor(props) {
    super(props);
    const ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2
    });
    this.state = {
      dataSource: ds.cloneWithRows(this.props.chats)
    }
    console.log("constructor state :", this.state);
  }

  componentDidMount() {
    this.props.fetchChats();
  }

  componentWillReceiveProps(nextProps) {
    if(this.props.chats !== nextProps.chats) {
      this.setState({
        dataSource: new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 }).cloneWithRows(nextProps.chats)
      });
    }
  }

  openChatWindow = (chatData, activeFlag) => {
    return function (e) {
      console.log("openChatWindow :", chatData);
      //this.props.openChatWindow(chatData.friend);
      var chatFriendData = chatData.friend;
      chatFriendData.chatActiveFlag = activeFlag;
      this.props.setChatFriendData(chatFriendData);
      Actions.chat();
    }
  };

  menuBtnPressed = (chatData, i, selectedValue) => {
    console.log("menuBtnPressed :", i);
    console.log("menuBtnPressed selectedValue :", selectedValue);
    var selectedFriendId = '';
    var selectedFriendFlag = '';
    var swapFriendId = '';
    var swapFriendFlag = '';
    if(selectedValue) {
      selectedFriendFlag = selectedValue;
      selectedFriendId = chatData.friend.id;
      swapFriendFlag = chatData.activeChatFlag;
      var chatsArr = this.props.chats;
      if(selectedValue !== 'Inactive') {
        for(var i in chatsArr) {
          if(chatsArr[i]['activeChatFlag'] === selectedValue) {
            swapFriendId = chatsArr[i]['friend']['id'];
            break;
          }
        }
      }
      console.log("changeActiveChatFlag : ", selectedFriendId, selectedFriendFlag, swapFriendId, swapFriendFlag);
      this.props.changeActiveChatFlag(selectedFriendId, selectedFriendFlag, swapFriendId, swapFriendFlag);
    }
  };

  renderRow = (chatData) => {
    //to render single row in a list
    console.log("chatData: ", chatData);
    //console.log("row Id :", rowId);
    //var selectedRowArr = this.state.selectedRow;
    var chatMenuOptionsArr = ['Inactive'];
    for(var i=1; i<=NO_OF_ACTIVE_CHATS; i++) {
      chatMenuOptionsArr.push("Active " + i);
    }
    var filteredOptionsArr = chatMenuOptionsArr.filter((chatMenuOption) => {
      return chatMenuOption !== chatData.activeChatFlag;
    });
    console.log("filteredOptionsArr here :", filteredOptionsArr);
    return (
      <TouchableOpacity
          onPress={this.openChatWindow(chatData, chatData.activeChatFlag).bind(this)}
          style={chatData.activeChatFlag === 'Inactive' ? {backgroundColor: 'grey'} : {}}
          activeOpacity={1}
      >
        <View>
          <CardItem>
            <Left>
              <Thumbnail source={{ uri: chatData.friend.picture }} />
            </Left>
            <Body>
              <Text>{chatData.friend.name}</Text>
              <Text note>{chatData.text}</Text>
            </Body>
            <Right>
              <ChatMenu
                  actions={filteredOptionsArr}
                  onPress={(e,i) => this.menuBtnPressed(chatData, i, filteredOptionsArr[i])}
                />
              <Text style={{backgroundColor: '#75f2f2', color: 'blue'}}>{chatData.activeChatFlag}</Text>
              <Text note>{chatData.createdAt}</Text>
            </Right>
          </CardItem>
        </View>
      </TouchableOpacity>
    )
  };

  renderList = () => {
    var chatsArr = this.props.chats;
    if(chatsArr.length > 0) {
      return (
        <ListView dataSource={this.state.dataSource} renderRow={this.renderRow} enableEmptySections={true}/>
      )
    } else {
      return <Text>No Chats</Text>
    }
  };

  render () {
    console.log("Chats render rendered :", this.props.chats);
    //console.log("this.dataSource : ", this.dataSource);
    return (
      <Root>
        <IndexHeader />
        {this.renderList()}
        <IndexFooter />
      </Root>
    );
  }
}

const styles = {
  cardSectionStyle: {
    justifyContent: 'center'
  },
  textStyle: {
    flex: 1,
    fontSize: 20,
    textAlign: 'center',
    lineHeight: 40
  },
  containerStyle: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    position: 'relative',
    flex: 1,
    justifyContent: 'center'
  }
};

const mapStateToProps = state => {
  console.log("kiski id null", state);
  return {
    chats: state.chatroom.chats
  };
};

export default connect(mapStateToProps, {openChatWindow, updateNotifications, setChatFriendData, changeActiveChatFlag, fetchChats})(ChatsScreen);
//2 step process, first connect is called, it returns a function, which is called with the component as argument
