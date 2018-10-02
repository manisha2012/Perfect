import { fbLoginPermissions } from '../../constants';
import firebase from 'react-native-firebase';
import Auth from '../../config/auth';

export const handleFbLogin = () => (
  Auth.Facebook.login(fbLoginPermissions)
    .then((token) => {
      console.log("token : ", token);
      var credentials = firebase.auth.FacebookAuthProvider.credential(token);
      console.log("credentials : ", credentials);
      firebase.auth().signInAndRetrieveDataWithCredential(credentials).then((user) => {
          console.log("success");
           console.log(user);
            // const _responseInfoCallback = (error, result) => {
            //   if (error) {
            //     console.log('Error fetching data: ' + error.toString());
            //   } else {
            //     console.log('Success fetching data: ' + result.toString());
            //   }
            // };
            // const infoRequest = new GraphRequest(
            //   '/me',
            //   {
            //     accessToken: token,
            //     parameters: {
            //       fields: {
            //         string: 'email,name,first_name,middle_name,last_name'
            //       }
            //     }
            //   },
            //   _responseInfoCallback
            // );
            // console.log(infoRequest);
            //new GraphRequestManager().addRequest(infoRequest).start();
       }).catch((err) => {
           console.error('User signin error', err);
      });

    }).catch((err) => {
      console.error('User sign in error', err);
    })
);
