const chat = (state, action) => {
  console.log(action);
    switch (action.type) {
        case 'ADD_CHAT':
            return {
              text: action.text,
              createdAt: action.createdAt,
              friend: {id:action.friend.id, name:action.friend.name, picture:action.friend.picture},
              activeChatFlag: action.activeChatFlag
            }
        default:
            return state
    }
};

export default (state = [], action) => {
  console.log(action);
    switch (action.type) {
        case 'ADD_CHAT':
            return action.payload
        case 'EMPTY_CHAT':
          return [];
        default:
            return state
    }
};
