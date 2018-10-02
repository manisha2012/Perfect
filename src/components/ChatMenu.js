import React from 'react';
import {View,TouchableOpacity,UIManager,findNodeHandle, Text} from 'react-native';
import {Button, Icon} from 'native-base';
//import Icon from 'react-native-vector-icons/Ionicons';

class ChatMenu extends React.Component {
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
        <Button transparent onPress={this.handleMenuPress} style={{alignSelf:'center',paddingLeft:10,paddingRight:10}}>
          <Icon ref="menu" name='more' />
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

export default ChatMenu;
