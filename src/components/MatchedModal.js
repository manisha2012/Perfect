import React, {Component} from 'react';
import {Text, View, Modal, Image, TouchableOpacity, ScrollView, TouchableWithoutFeedback} from 'react-native';
import {CardItem, Button, Body} from 'native-base';

class MatchedModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: this.props.visible
    }
    console.log("constructor state :", this.state);
  }

  componentDidUpdate(prevProps, prevState) {
    console.log("componentDidUpdate rendered");
    if(prevProps.visible!==this.props.visible){
      //Perform some operation here
      this.setState({modalVisible: this.props.visible});
    }
  }

  render () {
    //this.setState({modalVisible: this.props.visible});
    console.log("MatchedModal rendered :", this.props.visible);
    console.log("MatchedModal rendered state :", this.state.modalVisible);
    const {containerStyle, textStyle, cardSectionStyle} = styles;
    return (
        <Modal
          visible={this.state.modalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => {this.setState({modalVisible: false})}}
        >

              <View style={containerStyle}>
                  <CardItem style={cardSectionStyle}>
                      <Text style={textStyle}>Matched</Text>
                  </CardItem>
                  <CardItem cardBody>
                    <Image source={require('../images/matched.jpg')} style={{height: 250, width: 80, flex: 1}}/>
                  </CardItem>
                  <CardItem style={cardSectionStyle}>
                    <Body>
                      <Button block warning onPress={this.props.startChatting}><Text>Start Chatting</Text></Button>
                    </Body>
                  </CardItem>
                </View>
      </Modal>
    )
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

export default MatchedModal;
