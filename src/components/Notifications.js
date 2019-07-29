import React, {Component} from 'react';
import {ListView, TouchableWithoutFeedback, Alert} from 'react-native';
import { Container, Header, View, Content, List, ListItem, Thumbnail, Text, Left, Body, Right, Button, Toast, Root } from 'native-base';
import {connect} from 'react-redux';
import {updateNotifications, showChatsComp, updateChats, updateUsersOnAccept, updateMessages, updateUsersOnDecline, fetchUserActiveChats} from '../actions';
import IndexHeader from './IndexHeader';
import IndexFooter from './IndexFooter';
import MatchedModal from './MatchedModal';
import {NO_OF_ACTIVE_CHATS} from '../constants';

class Notifications extends Component {

  constructor(props) {
    super(props);
    const ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2
    });
    this.state = {
      dataSource: ds.cloneWithRows(this.props.notifications),
      showMatchedModal: false
    }
    console.log("constructor state :", this.state);
  }
  // componentWillMount () {
  //   console.log("notif componentWillMount");
  //   const ds = new ListView.DataSource({
  //     rowHasChanged: (r1, r2) => r1 !== r2
  //   });
  //   this.dataSource = ds.cloneWithRows(this.props.notifications);
  // };

  onAcceptRequest = (notifData) => {
    return function (e) {
      var acceptRequestFlag = false;
      this.props.fetchUserActiveChats((userActiveChatsCount) => {
        if(userActiveChatsCount >= NO_OF_ACTIVE_CHATS) {
          //show alert
          Alert.alert(
            'Inactive Confirm',
            'You already have 2 active chats, so to keep this chat active, inactivate one of the two active chats otherwise this chat will be inactive by default. Are you sure to keep this chat inactive?',
            [
              {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
              {text: 'Continue', onPress: () => {console.log('OK Pressed'); this.updateDataOnAccept(notifData)}},
            ],
            { cancelable: false }
          )
        } else {
          this.updateDataOnAccept(notifData);
        }
      });
    }
  };

  updateDataOnAccept = (notifData) => {
    console.log("updateDataOnAccept here");
    var {friend, _id, text, createdAt} = notifData;
    console.log("on accept request :", friend);
    this.props.updateNotifications(_id, 'ACCEPTED');
    var notifArr = this.props.notifications;
    filteredNotifications = notifArr.filter((notif) => {
      return notif._id !== _id;
    });
    this.setState({
        showMatchedModal: true,
        dataSource: new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 }).cloneWithRows(filteredNotifications)
    });
    this.props.updateChats(friend, text, createdAt);
    this.props.updateUsersOnAccept(friend);
    this.props.updateMessages(friend, text, createdAt);
  };

  onDeclineRequest = (notifData) => {
    return function (e) {
      var {friend, _id, text, createdAt} = notifData;
      console.log("on decline request :", friend);
      Toast.show({
                text: 'Request has been declined!',
                buttonText: 'Okay'
              });

      this.props.updateNotifications(_id, 'DECLINED');
      var notifArr = this.props.notifications;
      filteredNotifications = notifArr.filter((notif) => {
        return notif._id !== _id;
      });
      this.setState({
          dataSource: new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 }).cloneWithRows(filteredNotifications)
      });
      this.props.updateUsersOnDecline(friend);
    }
  };

  renderRow = (notifData) => {
    //to render single row in a list
    console.log("notifData: ", notifData);
    //console.log("row Id :", rowId);
    //var selectedRowArr = this.state.selectedRow;
    return (
      <ListItem thumbnail>
        <Left>
          <Thumbnail square source={{ uri: notifData.friend.picture }} />
        </Left>
        <Body>
          <Text>{notifData.friend.name} has sent a request</Text>
          <Text note>{notifData.text}</Text>
          <Button transparent success onPress={this.onAcceptRequest(notifData).bind(this)} style={{flexDirection: 'row', justifyContent: 'flex-start'}}>
            <Text>Accept</Text>
          </Button>
          <Button transparent warning onPress={this.onDeclineRequest(notifData).bind(this)} style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
            <Text>Decline</Text>
          </Button>
        </Body>

      </ListItem>
    )
  };

  startChatting = () => {
    this.setState({
      showMatchedModal: false
    });
    this.props.showChatsComp();
  };

  renderList = () => {
    var notifArr = this.props.notifications;
    if(notifArr.length > 0) {
      return (
        <ListView dataSource={this.state.dataSource} renderRow={this.renderRow} enableEmptySections={true}/>
      )
    } else {
      return <Text>No Notifications</Text>
    }
  };

  render () {
    console.log("Notifications render rendered :", this.props.notifications);
    console.log("this.state.dataSource : ", this.state.dataSource);
    return (
      <Root>
        <IndexHeader />
        {this.renderList()}
        <MatchedModal
          visible={this.state.showMatchedModal}
          startChatting={this.startChatting}
        />
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
    notifications: state.notifications
  };
};

export default connect(mapStateToProps, {updateNotifications, showChatsComp, updateChats, updateUsersOnAccept, updateMessages, updateUsersOnDecline, fetchUserActiveChats})(Notifications);
//2 step process, first connect is called, it returns a function, which is called with the component as argument
