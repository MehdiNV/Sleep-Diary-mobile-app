import React, {useState} from 'react';
import { StyleSheet, Text } from 'react-native';
import { useSelector } from 'react-redux';
import { Button } from 'react-native-paper';
import Modal from 'react-native-modal';
import Toast from 'react-native-toast-message';
import * as SecureStore from 'expo-secure-store';

import { View } from '../components/Themed';

const Settings = () => {
  const uuid = useSelector(state => state.uuid); // Get the UUID of the logged in account
  const [showWarningModal, setWarningModal] = useState(false);

  const changeModalVisibility = () => {
    setWarningModal(!showWarningModal);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <View style = {styles.screenContent}>
        <Text>TODO Write some text here</Text>
        <View style={styles.separator} lightColor="black" darkColor="rgba(255,255,255,0.1)" />
        <Text style={styles.subtitle}>Reset your sleeping records</Text>
        <Button
          style = {styles.button}
          mode = "contained"
          labelStyle = {{ color: "black" }}
          onPress = {changeModalVisibility}
        >
          Delete all sleeping records
        </Button>
      </View>
      {/* End of Screen Content View */}

      <View>
        <Modal
          isVisible={showWarningModal}
          onBackdropPress = {() => {
            changeModalVisibility();
          }}
        >
          <View style = {styles.modalContainer}>
            <Text style = {styles.modalTitle}>Login to the app</Text>

            <View style = {styles.modalButtonContainer}>
              <Button
                style = {styles.modalButton}
                labelStyle = {{ color: "black" }}
                mode = "contained"
              >
                Button 1
              </Button>

              <Button
                style = {styles.modalButton}
                labelStyle = {{ color: "black" }}
                mode = "contained"
              >
                Button 2
              </Button>
            </View>
          </View>
        </Modal>
      </View>

    </View>
  )
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
  subtitle: {
    textDecorationLine: "underline",
    marginBottom: 15,
  },
  screenContent: {
    marginTop: 20,
    width: "85%",
    backgroundColor: "#F7E3D9",
  },
  separator: {
    marginVertical: "3%",
    height: 2,
    width: '100%',
  },
  button: {
    marginTop: 15,
    marginBottom: 10,
    width: "100%",
    backgroundColor: "#F9C7E4",
    borderColor: "black",
    borderWidth: 1,
    alignSelf: "center",
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


export default Settings;
