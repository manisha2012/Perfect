import React, {Component} from 'react';
import {Text, View, Modal} from 'react-native';
import {CardItem, Button, Picker, Form, Item, CheckBox, Body} from 'native-base';
import Confirm from './Confirm';
import { connect } from 'react-redux';

import { sendMessage, sendNotificationToFriend } from '../actions';

class ConfirmCanBeSeen extends Component {

  state = {
      selected: "Up for a coffee?",
      priorityChecked: false
    };

  onValueChange(value: string) {
    this.setState({
      selected: value
    });
  }

  onPriorityCheckPress() {
    this.setState({
      priorityChecked: !this.state.priorityChecked
    });
  }

  onAccept () {
    this.props.onAccept();
    this.props.sendNotificationToFriend(this.state.selected, this.state.priorityChecked, this.props.selectedFriendData, this.props.user.additionalUserInfo.profile.picture.data.url);
  }

  renderData = () => {
    const {containerStyle, textStyle, cardSectionStyle} = styles;
    const {visible, selectedFriendData } = this.props;
    if(selectedFriendData != null) {
      return (
        <View>
          <Form>
            <Item>
              <Text style={textStyle}>Please select message to be sent to {selectedFriendData.name}</Text>
            </Item>
            <Item picker>
              <Picker
                note
                mode="dropdown"
                style={{ width: 200 }}
                selectedValue={this.state.selected}
                onValueChange={this.onValueChange.bind(this)}
              >
                <Picker.Item label="How are you?" value="How are you?" />
                <Picker.Item label="Up for a coffee?" value="Up for a coffee?" />
                <Picker.Item label="I really like you" value="I really like you" />
                <Picker.Item label="Can we meet?" value="Can we meet?" />
              </Picker>
            </Item>
            <Item>
              <CheckBox checked={this.state.priorityChecked} onPress={this.onPriorityCheckPress.bind(this)} color="green"/>
              <Body>
                <Text>Set as Priority</Text>
              </Body>
            </Item>
            <Item>
              <Text style={textStyle}>{selectedFriendData.name} can view this message</Text>
            </Item>
          </Form>
        </View>
      )
    }
  };

  render () {
    const {visible, selectedFriendData, onAccept, onDecline} = this.props;
    return (
      <View>
        <Confirm visible={visible} onAccept={this.onAccept.bind(this)} onDecline={onDecline}>
          {this.renderData()}
        </Confirm>
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
  user: state.auth.user
});

export default connect(mapStateToProps, {sendMessage, sendNotificationToFriend})(ConfirmCanBeSeen);
