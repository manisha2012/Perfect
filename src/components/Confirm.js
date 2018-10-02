import React from 'react';
import {Text, View, Modal} from 'react-native';
import {CardItem, Button} from 'native-base';

const Confirm = ({children, visible, onAccept, onDecline}) => {
  const {containerStyle, textStyle, cardSectionStyle} = styles;
  console.log("Confirm rendered :", visible);
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={() => {}}
    >
      <View style={containerStyle}>
        <CardItem style={cardSectionStyle}>
            {children}
        </CardItem>

        <CardItem style={cardSectionStyle}>
          <Button success rounded onPress={onAccept} style={{width: 100, justifyContent: 'center'}}><Text style={textStyle}>Send</Text></Button>
          <Button danger rounded onPress={onDecline} style={{width: 100, justifyContent: 'center'}}><Text style={textStyle}>Cancel</Text></Button>
        </CardItem>
      </View>
    </Modal>
  );
};

const styles = {
  cardSectionStyle: {
    justifyContent: 'center'
  },
  textStyle: {
    fontSize: 18,
    lineHeight: 40
  },
  containerStyle: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    position: 'relative',
    flex: 1,
    justifyContent: 'center'
  }
};

export default Confirm;
