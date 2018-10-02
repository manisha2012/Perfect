// const notification = (state, action) => {
//   console.log(action);
//     switch (action.type) {
//         case 'ADD_NOTIF':
//             return {
//               _id: action._id,
//               text: action.text,
//               createdAt: action.createdAt,
//               uid: action.uid,
//               friend: {id:action.friend.id, name:action.friend.name, picture:action.friend.picture},
//               accepted: action.accepted
//             }
//         default:
//             return state
//     }
// };

export default (state = [], action) => {
  console.log(action);
    switch (action.type) {
        case 'ADD_NOTIF':
          return action.payload
        case 'EMPTY_NOTIF':
          return [];
        default:
            return state
    }
};
