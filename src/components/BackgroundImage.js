import React, { Component } from 'react';
import {StyleSheet,ImageBackground} from 'react-native';

class BackgroundImage extends Component {
    render() {
        return (
            <ImageBackground source={require('../images/match.png')} style={styles.backgroundImage}>
                    {this.props.children}
            </ImageBackground>
        )
    }
}

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        width: null,
        height: null,
        resizeMode: 'cover'
    }
});

export default BackgroundImage;
