import {combineReducers} from 'redux';

import MessageReducer from './MessageReducer';
import MetaChatReducer from './MetaChatReducer';
import ChatsReducer from './ChatsReducer';
// src/reducers/chatroom.js


export default combineReducers({
  messages: MessageReducer,
  meta: MetaChatReducer,
  chats: ChatsReducer
});
