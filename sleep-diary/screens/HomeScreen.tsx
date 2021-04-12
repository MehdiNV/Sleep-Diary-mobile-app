import React, {useEffect} from 'react';
import { StyleSheet, Text } from 'react-native';
import { Button } from 'react-native-paper';

import EditScreenInfo from '../components/EditScreenInfo';
import { View } from '../components/Themed';
import { useSelector } from 'react-redux';
import * as SecureStore from 'expo-secure-store';
import moment from "moment";

const Home = ({ navigation, route }) => {
  // Getting UUID / Handing Login
  const uuid = useSelector(state => state.uuid); // Get the UUID of the logged in account

  useEffect(() => {
    async function setInitialUser() {
      const uuidCheck = await SecureStore.getItemAsync(uuid);
      if (!uuidCheck){ // If the value is Null, as in there is no uuid in the storage
        // Then that means this user has no sleeping records at at all
        // What we can do here is set them up with an empty [] initially
        await SecureStore.setItemAsync(uuid, JSON.stringify([]))
      }
    }
    setInitialUser();
  },[]);

  // Fetches the current date to display to the user
  const date = moment(new Date()).format("Do MMMM YYYY")
  const time = moment(new Date()).format("HH:mmA")

  const currHour = moment().format("HH");
  var dayPhase = ""
  if (currHour >= 0 && currHour < 12){
    dayPhase = "morning"
  }
  else if (currHour >= 12 && currHour <= 18){
    dayPhase = "afternoon"
  }
  else if (currHour >= 18 && currHour <= 23){
    dayPhase = "evening"
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home</Text>

      <View style = {styles.screenContent}>
        <Text>
          Good {dayPhase}! The time and date
          is currently {time}, {date}
        </Text>
        <View style={styles.separator} lightColor="black" darkColor="rgba(255,255,255,0.1)" />


        <Text style={styles.subtitle}>Sleep Length</Text>
        <Text>Input data for your previous night - make sure to fill it out!</Text>
        <Button
          style = {styles.button}
          mode = "contained"
          labelStyle = {{ color: "black" }} // Makes the text of the button black per design
          onPress = {() => {
            navigation.navigate("AddSleepData", {screen: "AddSleepData", params: {uuid: [uuid]}})
          }}
        >
          Enter sleep data
        </Button>

        <View style={styles.separator} lightColor="black" darkColor="rgba(255,255,255,0.1)" />

        <Text style={styles.subtitle}>Sleep Quality score</Text>
        <Text>
          Input 'Epworth Sleepiness scale' measure for the previous night.
          Make sure to do so in order to build a reliable
          stockpile of data to use
        </Text>
        <Button
          style = {styles.button}
          mode = "contained"
          labelStyle = {{ color: "black" }}
          onPress = {() =>
            navigation.navigate("AddEpworthData", {screen: "AddEpworthData", params: {uuid: [uuid]}})
          }
        >
          Enter todays Epworth score
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: "#F7E3D9",
  },
  title: {
    fontSize: 35,
    fontWeight: 'bold',
  },
  subtitle: {
    textDecorationLine: "underline",
    marginBottom: 15,
  },
  separator: {
    marginVertical: "3%",
    height: 2,
    width: '100%',
  },
  screenContent: {
    marginTop: 20,
    width: "85%",
    backgroundColor: "#F7E3D9",
  },
  button: {
    marginTop: 15,
    marginBottom: 10,
    width: "100%",
    backgroundColor: "#F9C7E4",
    borderColor: "black",
    borderWidth: 1,
    alignSelf: "center",
  }
});

export default Home;
