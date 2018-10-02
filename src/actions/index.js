import { AsyncStorage } from "react-native";

import firebase from 'react-native-firebase';
import {Actions} from 'react-native-router-flux';
import axios from 'axios';
import { fbLoginPermissions } from '../constants/index';
import Auth from '../config/auth';
import { Platform } from 'react-native';
import {NO_OF_ACTIVE_CHATS} from '../constants';

export const loginUser = () => {
  // With Thunk -> It will return a function (not an action), & this function will be called with 'dispatch'
  // dispatch : It is a method, allows us to manually send an action off to all the reducers in our application, we can do whatever async action we want
  return (dispatch) => {
    dispatch({type: 'login_user'}); //just to start spinner

    // firebase.auth().signInWithEmailAndPassword(email, password)
    //   .then(user => loginUserSuccess(dispatch, user))
    //   .catch(() => {
    //     firebase.auth().createUserWithEmailAndPassword(email, password)
    //       .then(user => loginUserSuccess(dispatch, user))
    //       .catch(() => loginUserFail(dispatch));
    //   });

      Auth.Facebook.login(fbLoginPermissions)
        .then((fbCredentials) => {
          var token = fbCredentials.token;
          console.log("fbCredentials : ", fbCredentials);
          console.log("token : ", token);
          var credentials = firebase.auth.FacebookAuthProvider.credential(token);
          console.log("credentials : ", credentials);
          firebase.auth().signInAndRetrieveDataWithCredential(credentials).then((user) => {
              console.log("success");
               console.log(user);
               //firebase.messaging().getToken()
                //.then(msgToken => {
                  //var userId = user.additionalUserInfo.profile.id
                  //console.log("Device firebase Token: ", msgToken);
                  // firebase.database().ref().child(`users/${userId}`)
                  //    .update({
                  //      msgToken: msgToken,
                  //      name: user.additionalUserInfo.profile.name,
                  //      email: user.additionalUserInfo.profile.email
                  //    });
                    console.log("dispatch loginUserSuccess");
                    dispatch(authStoreToken(token, fbCredentials.tokenExpirationDate, user));
                   //loginUserSuccess(dispatch, user);
                //});

               //firebase.messaging().requestPermissions();
               //firebase.messaging().subscribeToTopic("chat");

              //dispatch(fetchMessages());
           }).catch((err) => {
               console.error('User signin error - firebase', err);
               //firebase.messaging().unsubscribeFromTopic("chat");
               loginUserFail(dispatch);
          });

        }).catch((err) => {
          console.error('User sign in error - facebook', err);
          loginUserFail(dispatch);
        });

  };
};

const loginUserFail = (dispatch) => {
  dispatch({
    type: 'login_user_fail'
  });
};

const loginUserSuccess = (dispatch, user) => {
  console.log("loginUserSuccess user :", user);
  //user['access_token'] = token;
  dispatch({
    type: 'login_user_success',
    payload: user
  });
  //Router provides Actions. Here, key property of a scene can be used as a method for navigation
  Actions.main();
  dispatch(fetchNotifications());
};

export const authStoreToken = (token, expiryDate, user) => {
    return dispatch => {
      console.log("authStoreToken :", token);
      console.log("expiryDate here :", expiryDate);
        authSetToken(dispatch, token, expiryDate, user);
        //const now = new Date();
        //const expiryDate = now.getTime() + expiresIn * 1000;
        var userId = user.additionalUserInfo.profile.id
        firebase.database().ref().child(`users/${userId}`)
         .update({
           //msgToken: msgToken,
           name: user.additionalUserInfo.profile.name,
           email: user.additionalUserInfo.profile.email,
           picture: user.additionalUserInfo.profile.picture.data.url
         });
        AsyncStorage.setItem("pm:auth:token", token);
        AsyncStorage.setItem("pm:auth:expiryDate", expiryDate);
        console.log("JSON.stringify(user) :", JSON.stringify(user));
        AsyncStorage.setItem("pm:auth:user", JSON.stringify(user));
    };
};

export const authSetToken = (dispatch, token, expiryDate, user) => {
  console.log("authSetToken : ", token);
  dispatch({
    type: 'AUTH_SUCCESS',
    token: token,
    expiryDate: expiryDate,
    user: user
  });
  //Router provides Actions. Here, key property of a scene can be used as a method for navigation
  Actions.main();
  //dispatch(fetchNotifications());
};

export const authGetToken = () => {
    return (dispatch, getState) => {
        const promise = new Promise((resolve, reject) => {
            const token = getState().auth.token;
            const expiryDate = getState().auth.tokenExpiryDate;
            const user = getState().auth.user;
            console.log("token here :", token);
            if (!token || new Date(expiryDate) <= new Date()) {
                let fetchedToken;
                let parsedExpiryDate;
                AsyncStorage.getItem("pm:auth:token")
                    .catch(err => reject())
                    .then(tokenFromStorage => {
                        fetchedToken = tokenFromStorage;
                        console.log("fetchedToken here :", fetchedToken);
                        if (!tokenFromStorage) {
                            reject();
                            return;
                        }
                        return AsyncStorage.getItem("pm:auth:expiryDate");
                    })
                    .then(expiryDate => {
                      console.log("expiryDate :", expiryDate);
                        parsedExpiryDate = new Date(expiryDate);
                        console.log("parsedExpiryDate :", parsedExpiryDate);
                        const now = new Date();
                        if (parsedExpiryDate > now) {
                            console.log("come here saale");
                            return AsyncStorage.getItem("pm:auth:user");
                        } else {
                            reject();
                        }
                    })
                    .then(user => {
                      console.log("milegi milegi :", user);
                      user = JSON.parse(user);
                      console.log("tjhe bhi milegi :", user);
                      authSetToken(dispatch, fetchedToken, parsedExpiryDate, user);
                      resolve(fetchedToken);
                    })
                    .catch(err => reject());
            } else {
                resolve(token);
            }
        });
        promise.catch(err => {
            dispatch(authClearStorage());
        });
        return promise;
    };
};

export const authAutoSignIn = () => {
    return dispatch => {
        dispatch(authGetToken())
        .then(token => {
            Actions.main();
        })
        .catch(err => console.log("Failed to fetch token!"));
    };
};

export const authClearStorage = () => {
    return dispatch => {
        AsyncStorage.removeItem("pm:auth:expiryDate");
        return AsyncStorage.removeItem("pm:auth:token");
    };
};

export const authLogout = () => {
  return dispatch => {
    dispatch(authClearStorage()).then(() => {
      Actions.auth();
    });
    dispatch(authRemoveToken());
  };
};

export const authRemoveToken = () => {
  return {
    type: 'AUTH_REMOVE_TOKEN'
  };
};

export const getFriendList = (user_id, access_token) => {
  return (dispatch) => {
    let url = 'https://graph.facebook.com/' + user_id + '/friends?fields=name,id,picture&access_token=' + access_token;
    axios.get(url).then((response) => {
      console.log("successfull...", response);
      var friendsArrFb = response.data.data;
      var friendArrDb = [];
      firebase.database().ref().child(`users/${user_id}/friends/`).once('value')
      .then((snap) => {
            console.log('response first', snap);  //nhi aa rha

            if(snap != null) {
              snap.forEach(child => {
                console.log("child here first:", child);
                friendArrDb.push({
                  id: child.val().id,
                  name: child.val().name,
                  picture: child.val().picture,
                  sentText: ('sentText' in child.val()) ? child.val().sentText : null,
                  sentTextAt: ('sentTextAt' in child.val()) ? child.val().sentTextAt : null,
                  matched: ('matched' in child.val()) ? child.val().matched : false,
                  chatId: ('chatId' in child.val()) ? child.val().chatId : null,
                  sentMatchRequest: ('sentMatchRequest' in child.val()) ? child.val().sentMatchRequest : false,
                  sentMatchRequestAt: ('sentMatchRequestAt' in child.val()) ? child.val().sentMatchRequestAt : null,
                  hasReceivedRequest: ('hasReceivedRequest' in child.val()) ? child.val().hasReceivedRequest : false,
                  actionTakenOnRequest: ('actionTakenOnRequest' in child.val()) ? child.val().actionTakenOnRequest : null,
                  activeChatFlag: ('activeChatFlag' in child.val()) ? child.val().activeChatFlag : null,
                  priorityCheck: ('priorityCheck' in child.val()) ? child.val().priorityCheck : false
                });
              });
            }
            //dispatch({type: 'user_friends', payload: items});
            var mergedArr = friendsArrFb.map(function (a) {
                return this[a.name] || a;
            }, friendArrDb.reduce(function (r, a) {
                r[a.name] = a;
                return r;
            }, Object.create(null)));
            console.log("mergedArr :", mergedArr);
            mergedArr.map((friendData) => {   // replace friendArrDb with mergedArr
              console.log("friendData :", friendData);
              var friendUserId = friendData.id;
              var friendRef = firebase.database().ref().child(`users/${user_id}/friends/${friendUserId}`);
              friendRef.set({
                ...friendData
              }).then(() => {
                firebase.database().ref().child(`users/${user_id}/friends/`).on('value', function(snap){
                      console.log('response second', snap);  //nhi aa rha
                      var items = [];
                      snap.forEach(child => {
                        console.log("child here second:", child);
                        items.push({
                          id: child.val().id,
                          name: child.val().name,
                          picture: child.val().picture,
                          sentText: ('sentText' in child.val()) ? child.val().sentText : null,
                          sentTextAt: ('sentTextAt' in child.val()) ? child.val().sentTextAt : null,
                          matched: ('matched' in child.val()) ? child.val().matched : false,
                          chatId: ('chatId' in child.val()) ? child.val().chatId : null,
                          sentMatchRequest: ('sentMatchRequest' in child.val()) ? child.val().sentMatchRequest : false,
                          sentMatchRequestAt: ('sentMatchRequestAt' in child.val()) ? child.val().sentMatchRequestAt : null,
                          hasReceivedRequest: ('hasReceivedRequest' in child.val()) ? child.val().hasReceivedRequest : false,
                          actionTakenOnRequest: ('actionTakenOnRequest' in child.val()) ? child.val().actionTakenOnRequest : null,
                          activeChatFlag: ('activeChatFlag' in child.val()) ? child.val().activeChatFlag : null,
                          priorityCheck: ('priorityCheck' in child.val()) ? child.val().priorityCheck : false
                        });
                      });
                      dispatch({type: 'user_friends', payload: items});
                });
              }).catch((err) => console.error('Error in fetching friends from database after setting from fb', err));
            });
      }).catch((err) => console.error('Error in fetching friends from database', err));
      // friendsArr.map((friendData) => {
      //   console.log("friendData :", friendData);
      //   //friendData.sentText = null;
      //   //friendData.sentTextAt = null;
      //   var friendUserId = friendData.id;
      //   var friendRef = firebase.database().ref().child(`users/${user_id}/friends/${friendUserId}`);
      //   friendRef.once('value').then((snap) => {
      //     console.log("friend ref mymy : ", snap.val());
      //   }).catch(() => {
      //     console.log("friend ref error : ");
      //   });
      //   friendRef.update({
      //     ...friendData
      //   });
      // });


      //dispatch({type: 'user_friends', payload: friendsArr});
    }).catch((err) => console.error('Error in getting friends data from api', err));
  };
};

// export const fetchMessages = () => {
//   return (dispatch) => {
//     console.log("are u here?");
//     dispatch(startFetchingMessages());
//     console.log("then u here?");
//     console.log("hello", firebase.database().ref('messages/'));
//     console.log("hello2", firebase.database().ref().child('messages'));
//     firebase.database().ref().child('messages').once('value').then((response, a) => {
//       console.log('response Manit', response);  //nhi aa rha
//       console.log("aaaaa", a);
//     }).catch((err) => console.error('friends in error', err));
//   }
// };

/*
export const fetchMessages = () => {
    return (dispatch) => {
        console.log("are u here?");
        dispatch(startFetchingMessages());
        console.log("then u here?");
        console.log("hello", firebase.database().ref('messages/'));
        console.log("hello2", firebase.database().ref('/messages/'));
        firebase.database().ref('messages/').on('value', (snapshot) => {
          const messages = snapshot.val() || [];
          console.log("messages :", messages);
          dispatch(receiveMessages(messages));
        });


        // return newMsgRef.then((snapshot) => {
        //             // gets around Redux panicking about actions in reducers
        //                 const messages = snapshot.val() || [];
        //                 console.log("messages :", messages);
        //                 dispatch(receiveMessages(messages));
        //         });
    };
};
*/
/*
export const fetchMessages = (friendData) => {
    console.log("fetch messages here");
    return function (dispatch, getState) {
        //dispatch(startFetchingMessages());
        console.log("fetchMessages actual friendData :", friendData);
        var currentUserId = getState().auth.user.user.providerData[0].uid;
        console.log("fetchMessages actual currentUserId :", currentUserId);
        var selectedFriendId = friendData.id;
        console.log("fetchMessages actual selectedFriendId :", selectedFriendId);
        var chatId = currentUserId > selectedFriendId ? (currentUserId+selectedFriendId) : (selectedFriendId+currentUserId);
        console.log("Chat Id : ", chatId);
        const chatRef = firebase.database().ref().child(`messages/${chatId}/`).orderByChild('order').once('value');
        console.log("chatRef :", chatRef);
        return chatRef.then(snap => {
          // get children as an array
          console.log("snap here", snap);
          var items = [];
          if(Object.keys(snap).length > 0) {
            snap.forEach(child => {
              //var name = child.val().uid == this.user.uid ? this.user.name : name1;
              console.log("child here :", child);
              items.push({
                _id: child.val()._id,
                text: child.val().text,
                createdAt: new Date(child.val().createdAt),
                user: {
                  _id: child.val().sender.id
                  //avatar: avatar
                }
              });
            });
            console.log("items :", items);
            dispatch(receiveMessages(items));
          }
          //dispatch(setChatFriendData(friendData));
          //Actions.chat();
        });
    }
};
*/
export const fetchMessages = (friendData, callback) => {
    console.log("fetch messages here");
    return function (dispatch, getState) {
        //dispatch(startFetchingMessages());
        console.log("fetchMessages actual friendData :", friendData);
        var currentUserId = getState().auth.user.user.providerData[0].uid;
        console.log("fetchMessages actual currentUserId :", currentUserId);
        var selectedFriendId = friendData.id;
        console.log("fetchMessages actual selectedFriendId :", selectedFriendId);
        var chatId = currentUserId > selectedFriendId ? (currentUserId+selectedFriendId) : (selectedFriendId+currentUserId);
        console.log("Chat Id : ", chatId);
        const chatRef = firebase.database().ref().child(`messages/${chatId}/`);
        console.log("chatRef :", chatRef);
        chatRef.off();
        return chatRef.limitToLast(20).on('child_added', snap => {
          // get children as an array
          //console.log("snap here", snap);
          //var items = [];
          //if(Object.keys(snap).length > 0) {
            //snap.forEach(child => {
              //var name = child.val().uid == this.user.uid ? this.user.name : name1;
              //console.log("child here :", child);
              callback({
                _id: snap.val()._id,
                text: snap.val().text,
                createdAt: new Date(snap.val().createdAt),
                user: {
                  _id: snap.val().sender.id
                  //avatar: avatar
                }
              });
            //});
            //console.log("items :", items);
            //dispatch(receiveMessages(items));
          //}
          //dispatch(setChatFriendData(friendData));
          //Actions.chat();
        });
    }
};

export const fetchChats = () => {
  return function (dispatch, getState) {
    var currentUserId = getState().auth.user.user.providerData[0].uid;
    var getChatTimeFromDate = (chatDate) => {
      var now = new Date();
      var hrsDiff = parseInt(Math.abs(now - chatDate)/36e5);
      var hrs = chatDate.getHours();
      var min = chatDate.getMinutes();
      if(min < 10) {
        min = '0' + min;
      }
      var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      var month = months[chatDate.getMonth()];
      if (hrsDiff >= 24) {
        return chatDate.getDate() + " " + month;
      } else {
        return hrs + ":" + min + " " + (hrs>12 ? 'pm' : 'am');
      }
    };
    const promise = new Promise((resolve, reject) => {
      firebase.database().ref().child(`users/${currentUserId}/friends/`).once('value')
      .then(snap => {
        console.log("snap here", snap);
        var chatIdArr = [];
        if(Object.keys(snap).length > 0) {
          snap.forEach(child => {
            console.log("child here :", child);
            if(('chatId' in child.val()) && (child.val().chatId != null)) {
              chatIdArr.push({
                chatId: child.val().chatId,
                activeChatFlag: child.val().activeChatFlag
              });
            }
          });
        }
        console.log("chatIdArr here :", chatIdArr);
        if(chatIdArr.length > 0) {
          return chatIdArr;
        } else {
          reject();
          return;
        }
      })
      .then(chatIdArr => {
        var items = [];
        //chatIdArr.forEach(chatId => {
          //var chatId = chatIdArr[0];
          console.log("In For loop");
          firebase.database().ref().child(`chats/`).once('value')
          .then(snap => {
            console.log("snap here", snap);
            snap.forEach(child => {
              console.log("child here :", child);
              console.log("chatIdArr.contains(child.key) :");
              for(var i in chatIdArr) {
                if(chatIdArr[i]['chatId'] == child.key) {
                  console.log("contains :", child.key);
                  var chatDate = new Date(child.val().lastTextAt);
                  var chatTime = getChatTimeFromDate(chatDate);
                  items.push({
                    text: child.val().lastText,
                    createdAt: chatTime,
                    activeChatFlag: chatIdArr[i]['activeChatFlag'],
                    friend: child.val().receiver.id === currentUserId ?
                              {id:child.val().sender.id, name:child.val().sender.name, picture:child.val().sender.picture} :
                              {id:child.val().receiver.id, name:child.val().receiver.name, picture:child.val().receiver.picture}
                  });
                }
              }
            });
            /*
            if(snap.val().sender.id === currentUserId || snap.val().receiver.id === currentUserId) {
              var chatDate = new Date(snap.val().lastTextAt);
              var chatTime = getChatTimeFromDate(chatDate);
              items.push({
                text: snap.val().lastText,
                createdAt: chatTime,
                friend: snap.val().receiver.id === currentUserId ?
                          {id:snap.val().sender.id, name:snap.val().sender.name, picture:snap.val().sender.picture} :
                          {id:snap.val().receiver.id, name:snap.val().receiver.name, picture:snap.val().receiver.picture}
              });
            }
            */
            console.log("items :", items);
            if(items.length > 0) {
              resolve(items);
            } else {
              reject();
            }
          })
          .catch(err => reject());
        //});

      })
      .catch(err => reject())
    });
    return promise;
  }
};

export const receiveMessages = (messages) => {
    return function (dispatch) {
        //Object.values(messages).forEach(msg => dispatch(addMessage(msg)));
        dispatch(addAllMessages(messages));
        console.log("dispatch recieved messages");
        dispatch(receivedMessages());
    }
};

export const addAllMessages = (messages) => ({
  type: 'ADD_ALL_MSG',
  payload: messages
});

export const receiveChats = (chats) => {
  console.log("come in receiveChats");
    return function (dispatch) {
      if(chats.length > 0) {
        //Object.values(notifications).forEach(notif => dispatch(addNotification(notif)));
        dispatch(addChat(chats));
      } else {
        dispatch(emptyChat());
      }
        //Object.values(chats).forEach(chat => dispatch(addChat(chat)));
        console.log("dispatch recieved messages");
        //dispatch(receivedMessages());
    }
};

export const addChat = (chats) => ({
  type: 'ADD_CHAT',
  payload: chats
});

export const emptyChat = () => ({
  type: 'EMPTY_CHAT'
});

export const setChatFriendData = (friendData) => ({
  type: 'SET_CHAT_FRIEND',
  friendData: friendData
});

export const startFetchingMessages = () => ({
  type: 'START_FETCHING_MESSAGES'
});

export const addMessage = (msg) => ({
  type: 'ADD_MESSAGE',
  ...msg
});

export const sendMessage = (messages, friendData) => {
    return function (dispatch, getState) {
      messages.forEach(message => {
        //var message = message[0];
        var now = new Date().getTime();
        //console.log("firebase.auth() hererererer :", firebase.auth().currentUser);
        var currentUserId = getState().auth.user.additionalUserInfo.profile.id;
        var currentUserName = getState().auth.user.additionalUserInfo.profile.name;
        var currentUserPicture = getState().auth.user.additionalUserInfo.profile.picture.data.url;
        var selectedFriendId = friendData.id;
        var chatId = currentUserId > selectedFriendId ? (currentUserId+selectedFriendId) : (selectedFriendId+currentUserId);
        console.log("Chat Id : ", chatId);
        firebase.database().ref().child(`messages/${chatId}`).push({
            _id: now,
            text: message.text,
            createdAt: now,
            sender: {id:currentUserId, name:currentUserName, picture:currentUserPicture},
            receiver: {id:selectedFriendId, name:friendData.name, picture:friendData.picture},
            order: -1 * now
        }, function(error) {
          if(error) {
            console.log("error in sending message :", error);
          } else {
            //dispatch(addMessage(message));
          }
        });
        firebase.database().ref().child(`chats/${chatId}/`).update({
            lastText: message.text,
            lastTextAt: now,
            sender: {id:currentUserId, name:currentUserName, picture:currentUserPicture},
            receiver: {id:selectedFriendId, name:friendData.name, picture:friendData.picture},
        }, function(error) {
          if(error) {
            console.log("error in updating chats :", error);
          } else {
            console.log("success in updating chats");
            /*
            var getChatTimeFromDate = (chatDate) => {
              var now = new Date();
              var hrsDiff = parseInt(Math.abs(now - chatDate)/36e5);
              var hrs = chatDate.getHours();
              var min = chatDate.getMinutes();
              var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
              var month = months[chatDate.getMonth()];
              if (hrsDiff >= 24) {
                return chatDate.getDate() + " " + month;
              } else {
                return hrs + ":" + min + " " + (hrs>12 ? 'pm' : 'am');
              }
            };
            firebase.database().ref().child(`chats/${chatId}/`).on('value', function(snap) {
              console.log("snap here :", snap.val());
              var items = [];
              var chatDate = new Date(snap.val().lastTextAt);
              var chatTime = getChatTimeFromDate(chatDate);
              items.push({
                text: snap.val().lastText,
                createdAt: chatTime,
                friend: {id:snap.val().receiver.id, name:snap.val().receiver.name, picture:snap.val().receiver.picture}
              });
              if(items.length > 0) {
                dispatch(receiveChats(items));
              }
            });
            */
          }
        });

      });
        // let msg = {
        //         text: text,
        //         time: Date.now(),
        //         author: {
        //             name: user.name,
        //             avatar: user.picture.data.url
        //         }
        //     };
        // console.log("push msg here ", firebase.database().ref().child('messages'));
        // const newMsgRef = firebase.database().ref()
        //                           .child('messages')
        //                           .push();
        // msg.id = newMsgRef.key;
        // //newMsgRef.set(msg);
        //
        // return newMsgRef.set(msg).then(() => {
        //
        //   console.log("pushed msg here ", firebase.database().ref().child('messages'));
        //   dispatch(addMessage(msg));
        // });

    };
};

export const receivedMessages = () => ({
  type: 'RECEIVED_MESSAGES',
  receivedAt: Date.now()
});

export const updateMessagesHeight = (event) => {
    const layout = event.nativeEvent.layout;

    return {
        type: 'UPDATE_MESSAGES_HEIGHT',
        height: layout.height
    }
}
/*
const startChatting = function (dispatch) {
    dispatch(userAuthorized());
    dispatch(fetchMessages());

    FCM.requestPermissions();
    FCM.getFCMToken()
       .then(token => {
           console.log(token)
       });
    FCM.subscribeToTopic('secret-chatroom');

    FCM.on(FCMEvent.Notification, async (notif) => {
        console.log(notif);

        if (Platform.OS === 'ios') {
            switch (notif._notificationType) {
                case NotificationType.Remote:
                    notif.finish(RemoteNotificationResult.NewData); //other types available: RemoteNotificationResult.NewData, RemoteNotificationResult.ResultFailed
                    break;
                case NotificationType.NotificationResponse:
                    notif.finish();
                    break;
                case NotificationType.WillPresent:
                    notif.finish(WillPresentNotificationResult.All); //other types available: WillPresentNotificationResult.None
                    break;
              }
            }
    });

    FCM.on(FCMEvent.RefreshToken, token => {
        console.log(token);
    });
}
*/

export const openChatWindow = (chatFriendData) => {
    //var currentUserId = firebase.auth().currentUser.providerData[0].uid;
    //var chatId = currentUserId > selectedFriendId ? (currentUserId-selectedFriendId) : (selectedFriendId-currentUserId);
    //console.log("Chat Id : ", chatId);
    //console.log("currr user :", firebase.auth().currentUser);
    return function (dispatch) {
        dispatch(fetchMessages(chatFriendData));
        //Actions.chat();
    }
};

export const updateChats = (chatFriendData, text, sentAt) => {
  return function (dispatch, getState) {
    console.log("updateChats here");
    var now = new Date().getTime();
    var sentAtTime = new Date(sentAt).getTime();
    var currentUserId = getState().auth.user.additionalUserInfo.profile.id;
    var currentUserName = getState().auth.user.additionalUserInfo.profile.name;
    var currentUserPicture = getState().auth.user.additionalUserInfo.profile.picture.data.url;
    var selectedFriendId = chatFriendData.id;
    var chatId = currentUserId > selectedFriendId ? (currentUserId+selectedFriendId) : (selectedFriendId+currentUserId);
    console.log("Chat Id : ", chatId);
    firebase.database().ref().child(`chats/${chatId}/`).set({
        lastText: text,
        lastTextAt: sentAtTime,
        sender: {id:selectedFriendId, name:chatFriendData.name, picture:chatFriendData.picture},
        receiver: {id:currentUserId, name:currentUserName, picture:currentUserPicture}
    });
  }
};

export const updateMessages = (chatFriendData, text, sentAt) => {
  return function (dispatch, getState) {
    console.log("updateMessages here");
    var now = new Date().getTime();
    var sentAtTime = new Date(sentAt).getTime();
    var currentUserId = getState().auth.user.additionalUserInfo.profile.id;
    var currentUserName = getState().auth.user.additionalUserInfo.profile.name;
    var currentUserPicture = getState().auth.user.additionalUserInfo.profile.picture.data.url;
    var selectedFriendId = chatFriendData.id;
    var chatId = currentUserId > selectedFriendId ? (currentUserId+selectedFriendId) : (selectedFriendId+currentUserId);
    console.log("Chat Id : ", chatId);
    firebase.database().ref().child(`messages/${chatId}/`).push({
        _id: now,
        text: text,
        createdAt: sentAtTime,
        sender: {id:selectedFriendId, name:chatFriendData.name, picture:chatFriendData.picture},
        receiver: {id:currentUserId, name:currentUserName, picture:currentUserPicture},
        order: -1 * now
    });
  }
};

export const updateUsersOnAccept = (chatFriendData, priorityFlag = false) => {
  return function (dispatch, getState) {
    console.log("updateUsersOnAccept here");
    var currentUserId = getState().auth.user.additionalUserInfo.profile.id;
    var selectedFriendId = chatFriendData.id;
    var chatId = currentUserId > selectedFriendId ? (currentUserId+selectedFriendId) : (selectedFriendId+currentUserId);
    console.log("Chat Id : ", chatId);
    var activeFlag = '';
    var friendActiveFlag = '';
    var friendCurrentCount = 0;
    var userCurrentCount = 0;
    var priorityCheck = false;
    var swapFriendId = '';
    var swapFriendCurrentCount = 0;
    var userSwapFriendId = '';
    var userSwapFriendCurrentCount = 0;

    firebase.database().ref().child(`users/${selectedFriendId}/currentlyActiveChatsCount`).once('value')
    .then(snap => {
      console.log("snap here", snap.val());
      friendCurrentCount = snap.val();
      firebase.database().ref().child(`users/${selectedFriendId}/friends/${currentUserId}/priorityCheck`).once('value')
      .then(snap => {
        priorityCheck = snap.val();
        firebase.database().ref().child(`users/${selectedFriendId}/friends/`).once('value')
        .then(snap => {
          console.log("snap here", snap);
          snap.forEach(child => {
            if(child.val().activeChatFlag == ('Active '+ NO_OF_ACTIVE_CHATS)){
              swapFriendId = child.val().id;
            }
          });
          firebase.database().ref().child(`users/${swapFriendId}/currentlyActiveChatsCount`).once('value')
          .then(snap => {
            console.log("snap here", snap.val());
            swapFriendCurrentCount = snap.val();

            firebase.database().ref().child(`users/${currentUserId}/friends/`).once('value')
            .then(snap => {
              console.log("snap here", snap);
              snap.forEach(child => {
                if(child.val().activeChatFlag == ('Active '+ NO_OF_ACTIVE_CHATS)){
                  userSwapFriendId = child.val().id;
                }
              });
              firebase.database().ref().child(`users/${userSwapFriendId}/currentlyActiveChatsCount`).once('value')
              .then(snap => {
                console.log("snap here", snap.val());
                userSwapFriendCurrentCount = snap.val();

                var count = friendCurrentCount + 1;
                if(friendCurrentCount < NO_OF_ACTIVE_CHATS) {
                  friendActiveFlag = 'Active ' + count;
                } else if((priorityFlag || priorityCheck) && friendCurrentCount == NO_OF_ACTIVE_CHATS) {
                  friendActiveFlag = 'Active ' + friendCurrentCount;
                  firebase.database().ref().child(`users/${selectedFriendId}/friends/${swapFriendId}`).update({
                    activeChatFlag: 'Inactive'
                  });
                  friendCurrentCount = friendCurrentCount - 1;
                  firebase.database().ref().child(`users/${swapFriendId}/friends/${selectedFriendId}`).update({
                    activeChatFlag: 'Inactive'
                  });
                  firebase.database().ref().child(`users/${swapFriendId}`).update({
                    currentlyActiveChatsCount: swapFriendCurrentCount - 1
                  });
                } else {
                  friendActiveFlag = 'Inactive';
                }
                console.log("friendActiveFlag flag :", friendActiveFlag);
                firebase.database().ref().child(`users/${currentUserId}/currentlyActiveChatsCount`).once('value')
                .then(snap => {
                  console.log("snap here", snap.val());
                  userCurrentCount = snap.val();

                  console.log("userCurrentCount here :", userCurrentCount);
                  var countt = userCurrentCount + 1;
                  if(userCurrentCount < NO_OF_ACTIVE_CHATS) {
                    activeFlag = 'Active ' + countt;
                  } else if(priorityFlag && userCurrentCount == NO_OF_ACTIVE_CHATS) {
                    activeFlag = 'Active ' + userCurrentCount;
                    firebase.database().ref().child(`users/${currentUserId}/friends/${userSwapFriendId}`).update({
                      activeChatFlag: 'Inactive'
                    });
                    userCurrentCount = userCurrentCount - 1;
                    firebase.database().ref().child(`users/${userSwapFriendId}/friends/${currentUserId}`).update({
                      activeChatFlag: 'Inactive'
                    });
                    firebase.database().ref().child(`users/${userSwapFriendId}`).update({
                      currentlyActiveChatsCount: userSwapFriendCurrentCount - 1
                    });
                  } else {
                    activeFlag = 'Inactive';
                  }
                  console.log("activeFlag flag :", activeFlag);

                  //If user's chat is inactive, then make friend's chat also inactive or If friend's chat is inactive, then make user's chat also inactive
                  //else increase the active chats count of both user & friend
                  if(friendActiveFlag == 'Inactive' || activeFlag == 'Inactive'){
                    activeFlag = 'Inactive';
                    friendActiveFlag = 'Inactive'
                  } else {
                    firebase.database().ref().child(`users/${selectedFriendId}`).update({
                      currentlyActiveChatsCount: friendCurrentCount + 1
                    });
                    firebase.database().ref().child(`users/${currentUserId}`).update({
                      currentlyActiveChatsCount: userCurrentCount + 1
                    });
                  }
                  firebase.database().ref().child(`users/${currentUserId}/friends/${selectedFriendId}`).update({
                    matched: true,
                    chatId: chatId,
                    activeChatFlag: activeFlag,
                    actionTakenOnRequest: 'ACCEPTED'
                  })
                  .then(() => firebase.database().ref().child(`users/${selectedFriendId}/friends/${currentUserId}`).update({
                    matched: true,
                    chatId: chatId,
                    activeChatFlag: friendActiveFlag
                  }))
                  .then(() => firebase.database().ref().child(`users/${currentUserId}/friends/`).once('value'))
                  .then((snap) => {
                      console.log('response Manit', snap);  //nhi aa rha
                      var items = [];
                      snap.forEach(child => {
                        console.log("child here :", child);
                        items.push({
                          id: child.val().id,
                          name: child.val().name,
                          picture: child.val().picture,
                          sentText: ('sentText' in child.val()) ? child.val().sentText : null,
                          sentTextAt: ('sentTextAt' in child.val()) ? child.val().sentTextAt : null,
                          matched: ('matched' in child.val()) ? child.val().matched : false,
                          chatId: ('chatId' in child.val()) ? child.val().chatId : null,
                          sentMatchRequest: ('sentMatchRequest' in child.val()) ? child.val().sentMatchRequest : false,
                          sentMatchRequestAt: ('sentMatchRequestAt' in child.val()) ? child.val().sentMatchRequestAt : null,
                          hasReceivedRequest: ('hasReceivedRequest' in child.val()) ? child.val().hasReceivedRequest : false,
                          actionTakenOnRequest: ('actionTakenOnRequest' in child.val()) ? child.val().actionTakenOnRequest : null,
                          activeChatFlag: ('activeChatFlag' in child.val()) ? child.val().activeChatFlag : null,
                          priorityCheck: ('priorityCheck' in child.val()) ? child.val().priorityCheck : false
                        });
                      });
                      console.log("items here :", items);
                      dispatch({type: 'user_friends', payload: items});
                    }).catch((err) => console.error('Error in getting friends from db after sending notification', err));
                  });
                });
              });
            });
          });
        });
      });
    }
};

export const updateUsersOnDecline = (chatFriendData) => {
  return function (dispatch, getState) {
    console.log("updateUsersOnDecline here");
    var currentUserId = getState().auth.user.additionalUserInfo.profile.id;
    var selectedFriendId = chatFriendData.id;
    firebase.database().ref().child(`users/${currentUserId}/friends/${selectedFriendId}`).update({
        actionTakenOnRequest: 'DECLINED'
    })
    .then(() => firebase.database().ref().child(`users/${currentUserId}/friends/`).once('value'))
    .then((snap) => {
          console.log('response Manit', snap);  //nhi aa rha
          var items = [];
          snap.forEach(child => {
            console.log("child here :", child);
            items.push({
              id: child.val().id,
              name: child.val().name,
              picture: child.val().picture,
              sentText: ('sentText' in child.val()) ? child.val().sentText : null,
              sentTextAt: ('sentTextAt' in child.val()) ? child.val().sentTextAt : null,
              matched: ('matched' in child.val()) ? child.val().matched : false,
              chatId: ('chatId' in child.val()) ? child.val().chatId : null,
              sentMatchRequest: ('sentMatchRequest' in child.val()) ? child.val().sentMatchRequest : false,
              sentMatchRequestAt: ('sentMatchRequestAt' in child.val()) ? child.val().sentMatchRequestAt : null,
              hasReceivedRequest: ('hasReceivedRequest' in child.val()) ? child.val().hasReceivedRequest : false,
              actionTakenOnRequest: ('actionTakenOnRequest' in child.val()) ? child.val().actionTakenOnRequest : null,
              activeChatFlag: ('activeChatFlag' in child.val()) ? child.val().activeChatFlag : null,
              priorityCheck: ('priorityCheck' in child.val()) ? child.val().priorityCheck : false
            });
          });
          console.log("items here :", items);
          dispatch({type: 'user_friends', payload: items});
    }).catch((err) => console.error('Error in getting friends from db after sending notification', err));
  }
};

export const setSelectedFriend = (selectedFriendData) => ({
  type: 'SELECTED_FRIEND',
  payload: selectedFriendData
});

export const setSelectedMsg = (selectedMsg) => ({
  type: 'SELECTED_MSG',
  payload: selectedMsg
});

export const sendMatchRequestToFriend = (friendData, userPicUrl) => {
    return function (dispatch, getState) {
        //var message = message[0];
        var now = new Date().getTime();
        //console.log("firebase.auth() hereaaaoaaao :", firebase.auth().currentUser);
        var currentUserId = getState().auth.user.user.providerData[0].uid;
        var currentUserName = getState().auth.user.user.providerData[0].displayName;
        var selectedFriendId = friendData.id;
        var matchId = currentUserId > selectedFriendId ? (currentUserId+selectedFriendId) : (selectedFriendId+currentUserId);
        var matchRequestId = 'MATCH' + matchId;
        var matchedFlag = false;
        var matchedChild = {};
        console.log("matchRequestId : ", matchRequestId);
        firebase.database().ref().child(`matchRequests/`).once('value').then(snap => {
          console.log("snap here matchRequests :", snap);
          snap.forEach(child => {
            console.log("child here matchRequests :", child);
            if(child.key == matchRequestId) {
              console.log("Matched !!!");
              matchedFlag = true;
              matchedChild = child;
              return false;
            }
          });
          if(!matchedFlag) {
            firebase.database().ref().child(`matchRequests/${matchRequestId}`).set({
                _id: matchRequestId,
                createdAt: now,
                sender: {uid:currentUserId, name:currentUserName, picture:userPicUrl},
                receiver: selectedFriendId,
                actionTaken: null
            });
            firebase.database().ref().child(`users/${currentUserId}/friends/${selectedFriendId}`).update({
                sentMatchRequest: true,
                sentMatchRequestAt: now
            }).then(() => firebase.database().ref().child(`users/${currentUserId}/friends/`).on('value', function (snap){
                  console.log('response Manit', snap);  //nhi aa rha
                  var items = [];
                  snap.forEach(child => {
                    console.log("child here :", child);
                    items.push({
                      id: child.val().id,
                      name: child.val().name,
                      picture: child.val().picture,
                      sentText: ('sentText' in child.val()) ? child.val().sentText : null,
                      sentTextAt: ('sentTextAt' in child.val()) ? child.val().sentTextAt : null,
                      matched: ('matched' in child.val()) ? child.val().matched : false,
                      chatId: ('chatId' in child.val()) ? child.val().chatId : null,
                      sentMatchRequest: ('sentMatchRequest' in child.val()) ? child.val().sentMatchRequest : false,
                      sentMatchRequestAt: ('sentMatchRequestAt' in child.val()) ? child.val().sentMatchRequestAt : null,
                      hasReceivedRequest: ('hasReceivedRequest' in child.val()) ? child.val().hasReceivedRequest : false,
                      actionTakenOnRequest: ('actionTakenOnRequest' in child.val()) ? child.val().actionTakenOnRequest : null,
                      activeChatFlag: ('activeChatFlag' in child.val()) ? child.val().activeChatFlag : null,
                      priorityCheck: ('priorityCheck' in child.val()) ? child.val().priorityCheck : false
                    });
                  });
                  dispatch({type: 'user_friends', payload: items});
            })).catch((err) => console.error('Error in getting friends from db after sending notification', err));
          } else {
            console.log("matchedChild : ", matchedChild.val());
            dispatch(matchedRequest(true));
          }
        });
        //dispatch(addMessage(message));
    };
};

export const matchedRequest = (matched) => ({
  type: 'MATCH_REQUEST',
  payload: matched
});

export const sendNotificationToFriend = (notifMsg, priorityCheck, friendData, userPicUrl) => {
    return function (dispatch, getState) {
        //var message = message[0];
        var now = new Date().getTime();
        //console.log("firebase.auth() hereaaaoaaao :", firebase.auth().currentUser);
        var currentUserId = getState().auth.user.user.providerData[0].uid;
        var currentUserName = getState().auth.user.user.providerData[0].displayName;
        var selectedFriendId = friendData.id;
        var notifId = 'NOTIF' + currentUserId + selectedFriendId;
        console.log("Notif Id : ", notifId);
        firebase.database().ref().child(`notifications/${notifId}`).set({
            _id: notifId,
            text: notifMsg,
            createdAt: now,
            sender: {uid:currentUserId, name:currentUserName, picture:userPicUrl},
            receiver: selectedFriendId,
            actionTaken: null
        });
        firebase.database().ref().child(`users/${selectedFriendId}`).update({
            hasSeenNotifications: false
        });
        firebase.database().ref().child(`users/${selectedFriendId}/friends/${currentUserId}`).update({
            hasReceivedRequest: true
        });
        if(priorityCheck) {
          firebase.database().ref().child(`users/${currentUserId}/friends/`).once('value')
          .then(snap => {
            console.log('snap here', snap);
            var friendId = '';
            snap.forEach(child => {
              if(child.val().priorityCheck) {
                friendId = child.val().id;
              }
            });
            if(friendId) {
              firebase.database().ref().child(`users/${currentUserId}/friends/${friendId}`).update({
                  priorityCheck: false
              });
            }
            firebase.database().ref().child(`users/${currentUserId}/friends/${selectedFriendId}`).update({
                sentText: notifMsg,
                sentTextAt: now,
                priorityCheck: true
            }).then(() => firebase.database().ref().child(`users/${currentUserId}/friends/`).once('value'))
            .then((snap) => {
                  console.log('response Manit', snap);  //nhi aa rha
                  var items = [];
                  snap.forEach(child => {
                    console.log("child here :", child);
                    items.push({
                      id: child.val().id,
                      name: child.val().name,
                      picture: child.val().picture,
                      sentText: ('sentText' in child.val()) ? child.val().sentText : null,
                      sentTextAt: ('sentTextAt' in child.val()) ? child.val().sentTextAt : null,
                      matched: ('matched' in child.val()) ? child.val().matched : false,
                      chatId: ('chatId' in child.val()) ? child.val().chatId : null,
                      sentMatchRequest: ('sentMatchRequest' in child.val()) ? child.val().sentMatchRequest : false,
                      sentMatchRequestAt: ('sentMatchRequestAt' in child.val()) ? child.val().sentMatchRequestAt : null,
                      hasReceivedRequest: ('hasReceivedRequest' in child.val()) ? child.val().hasReceivedRequest : false,
                      actionTakenOnRequest: ('actionTakenOnRequest' in child.val()) ? child.val().actionTakenOnRequest : null,
                      activeChatFlag: ('activeChatFlag' in child.val()) ? child.val().activeChatFlag : null,
                      priorityCheck: ('priorityCheck' in child.val()) ? child.val().priorityCheck : false
                    });
                  });
                  dispatch({type: 'user_friends', payload: items});
            });
          }).catch((err) => console.error('Error in getting friends from db after senfing notification', err));
        } else {
          firebase.database().ref().child(`users/${currentUserId}/friends/${selectedFriendId}`).update({
              sentText: notifMsg,
              sentTextAt: now,
              priorityCheck: false
          }).then(() => firebase.database().ref().child(`users/${currentUserId}/friends/`).once('value'))
          .then((snap) => {
                console.log('response Manit', snap);  //nhi aa rha
                var items = [];
                snap.forEach(child => {
                  console.log("child here :", child);
                  items.push({
                    id: child.val().id,
                    name: child.val().name,
                    picture: child.val().picture,
                    sentText: ('sentText' in child.val()) ? child.val().sentText : null,
                    sentTextAt: ('sentTextAt' in child.val()) ? child.val().sentTextAt : null,
                    matched: ('matched' in child.val()) ? child.val().matched : false,
                    chatId: ('chatId' in child.val()) ? child.val().chatId : null,
                    sentMatchRequest: ('sentMatchRequest' in child.val()) ? child.val().sentMatchRequest : false,
                    sentMatchRequestAt: ('sentMatchRequestAt' in child.val()) ? child.val().sentMatchRequestAt : null,
                    hasReceivedRequest: ('hasReceivedRequest' in child.val()) ? child.val().hasReceivedRequest : false,
                    actionTakenOnRequest: ('actionTakenOnRequest' in child.val()) ? child.val().actionTakenOnRequest : null,
                    activeChatFlag: ('activeChatFlag' in child.val()) ? child.val().activeChatFlag : null,
                    priorityCheck: ('priorityCheck' in child.val()) ? child.val().priorityCheck : false
                  });
                });
                dispatch({type: 'user_friends', payload: items});
          }).catch((err) => console.error('Error in getting friends from db after senfing notification', err));
        }
        //dispatch(addMessage(message));
    };
};

export const updateNotifications = (notifId, action) => {
    return function (dispatch, getState) {
        console.log("Notif Id : ", notifId);
        var currentUserId = getState().auth.user.user.providerData[0].uid;
        console.log("currentUserId :", currentUserId);
        const notifRef = firebase.database().ref().child(`notifications/${notifId}`);
        notifRef.update({actionTaken: action});
        //console.log("key :", key);
        /*
        notifRef.update({
          accepted: true
        }).then(() => {
          console.log("notifRef here");
          return notifRef.on('child_changed', child => {
            // get children as an array
            console.log("snap here", child);
            //var items = [];
            //snap.forEach(child => {
              //var name = child.val().uid == this.user.uid ? this.user.name : name1;
              console.log("child here :", child.val());
              if(child.val().receiver === currentUserId) {
                callback({
                  _id: child.val()._id,
                  text: child.val().text,
                  createdAt: new Date(child.val().createdAt),
                  uid: child.val().receiver,
                  friend: {id:child.val().sender.uid, name:child.val().sender.name, picture:child.val().sender.picture},
                  accepted: child.val().accepted
                });
              }
            //});
            //console.log("items :", items);
            //dispatch(receiveNotifications(items));
          });
        });
        */
    };
};

export const addNotification = (notifications) => ({
  type: 'ADD_NOTIF',
  payload: notifications
});

export const receiveNotifications = (notifications) => {
    return function (dispatch) {
      if(notifications.length > 0) {
        //Object.values(notifications).forEach(notif => dispatch(addNotification(notif)));
        dispatch(addNotification(notifications));
      } else {
        dispatch(emptyNotification());
      }
        console.log("dispatch recieved notifications");
        //dispatch(receivedNotifications());
    }
};

export const emptyNotification = () => ({
  type: 'EMPTY_NOTIF'
});

export const receivedNotifications = () => ({
  type: 'RECEIVED_NOTIF',
  receivedAt: Date.now()
});

export const fetchNotifications = () => {
    console.log("fetch notifications here");
    return function (dispatch, getState) {
        //dispatch(startFetchingMessages());
        //console.log()
        var currentUserId = getState().auth.user.user.providerData[0].uid;
        firebase.database().ref().child(`users/${currentUserId}`).update({
          hasSeenNotifications: true
        });
        const chatRef = firebase.database().ref().child(`notifications/`).once('value');
        console.log("currentUserId :", currentUserId);
        return chatRef.then(snap => {
          // get children as an array
          console.log("snap here", snap);
          var items = [];
          snap.forEach(child => {
            //var name = child.val().uid == this.user.uid ? this.user.name : name1;
            console.log("child here :", child.val());
            if(child.val().receiver === currentUserId && !child.val().actionTaken) {
              items.push({
                _id: child.val()._id,
                text: child.val().text,
                createdAt: new Date(child.val().createdAt),
                uid: child.val().receiver,
                friend: {id:child.val().sender.uid, name:child.val().sender.name, picture:child.val().sender.picture},
                actionTaken: child.val().actionTaken
              });
            }
          });
          console.log("items :", items);
          dispatch(receiveNotifications(items));
          Actions.notif();
        });
    }
}

export const showNotificationComp = () => {
  return function (dispatch) {
      dispatch(fetchNotifications());
      //Actions.notif();
  }
};

export const showChatsComp = () => {
  return dispatch => {
      dispatch(fetchChats())
      .then(chats => {
        console.log("dispatch promise receiveChats here ", chats);
        dispatch(receiveChats(chats));
        Actions.chats();
      })
      .catch(err => console.log("Failed to fetch chats!"));
  };
}

export const fetchNotifSeen = (callback) => {
  return function(dispatch, getState) {
    var currentUserId = getState().auth.user.user.providerData[0].uid;
    firebase.database().ref().child(`users/${currentUserId}/hasSeenNotifications`).on('value', function (snap) {
      console.log("snap here :", snap.val());
      callback(snap.val());
    });
  }
};

export const changeActiveChatFlag = (selectedFriendId, selectedFriendFlag, swapFriendId, swapFriendFlag) => {
  return function (dispatch, getState) {
    console.log("changeActiveChatFlag here");
    var currentUserId = getState().auth.user.additionalUserInfo.profile.id;
    firebase.database().ref().child(`users/${currentUserId}/friends/${selectedFriendId}`).update({
      activeChatFlag: selectedFriendFlag
    });
    firebase.database().ref().child(`users/${selectedFriendId}/friends/${currentUserId}`).update({
      activeChatFlag: selectedFriendFlag
    });
    if(swapFriendId) {
      firebase.database().ref().child(`users/${currentUserId}/friends/${swapFriendId}`).update({
        activeChatFlag: swapFriendFlag
      });
    }
    if(selectedFriendFlag == 'Inactive') {
      firebase.database().ref().child(`users/${currentUserId}/currentlyActiveChatsCount`).once('value')
      .then(snap => {
        console.log("snap here", snap.val());
        firebase.database().ref().child(`users/${currentUserId}`).update({
          currentlyActiveChatsCount: snap.val() - 1
        });
        firebase.database().ref().child(`users/${selectedFriendId}/currentlyActiveChatsCount`).once('value')
        .then(snap => {
          console.log("snap here", snap.val());
          firebase.database().ref().child(`users/${selectedFriendId}`).update({
            currentlyActiveChatsCount: snap.val() - 1
          });
          dispatch(showChatsComp());
        });
      });
    } else if (swapFriendFlag == 'Inactive' && swapFriendId){
      firebase.database().ref().child(`users/${swapFriendId}/friends/${currentUserId}`).update({
        activeChatFlag: swapFriendFlag
      });
      firebase.database().ref().child(`users/${selectedFriendId}/currentlyActiveChatsCount`).once('value')
      .then(snap => {
        console.log("snap here", snap.val());
        firebase.database().ref().child(`users/${selectedFriendId}`).update({
          currentlyActiveChatsCount: snap.val() + 1
        });
        firebase.database().ref().child(`users/${swapFriendId}/currentlyActiveChatsCount`).once('value')
        .then(snap => {
          console.log("snap here", snap.val());
          firebase.database().ref().child(`users/${swapFriendId}`).update({
            currentlyActiveChatsCount: snap.val() - 1
          });
          dispatch(showChatsComp());
        });
      });
    } else if (swapFriendFlag == 'Inactive' && !swapFriendId) {
      firebase.database().ref().child(`users/${selectedFriendId}/currentlyActiveChatsCount`).once('value')
      .then(snap => {
        console.log("snap here", snap.val());
        firebase.database().ref().child(`users/${selectedFriendId}`).update({
          currentlyActiveChatsCount: snap.val() + 1
        });
        firebase.database().ref().child(`users/${currentUserId}/currentlyActiveChatsCount`).once('value')
        .then(snap => {
          console.log("snap here", snap.val());
          firebase.database().ref().child(`users/${currentUserId}`).update({
            currentlyActiveChatsCount: snap.val() + 1
          });
          dispatch(showChatsComp());
        });
      });
    } else {
      dispatch(showChatsComp());
    }
  }
};

export const fetchUserActiveChats = (callback) => {
  return function (dispatch, getState) {
    var currentUserId = getState().auth.user.additionalUserInfo.profile.id;
    firebase.database().ref().child(`users/${currentUserId}/currentlyActiveChatsCount`).once('value')
    .then(snap => {
      console.log("snap here", snap.val());
      callback(snap.val());
    });
  }
}
