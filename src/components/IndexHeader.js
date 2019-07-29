import React, { Component } from 'react';
import {StyleSheet, View, TouchableOpacity, Alert} from 'react-native';
import {Header, Left, Body, Right, Button, Icon, Title, Badge, Text} from 'native-base';
import Notification from 'react-native-in-app-notification';
import {connect} from 'react-redux';
import {Actions} from 'react-native-router-flux';
import {showNotificationComp, authLogout, fetchNotifSeen} from '../actions';
//import BackgroundSlideShow from './BackgroundSlideShow';

class IndexHeader extends Component {

  state = {
    hasSeenNotif: null
  };

  componentDidMount() {
    console.log("componentDidMount rendered");
    this.props.fetchNotifSeen((hasSeenFlag) => {
      this.setState({
        hasSeenNotif: hasSeenFlag
      });
    });
  }

  componentWillUnmount() {
    console.log("componentDidMount rendered");
  }

  showNotifications () {
    this.props.showNotificationComp();
  }

  renderBadge = () => {
    if(!this.state.hasSeenNotif && this.state.hasSeenNotif != null) {
      return (
        <Badge style={{ position: 'absolute' }}>
          <Icon name="star" style={{ fontSize: 15, color: "#fff", lineHeight: 20 }}/>
        </Badge>
      )
    }
  }

  render () {
    //<Text>{this.props.notifCount}</Text>
    console.log("IndexHeader rendered");
    return (
      <Header>
            <Left>
              <Button transparent>
                <Icon name='menu' />
              </Button>
            </Left>
            <Body>
              <Title>Pefect Match</Title>
            </Body>
            <Right>
              <Button transparent onPress={this.showNotifications.bind(this)}>
                {this.renderBadge()}
                <Icon name='heart' />
              </Button>
              <Button transparent onPress={this.props.authLogout}>
                <Icon name='person' />
              </Button>
            </Right>
          </Header>
    )
  }
}

const styles = StyleSheet.create({
    title: {
        textAlign: 'center',
        color: 'white',
        fontSize: 32,
        marginTop: 10
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
  notifCount: state.notifications.length
});

export default connect(mapStateToProps, {showNotificationComp, authLogout, fetchNotifSeen})(IndexHeader);
