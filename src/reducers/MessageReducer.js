// src/reducers/messages.js
const message = (state, action) => {
  console.log(action);
    switch (action.type) {
        case 'ADD_MESSAGE':
            return {
                _id: action._id,
                text: action.text,
                createdAt: action.createdAt,
                user: action.user
            }
        default:
            return state
    }
};

// src/reducers/messages.js
export default (state = [], action) => {
  console.log(action);
    switch (action.type) {
        case 'ADD_MESSAGE':
            if (state.map(m => m._id).includes(action._id)) {
                console.log("here it comes :", state);
                return state;
            }else{
                return [
                ...state,
                message(undefined, action)
                ]
            }
        case 'SEND_MESSAGE':
            return [
                ...state,
                message(undefined, action)
            ]
        case 'ADD_ALL_MSG':
            return action.payload
        case 'SET_CHAT_FRIEND':
            return [];
        default:
            return state
    }
};
