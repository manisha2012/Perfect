export default (state = '', action) => {
  console.log(action);
    switch (action.type) {
        case 'MATCH_REQUEST':
          return action.payload
        default:
            return state
    }
};
