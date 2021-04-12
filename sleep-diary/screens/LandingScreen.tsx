import React, {useState} from 'react';
import { StyleSheet, Image, Text} from 'react-native';
import { Button, TextInput} from 'react-native-paper';

import EditScreenInfo from '../components/EditScreenInfo';
import { View } from '../components/Themed';
import Modal from 'react-native-modal';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';


const Landing = ({ navigation, route}) => {
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [registerUserName, setRegisterUserName] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginUserName, setLoginUserName] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const changeModalVisibility = (type) => {
    if (type == "login"){
      setShowLoginModal(!showLoginModal);
    }
    else if (type == "registration"){
      setShowRegistrationModal(!showRegistrationModal);
    }
  }

  async function registerNewUser(username, password) {
    /*
     Create a new user - get the username, and password
     Combine those two values together to a usernameApassB
     Then link it to a unique uuid (e.g. in key-val relationship)
    */
    const userAndPassChain = "username" + username + "pass" + password
    await SecureStore.setItemAsync(userAndPassChain, uuidv4());
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
  }

  async function loginUser(username, password) {
    const userAndPassChain = "username" + username + "pass" + password
    const loginResult = await SecureStore.getItemAsync(userAndPassChain);
    if (loginResult) {
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
      return [true, loginResult]; // User logged in correctly!
    } else {
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
      return [false, null];
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
          onPress = {() => {changeModalVisibility("registration")}}
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
                  registerNewUser(registerUserName, registerPassword);
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

      {/* Login Modal - future improvement that can be made here is to combine
        the two into 1 modifiable component. In the meantime, a similar modal
        to the above is denoted below*/}

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
                  setLoginUserName("");
                  setLoginPassword("");
                  if (result){
                    navigation.navigate("Home", {screen: "Home", params: {uuid: [userUuid]}});
                  }
                  else { // Incorrect credentials made
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
