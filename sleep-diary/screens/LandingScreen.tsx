import React, {useState} from 'react';
import { StyleSheet, Image, Text} from 'react-native';
import { Button } from 'react-native-paper';

import EditScreenInfo from '../components/EditScreenInfo';
import { View } from '../components/Themed';
import Modal from 'react-native-modal';


const Landing = ({ navigation, route}) => {
  const [showModal, setShowModal] = useState(false);

  const makeModalVisible = () => {
    setShowModal(true);
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
          onPress ={makeModalVisible}
        >
          Sign Up
        </Button>
      </View>

      <View style = {styles.modalContainer}>
        <Modal isVisible={showModal}>
          <View style={{flex: 1}}>
            <Text>I am the modal content!</Text>
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
  }
});

export default Landing;
