const initialState = {
    isFetching: false,
    lastFetched: null,
    height: 0,
    chatFriendData: null
};

export default (state = initialState, action) => {
  console.log(action);
    switch (action.type) {
        case 'START_FETCHING_MESSAGES':
            return Object.assign({}, state, {
                isFetching: true
            });
        case 'RECEIVED_MESSAGES':
            return Object.assign({}, state, {
                isFetching: false,
                lastFetched: action.receivedAt
            });
        case 'UPDATE_MESSAGES_HEIGHT':
            return Object.assign({}, state, {
                height: action.height
            });
        case 'SET_CHAT_FRIEND':
        return Object.assign({}, state, {
            chatFriendData: action.friendData
        });
        default:
            return state
    }
}
