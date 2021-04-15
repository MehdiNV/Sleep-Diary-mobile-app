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

  const purgeData = async () => {
    // Reset all the data - reset the UUID to associate with an empty (data) array
    await SecureStore.setItemAsync(uuid, JSON.stringify([]));
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <View style = {styles.screenContent}>
        <Text>Adjust the app settings and behaviour here</Text>
        <View style={styles.separator} lightColor="black" darkColor="rgba(255,255,255,0.1)" />
        <Text style={styles.subtitle}>Reset your sleeping records</Text>
        <Text>If you wish, you can reset your account by deleting all the sleep entries
          that were made using the button below. Please note that this will delete
          everything though (Sleep Data, Epworth, etc)</Text>
        <Button
          style = {styles.button}
          mode = "contained"
          labelStyle = {{ color: "black" }}
          onPress = {changeModalVisibility}
        >
          Delete all sleeping records
        </Button>
        <View style={styles.separator} lightColor="black" darkColor="rgba(255,255,255,0.1)" />
        <Text style={styles.subtitle}>Want to get in contact? Here's how</Text>
        <Text>You can get in contact by emailing me (Mehdi, creator of the app) at
          <Text style = {{fontStyle: "italic"}}> m.naderi-varandi@newcastle.ac.uk</Text>
        </Text>
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
            <Text style = {styles.modalTitle}>Warning! This will delete all records</Text>
            <Text style = {styles.modalText}>To check, are you sure you want to delete everything?
              If so then press the 'Delete all' button, otherwise press 'Cancel'</Text>

            <View style = {styles.modalButtonContainer}>
              <Button
                style = {styles.modalButton}
                labelStyle = {{ color: "black" }}
                mode = "contained"
                onPress = {async () => {
                  await purgeData();
                  changeModalVisibility();
                }}
              >
                Delete all
              </Button>

              <Button
                style = {styles.modalButton}
                labelStyle = {{ color: "black" }}
                mode = "contained"
                onPress = {changeModalVisibility}
              >
                Cancel
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
    marginBottom: 10,
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
  modalText: {
    width: "85%",
    alignSelf: "center",
    textAlign: "center",
    marginTop: 5,
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
