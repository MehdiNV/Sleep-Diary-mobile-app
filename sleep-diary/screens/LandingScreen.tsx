import React, {useState} from 'react';
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

  // registerNewUser: Using the username & password state vars from above, create a new uuid / user
  async function registerNewUser(username, password) {
    /*
     Create a new user - get the username, and password
     Combine those two values together to a usernameApassB
     Then link it to a unique uuid (e.g. in key-val relationship)
    */
    const userAndPassChain = "username" + username + "pass" + password

    /*
      Expo's Secure Storage seems to have an issue with dashes in the string
      This seems to be from a bug within the library that was fixed ago, but for the sake of
      being cautious I've removed the dashes just in case
    */
    let uuid = uuidv4()
    uuid = _.replace(uuid, new RegExp("-","g"),"")

    // This now sets the process as: username+password -> uuid (the unique identifier to a users
    // sleep records). This ensures a form of safety since external actors would need the uuid
    // to actually access sleeping records - without it, all they can do is guess the username
    // and password in order to get that uuid (hence as a result, we have good level of security)
    await SecureStore.setItemAsync(userAndPassChain, uuid);
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

    // Now that the user is registered, set their account with an empty sleeping records array
    await SecureStore.setItemAsync(uuid, JSON.stringify([]))
  }

  // loginUser: Using username & password specified, check if this user exists - if so,
  // then navigate to the next screen
  async function loginUser(username, password) {
    const userAndPassChain = "username" + username + "pass" + password
    // The below checks if an actual Key-Val pairing exists for userAndPassChain
    const loginResult = await SecureStore.getItemAsync(userAndPassChain);
    if (loginResult) { // Check if the result is correct / user does exist
      // If so, then we display the Toast message below
      Toast.show({
        type: 'success',
        position: 'bottom',
        text1: "Welcome back user " + username + "!",
        text2: 'Logging you in now',
        visibilityTime: 4000,
        autoHide: true,
        topOffset: 30,
        bottomOffset: 40,
      });
      // We now return 'true' and the loginResult (the resulting uuid that we fetched)
      // to the function caller
      return [true, loginResult];
    } else {
      // Else, we display the message below since the username + password combo fetched no value / uuid
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
                onPress ={() => {
                  // If this is pressed, then we send the username and password the user has
                  // inputted so far to the registerNewUser function
                  registerNewUser(registerUserName, registerPassword);
                  // Afterwards, we reset the states holding the username and password, and hide the modal
                  // as it is no longer needed
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
