import React, {useState, useEffect} from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { StyleSheet, Image, Text} from 'react-native';
import { Button, TextInput} from 'react-native-paper';
import { View } from '../components/Themed';
import Modal from 'react-native-modal';
import Toast from 'react-native-toast-message';
import * as SecureStore from 'expo-secure-store';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import _ from 'lodash';

const Landing = ({ navigation }) => {
  // Used for updating the Global Redux store e.g. when logging in
  const dispatch = useDispatch();

  // State variables that hold the users input in the registration modal, as well as
  // whether to show that modal or not
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [registerUserName, setRegisterUserName] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");

  // Same as the above, but for the Login modal instead
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginUserName, setLoginUserName] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // changeModalVisibility: Changes the visibility of the specified modal via the type parameter
  const changeModalVisibility = (type) => {
    if (type == "login"){
      setShowLoginModal(!showLoginModal);
    }
    else if (type == "registration"){
      setShowRegistrationModal(!showRegistrationModal);
    }
  }

  const showMissingCredsMessage = () => {
    Toast.show({
      type: 'error',
      position: 'bottom',
      text1: 'You must provide credentials',
      text2: 'Please re-try and enter a username and password',
      visibilityTime: 4000,
      autoHide: true,
      topOffset: 30,
      bottomOffset: 40,
    });
  }

  const showIncorrectCredsMessage = () => {
    Toast.show({
      type: 'error',
      position: 'bottom',
      text1: 'Incorrect username or password!',
      text2: 'Your username or password was wrong, please re-try',
      visibilityTime: 4000,
      autoHide: true,
      topOffset: 30,
      bottomOffset: 40,
    });
  }

  // registerNewUser: Using the username & password state vars from above, create a new uuid / user
  async function registerNewUser(username, password) {
    // Check if there's even a username or password - if not, then dismiss the reg attempt
    // There's no length or password strength imposed for now - all that's important is that
    // there is at least some form of a credential to register with
    if (username == "" || password == ""){
      showMissingCredsMessage(); // Make a call to show a toast about entering creds
      return false;
    }

    /*
     Create a new user - get the username, and password
     Combine those two values together to a usernameApassB
     Then link it to a unique uuid (e.g. in key-val relationship)
    */
    const userAndPassChain = "username" + username + "pass" + password
    // Looks up the username in storage, just in case this username is already taken
    const isExistingUser = await SecureStore.getItemAsync(username);

    if (isExistingUser){ // If this user already exists, then prevent registration
      Toast.show({
        type: 'error',
        position: 'bottom',
        text1: 'This username is already taken',
        text2: 'Please try a different combination',
        visibilityTime: 4000,
        autoHide: true,
        topOffset: 30,
        bottomOffset: 40,
      });

      return false;
    }

    /*
      Expo's Secure Storage seems to have an issue with dashes in the string
      This seems to be from a bug within the library that was fixed ago, but for the sake of
      being cautious I've removed the dashes just in case
    */
    let uuid = uuidv4()
    uuid = _.replace(uuid, new RegExp("-","g"),"")

    // Additional layer of security - process is (further explained below too)
    // 1) username --> userAndPassChain (username + password)
    // 2) userAndPassChain --> uuid
    // 3) uuid --> Sleeping records (array)
    // This 3 way structure not only allows us to maintain security, but also carry out utility operations
    // For example, we can use Layer 1 to check if a user already exists so we don't overwrite accounts during registration
    // Layer 2 and 3 would be then for security (e.g. hide the uuid in encrypted storage, use the passchain for it)
    await SecureStore.setItemAsync(username, userAndPassChain);

    // This now sets the process as: username+password -> uuid (the unique identifier to a users
    // sleep records). This ensures a form of safety since external actors would need the uuid
    // to actually access sleeping records - without it, all they can do is guess the username
    // and password in order to get that uuid (hence as a result, we have good level of security)
    // This basically now adds the Layer 2 of the security mentioned above
    await SecureStore.setItemAsync(userAndPassChain, uuid);
    // And finally, Layer 3 (uuid --> sleeping records)
    // Now that the user is registered, set their account with an empty sleeping records array
    await SecureStore.setItemAsync(uuid, JSON.stringify([]))

    Toast.show({
      type: 'success',
      position: 'bottom',
      text1: 'You have succesfully registered!',
      text2: 'Please login using your username and password',
      visibilityTime: 4000,
      autoHide: true,
      topOffset: 30,
      bottomOffset: 40,
    });
    return true; // Return True to denote successful registration process
  }

  // loginUser: Using username & password specified, check if this user exists - if so,
  // then navigate to the next screen
  async function loginUser(username, password) {
    if (username == "" || password == ""){
      showMissingCredsMessage();
      return false;
    }

    const linkedPassChain = await SecureStore.getItemAsync(username);
    if (!linkedPassChain){
      showIncorrectCredsMessage();
      return [false, null];
    }

    // Otherwise, we do have a username and passchain fetched from this username
    const userAndPassChain = "username" + username + "pass" + password
    // Hence we check the input pass chain against the one linked to the username
    // If they're not correct, display the approp message (likely that the user entered the wrong password)
    if (linkedPassChain != userAndPassChain) {
      showIncorrectCredsMessage();
      return [false, null];
    }

    const linkedUUID = await SecureStore.getItemAsync(userAndPassChain);
    if (linkedUUID) { // Check if the result is correct / user does exist
      // If so, then we display the Toast message below
      Toast.show({
        type: 'success',
        position: 'bottom',
        text1: "Welcome user " + username + "!",
        text2: 'Logging you in now',
        visibilityTime: 4000,
        autoHide: true,
        topOffset: 30,
        bottomOffset: 40,
      });
      // We now return 'true' and the linkedUUID (the resulting uuid that we fetched)
      // to the function caller
      return [true, linkedUUID];
    } else {
      // Else, we display the message below since the username + password combo fetched no value / uuid
      // This shouldn't actually happen, but I included a error message in case it ever does - although the
      // code shouldn't allow it and all tests on this passed, I thought to include this anyway just in case
      Toast.show({
        type: 'error',
        position: 'bottom',
        text1: 'Something went wrong',
        text2: 'No UUID linked to account. This error is now logged, please try again later',
        visibilityTime: 4000,
        autoHide: true,
        topOffset: 30,
        bottomOffset: 40,
      });
      return [false, null]; // And we return these values to reflect the credentials failure
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sleep Analyser</Text>
      <View style={styles.separator} lightColor="#F9C7E4" darkColor="rgba(255,255,255,0.1)" />

      <Image
        style = {styles.imageProportions}
        source={require("../assets/images/sleepAnalysis.png")}
        resizeMode = "contain"
      />

      <View style = {styles.buttonGroup}>
        <Button
          style = {styles.button}
          labelStyle = {{ color: "black" }}
          mode = "contained"
          onPress = {() => {
            changeModalVisibility("login");
          }}
        >
          Login
        </Button>

        <Button
          style = {styles.button}
          labelStyle = {{ color: "black" }}
          mode = "contained"
          onPress = {() => {
            changeModalVisibility("registration");
          }}
        >
          Sign Up
        </Button>
      </View>

      <View>
        <Modal
          isVisible={showRegistrationModal}
          onBackdropPress = {() => {
            setRegisterUserName("");
            setRegisterPassword("");
            changeModalVisibility("registration");
          }}
        >
          <View style = {styles.modalContainer}>
            <Text style = {styles.modalTitle}>Register as a new user</Text>
            <TextInput
              label="Enter a new user name"
              placeholder = "Type a unique username here!"
              value={registerUserName}
              onChangeText={newText => setRegisterUserName(newText)}
              numberOfLines = {1}
              theme={{colors: {primary: 'black'}}}
              style = {styles.modalTextInput}
            />

            <TextInput
              label="Enter a password"
              placeholder = "Make sure it's not easy to guess!"
              value={registerPassword}
              onChangeText={newText => setRegisterPassword(newText)}
              secureTextEntry={true}
              numberOfLines = {1}
              theme={{colors: {primary: 'black'}}}
              style = {styles.modalTextInput}
            />

            <View style = {styles.modalButtonContainer}>
              <Button
                style = {styles.modalButton}
                labelStyle = {{ color: "black" }}
                mode = "contained"
                onPress ={async () => {
                  // If this is pressed, then we send the username and password the user has
                  // inputted so far to the registerNewUser function
                  const regResult = await registerNewUser(registerUserName, registerPassword);
                  // Afterwards, irrespective of result, hide the modal and reset the state vars
                  setRegisterUserName("");
                  setRegisterPassword("");
                  changeModalVisibility("registration");
                }}
              >
                Register
              </Button>

              <Button
                style = {styles.modalButton}
                labelStyle = {{ color: "black" }}
                mode = "contained"
                onPress ={() => {
                  // If this is pressed, then we just hide the model (& reset the username
                  // + password in the input boxes / ones held)
                  setRegisterUserName("");
                  setRegisterPassword("");
                  changeModalVisibility("registration");
                }}
              >
                Dismiss
              </Button>
            </View>
          </View>
        </Modal>
      </View>

      { /*
        Login Modal - future improvement that can be made here is to combine
        the two into 1 modifiable component. For the time being, for the sake of faster
        development speed and simplicity, I made two modals. The second one
        (used for registration) can be found below after this one
        */
      }
      <View>
        <Modal
          isVisible={showLoginModal}
          onBackdropPress = {() => {
            setLoginUserName("");
            setLoginPassword("");
            changeModalVisibility("login");
          }}
        >
          <View style = {styles.modalContainer}>
            <Text style = {styles.modalTitle}>Login to the app</Text>
            <TextInput
              label="Enter your user name"
              value={loginUserName}
              onChangeText={newText => setLoginUserName(newText)}
              numberOfLines = {1}
              theme={{colors: {primary: 'black'}}}
              style = {styles.modalTextInput}
            />

            <TextInput
              label="Enter your password"
              placeholder = "Make sure to remember correctly!"
              value={loginPassword}
              onChangeText={newText => setLoginPassword(newText)}
              secureTextEntry={true}
              numberOfLines = {1}
              theme={{colors: {primary: 'black'}}}
              style = {styles.modalTextInput}
            />

            <View style = {styles.modalButtonContainer}>
              <Button
                style = {styles.modalButton}
                labelStyle = {{ color: "black" }}
                mode = "contained"
                onPress ={async () => {
                  const [result, userUuid] = await loginUser(loginUserName, loginPassword);
                  // Reset the username and password on hand to nothing - as they won't be needed anymore
                  setLoginUserName("");
                  setLoginPassword("");
                  if (result){ // If the result was True (the login succeeded), then we proceed below
                    // We first send to the Global Store the uuid of the user who just logged in - to
                    // retain for other screens (e.g. so they can use it for referring to the user)
                    dispatch({type: "setUUID", payload: userUuid})
                    // Now, we make the Store hide the visibility of the Login / Landing screen since it's no longer needed
                    dispatch({type: "changeLoginVisibility", payload: false})
                    // After this, we just navigate to the Home screen as the user is now logged in!
                    navigation.navigate("Home");
                  }
                  else {
                    // Else, incorrect credentials were made - so we just hide the modal
                    changeModalVisibility("login");
                  }
                }}
              >
                Login
              </Button>

              <Button
                style = {styles.modalButton}
                labelStyle = {{ color: "black" }}
                mode = "contained"
                onPress ={() => {
                  // If the user presses this, then we just hide the modal
                  // We just remove the username & password made, and make the modal visibility to be false
                  setLoginUserName("");
                  setLoginPassword("");
                  changeModalVisibility("login");
                }}
              >
                Dismiss
              </Button>
            </View>
          </View>
        </Modal>
      </View>
      {/* End of the Login Modal */}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: "#F7E3D9", // Background color for whole screen
  },
  title: {
    fontSize: 35,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: "3%",
    height: 3,
    width: '75%',
  },
  imageProportions: {
    height: "45%",
    width: "85%",
  },
  buttonGroup: {
    marginTop: 30,
    backgroundColor: "#F7E3D9", // Adds the background color to the box
  },
  button: {
    marginVertical: 20,
    width: 135,
    backgroundColor: "#F9C7E4",
    borderColor: "black",
    borderWidth: 1,
  },
  modalContainer: {
    backgroundColor: "#FEEDCF",
    borderColor: "#C6D8D5",
    borderWidth: 3,
  },
  modalTitle: {
    marginTop: 20,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: "center",
  },
  modalTextInput: {
    marginTop: "5%",
    width: "90%",
    alignSelf: "center",
  },
  modalButtonContainer: {
    flexDirection: "row",
    backgroundColor: "#FEEDCF",
    justifyContent: "space-evenly",
  },
  modalButton: {
    backgroundColor: "#F9C7E4",
    borderColor: "black",
    borderWidth: 1,
    marginVertical: 20,
  }
});

export default Landing;
