import React from 'react';
import {View,TouchableOpacity,UIManager,findNodeHandle, Text} from 'react-native';
import {Button} from 'native-base';
//import Icon from 'react-native-vector-icons/Ionicons';

const ICON_SIZE = 24;

class SendRequestMenu extends React.Component {
  handleShowPopupError = () => {
    // show error here
  };

  handleMenuPress = () => {
    const { actions, onPress } = this.props;

    UIManager.showPopupMenu(
      findNodeHandle(this.refs.menu),
      actions,
      this.handleShowPopupError,
      onPress,
    );
  };

  render() {
    return (
      <View>
        { this.props.children }
        <Button onPress={this.handleMenuPress} style={{alignSelf:'center',paddingLeft:15,paddingRight:15}} disabled={this.props.disableButton}>
          <Text ref="menu" style={{color: 'white'}}>Send Request</Text>
        </Button>
      </View>
    );
  }
}

// SendRequestMenu.propTypes = {
//   actions: React.PropTypes.array.isRequired,
//   onPress: React.PropTypes.func.isRequired,
//   children: React.PropTypes.object.isRequired,
// };

export default SendRequestMenu;
