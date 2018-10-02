const INITIAL_STATE = {
  friendList:null,
  friendlist_loading:true,
  selectedFriendData:null
};

export default (state = INITIAL_STATE, action) => {
  console.log(action);
  switch (action.type) {
    case 'user_friends':
      return {...state, friendList:[...action.payload], friendlist_loading:false};
    case 'SELECTED_FRIEND':
      return {...state, selectedFriendData:action.payload}
    default:
      return state;
  }
};

//We can't do something like this : state.email = action.payload, because now old state has also been altered, & redux is going to compare old state with the new one, & it will find nothing changed so will not update the component.
//Make a new object, take all the properties of my existing state object & throw them into this object & defaine a property 'email' giving it a value on top of whatever property the state object have, i.e. already having 'email' property will be overridden
