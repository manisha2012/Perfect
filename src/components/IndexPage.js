import React, { Component } from 'react';
import {StyleSheet, View, TouchableOpacity, Alert} from 'react-native';
import {Text, H1, Button, Spinner, Root} from 'native-base';
import {connect} from 'react-redux';
import {getFriendList} from '../actions';

import firebase from 'react-native-firebase';
import IndexHeader from './IndexHeader';
import IndexFooter from './IndexFooter';
import FriendList from './FriendList';
//import BackgroundSlideShow from './BackgroundSlideShow';

class IndexPage extends Component {
  componentWillMount () {
    console.log("component will mount");
    const user_id = this.props.user.additionalUserInfo.profile.id;
    const access_token = this.props.token;
    console.log("access_token in index page :", access_token);
    this.props.getFriendList(user_id, access_token);
    console.log("still component will mount");
  }

  renderFriends () {
    console.log(this.props.friendList);
    var friendList = this.props.friendList;
    if(this.props.loading && this.props.friendlist_loading) {
      return (
        <View>
          <Spinner />
          <Text style={{textAlign: 'center'}}>Fetching Friends...</Text>
        </View>
      );
    }
    if(friendList != null && friendList.length > 0) {
      return <FriendList />;
    }
  }

  render() {
    console.log("index page render");
    return (
      <Root>
        <IndexHeader />
        {this.renderFriends()}
        <IndexFooter />
      </Root>
    );
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
    }
});

const mapStateToProps = state => {
  console.log("mapStateToProps :", state);
  return {
    user: state.auth.user,
    token: state.auth.token,
    friendList: state.user_friends.friendList,
    friendlist_loading: state.user_friends.friendlist_loading,
    loading: state.auth.friendlist_loading
  };
};

export default connect(mapStateToProps, {getFriendList})(IndexPage);
