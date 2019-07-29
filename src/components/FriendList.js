import React, {Component} from 'react';
import {ListView, Alert} from 'react-native';
import { Container, Header, View, Content, List, ListItem, Thumbnail, Text, Left, Body, Right, Button, Toast } from 'native-base';
import Menu, { MenuContext, MenuOptions, MenuOption, MenuTrigger } from 'react-native-menu';
import ConfirmCanBeSeen from './ConfirmCanBeSeen';
import ConfirmCantBeSeen from './ConfirmCantBeSeen';
import ChatUI from './ChatUI';
import {connect} from 'react-redux';
import {openChatWindow, setSelectedFriend, sendNotificationToFriend} from '../actions';
import SendRequestMenu from './SendRequestMenu';

class FriendList extends Component {
  // state = {
  //   showModal: false,
  //   disableButton: false,
  //   selectedRow: ''
  // };

  constructor(props) {
    super(props);
    const ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2
    });
    this.state = {
      dataSource: ds.cloneWithRows(this.props.friendList),
      showSeenModal: false,
      showNotSeenModal: false,
      selectedRow: []
    }
    console.log("constructor state :", this.state);
  }

  // componentWillMount () {
  //   console.log("componentWillMount rendered");
  //   const ds = new ListView.DataSource({
  //     rowHasChanged: (r1, r2) => r1 === r2
  //   });
  //   this.dataSource = ds.cloneWithRows(this.props.friendList);
  // }

  componentWillReceiveProps(nextProps) {
    console.log("componentWillReceiveProps :", nextProps);
    this.setState({
      dataSource: new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 }).cloneWithRows(nextProps.friendList)
    });
  }

  sendRequestBtnPressed = (friendData, rowId, option) => {
    console.log("friendData", friendData);
    console.log("rowId", rowId);
    console.log("option", option);
      var selectedRowArr = this.state.selectedRow;
      selectedRowArr.push(rowId);
      this.setState({
        showSeenModal: option == '0' ? true : false,
        showNotSeenModal: option == '1' ? true : false,
        selectedRow: selectedRowArr
      });
      console.log("sendRequestBtnPressed state :", this.state);
      this.props.setSelectedFriend(friendData);
  };

  undoRequest = (friendData) => {
    return function () {
      Alert.alert(
        'Alert Title',
        'My Alert Msg',
        [
          {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
          {text: 'OK', onPress: () => console.log('OK Pressed')},
        ],
        { cancelable: false }
      )
    }
  };

  renderButton = (friendData, selectedRowArr, rowId) => {
    console.log("renderButton");
    if(friendData.matched) {
      return <Text style={{color: 'green'}}>Matched</Text>
    } else {
      var disableButton = (('sentTextAt' in friendData) && (friendData.sentTextAt != null)) ||
                          (('sentMatchRequestAt' in friendData) && (friendData.sentMatchRequestAt != null)) ||
                          (('hasReceivedRequest' in friendData) && (friendData.hasReceivedRequest)) ||
                          (('actionTakenOnRequest' in friendData) && (friendData.actionTakenOnRequest === 'DECLINED'))
                          ? true
                          : false;
      console.log("disableButton :", disableButton);
      return (
        // <Button disabled={(('sentTextAt' in friendData) && (friendData.sentTextAt != null) ? true : false ) || (this.state.disableButton ? (selectedRowArr.includes(rowId) ? true : false) : false) } onPress={this.sendRequestBtnPressed(friendData, rowId).bind(this)}>
        //   <Text>Send Request</Text>
        // </Button>
        <SendRequestMenu
            actions={['Can Be Seen','Cannot Be Seen']}
            onPress={(e,i) => this.sendRequestBtnPressed(friendData, rowId, i)}
            disableButton={disableButton}
          />
      )
    }
  };

  renderRow = (friendData, sectionId, rowId) => {
    //to render single row in a list
    console.log("row state: ", this.state);
    console.log("friendData: ", friendData);
    console.log("row Id :", rowId);
    var selectedRowArr = this.state.selectedRow;
    return (
      <ListItem thumbnail>
        <Left>
          <Thumbnail square source={{ uri: friendData.picture.data.url }} />
        </Left>
        <Body>
          <Text>{friendData.name}</Text>
        </Body>
        <Right>
          {this.renderButton(friendData, selectedRowArr, rowId)}
        </Right>
      </ListItem>
    )
  };

  onDecline = () => {
    this.setState({
      showSeenModal: false
    });
  };

  onNotSeenDecline = () => {
    this.setState({
      showNotSeenModal: false
    });
  };

  onAccept = () => {
    console.log("Send the message");
    //this.props.openChatWindow(this.props.selectedFriendData.id);
    //ths.props.sendNotificationToFriend(this.props.selectedFriendData.id);
    Toast.show({
              text: 'Message has been sent!',
              buttonText: 'Okay'
            });
    this.setState({
      showSeenModal: false,
      dataSource: new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 }).cloneWithRows(this.props.friendList)
    });
    console.log("onAccept state :", this.state);
  };

  onNotSeenAccept = () => {
    console.log("Send the message");
    //this.props.openChatWindow(this.props.selectedFriendData.id);
    //ths.props.sendNotificationToFriend(this.props.selectedFriendData.id);
    Toast.show({
              text: 'Message has been sent!',
              buttonText: 'Okay'
            });
    this.setState({
      showNotSeenModal: false,
      dataSource: new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 }).cloneWithRows(this.props.friendList)
    });
    console.log("onAccept state :", this.state);
  };

  render () {
    console.log("render function state", this.state);
    return (
      <View>
        <ListView dataSource={this.state.dataSource} renderRow={this.renderRow} />
        <ConfirmCanBeSeen
          visible={this.state.showSeenModal}
          selectedFriendData={this.props.selectedFriendData}
          onAccept={this.onAccept}
          onDecline={this.onDecline}
        />
       <ConfirmCantBeSeen
          visible={this.state.showNotSeenModal}
          selectedFriendData={this.props.selectedFriendData}
          onAccept={this.onNotSeenAccept}
          onDecline={this.onNotSeenDecline}
        />
      </View>
    );
  }

}

const mapStateToProps = state => {
  return {
    user: state.auth.user,
    friendList: state.user_friends.friendList,
    friendlist_loading: state.user_friends.friendlist_loading,
    loading: state.auth.friendlist_loading,
    selectedFriendData: state.user_friends.selectedFriendData
  };
};

export default connect(mapStateToProps, {openChatWindow, setSelectedFriend, sendNotificationToFriend})(FriendList);
