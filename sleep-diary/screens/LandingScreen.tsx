import React, {useState} from 'react';
import { StyleSheet, Image, Text} from 'react-native';
import { Button, TextInput} from 'react-native-paper';

import EditScreenInfo from '../components/EditScreenInfo';
import { View } from '../components/Themed';
import Modal from 'react-native-modal';


const Landing = ({ navigation, route}) => {
  const [showModal, setShowModal] = useState(false);
  const [registerUserName, setRegisterUserName] = useState("");

  const changeModalVisibility = () => {
    setShowModal(!showModal);
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
            navigation.navigate("Home")}
          }
        >
          Login
        </Button>

        <Button
          style = {styles.button}
          labelStyle = {{ color: "black" }}
          mode = "contained"
          onPress ={changeModalVisibility}
        >
          Sign Up
        </Button>
      </View>

      <View>
        <Modal
          isVisible={showModal}
          onBackdropPress = {changeModalVisibility}
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
              value={registerUserName}
              onChangeText={newText => setRegisterUserName(newText)}
              numberOfLines = {1}
              theme={{colors: {primary: 'black'}}}
              style = {styles.modalTextInput}
            />

            <View style = {styles.modalButtonContainer}>
              <Button
                style = {styles.modalButton}
                labelStyle = {{ color: "black" }}
                mode = "contained"
                onPress ={changeModalVisibility}
              >
                Register
              </Button>

              <Button
                style = {styles.modalButton}
                labelStyle = {{ color: "black" }}
                mode = "contained"
                onPress ={changeModalVisibility}
              >
                Dismiss
              </Button>
            </View>
          </View>
        </Modal>
      </View>

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
    height: "40%",
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
    marginTop: 20,
  }
});

export default Landing;
