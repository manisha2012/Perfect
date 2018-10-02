import React, { Component } from 'react';
import {StyleSheet, View, TouchableOpacity, Alert} from 'react-native';
import {Text, H1, Button, Toast, Root, Spinner} from 'native-base';
import {connect} from 'react-redux';
import {loginUser, authAutoSignIn} from '../actions';

//import { handleFbLogin } from '../lib/auth';
import BackgroundImage from './BackgroundImage';

//import BackgroundSlideShow from './BackgroundSlideShow';

class LandingPage extends Component {
  componentDidMount () {
    this.props.authAutoSignIn();
  }

  componentDidUpdate () {
    if(this.props.error) {
      this.renderError();
    }
  }

  onButtonPress () {
    this.props.loginUser();
  }

  renderError() {
    return (
      Toast.show({
        text: this.props.error,
        buttonText: "Okay"
      })
    );
  }
  renderData () {
    if(this.props.loading) {
      console.log("loading", this.props.loading);
      return <Spinner />;
    }
    console.log("notloading", this.props.loading);
    return (
      <BackgroundImage>
        <H1 style={styles.title}>Perfect Match</H1>
        <Text style={styles.text}>An app for relationships</Text>
        <View style={styles.buttonContainer}>
          <Button rounded primary onPress={this.onButtonPress.bind(this)} style={styles.button}><Text>Sign in with facebook</Text></Button>
        </View>
      </BackgroundImage>
    )
  }

  render () {
    return (
      <Root>
        {this.renderData()}
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
  return {
    error: state.auth.error,
    loading: state.auth.loading
  };
};

export default connect(mapStateToProps, {loginUser, authAutoSignIn})(LandingPage);
