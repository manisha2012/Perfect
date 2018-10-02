const INITIAL_STATE = {
    user:null,
    token:null,
    tokenExpiryDate:null,
    error: '',
    loading: false,
    friendlist_loading:false
};

export default (state = INITIAL_STATE, action) => {
  console.log(action);
  switch (action.type) {
    case 'login_user':
      return {...state, loading: true, error: ''};
    case 'AUTH_SUCCESS':
      return {...state, user:action.user, friendlist_loading:true, token: action.token, tokenExpiryDate: action.expiryDate, error: '', loading: false};
    case 'login_user_success':
      return {...state, user: action.payload, friendlist_loading:true, error: '', loading: false};
    case 'login_user_fail':
      return {...state, error: 'Authentication Failed.', loading: false};
    case 'AUTH_REMOVE_TOKEN':
      return {...state, token:null, tokenExpiryDate:null, error: '', loading: false};
    default:
      return state;
  }
};

//We can't do something like this : state.email = action.payload, because now old state has also been altered, & redux is going to compare old state with the new one, & it will find nothing changed so will not update the component.
//Make a new object, take all the properties of my existing state object & throw them into this object & defaine a property 'email' giving it a value on top of whatever property the state object have, i.e. already having 'email' property will be overridden
