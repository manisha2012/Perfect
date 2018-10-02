import {combineReducers} from 'redux';

import AuthReducer from './AuthReducer';
import UserFriendsReducer from './UserFriendsReducer';
import ChatRoomReducer from './ChatRoomReducer';
import NotificationsReducer from './NotificationsReducer';
import MatchRequestReducer from './MatchRequestReducer';

export default combineReducers({
  auth: AuthReducer,
  user_friends: UserFriendsReducer,
  chatroom: ChatRoomReducer,
  notifications: NotificationsReducer,
  match_request: MatchRequestReducer
});
