import React, {useState, useEffect, useCallback} from 'react';
import { StyleSheet, Text } from 'react-native';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
// Above are imports for functions / hooks / general React, below for components or aux libraries
import { Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { View } from '../components/Themed';
import Toast from 'react-native-toast-message';
import * as SecureStore from 'expo-secure-store';
import moment from "moment";

const Home = ({ navigation }) => {
  // Getting UUID / Handing Login
  let uuid = useSelector(state => state.uuid); // Get the UUID of the logged in account

  // TODO - Comments
  useEffect(() => {
    // Triggers if the uuid in Redux store changes - ensures the uuid held above is accurate as a result
  },[uuid]);

  // Function that connects to the global store - this acts as the pathway to pass data to the global store
  // So, if we do dispatch({data}), this will send that data to that global store and update the info held there
  const dispatch = useDispatch();

  // Fetches the current date & time to display to the user, using moment()
  const [date, setDate] = useState(moment(new Date()).format("Do MMMM YYYY"))
  const [time, setTime] = useState(moment(new Date()).format("HH:mmA"))

  const [checkUser, setCheckUser] = useState(true);

  // Hook that runs every time Home screen comes into focus / navigated to
  // Once so, we just run a quick state change and update the date & time to reflect
  // the current time at that moment
  useFocusEffect(
    useCallback(() => {
      setDate(moment(new Date()).format("Do MMMM YYYY"))
      setTime(moment(new Date()).format("HH:mmA"))
    }, [])
  );

  // Calculate what type of 'Time' to show - e.g. if its between 00:00 - 12:00
  // then display 'Morning'. If it's past 12pm, then 'Afternoon'
  const currHour = moment().format("HH");
  var dayPhase = ""
  if (currHour >= 0 && currHour < 12){ // Check if hour is 00:00 - 12:00PM
    dayPhase = "morning"
  }
  else if (currHour >= 12 && currHour <= 18){ // Check if 12:00PM - 18:00PM
    dayPhase = "afternoon"
  }
  else if (currHour >= 18 && currHour <= 23){ // Check if 18:00PM - 23:00PM
    dayPhase = "evening"
  }

  return (
    <View style={styles.container}>
      <View style = {styles.signOutContainer}>
        <Text
          onPress = {() => {
            // Pass to the Global Store a true value for showing the Login / Landing screen
            // This will make that screen be visible and usable for the navigation - making it
            // feasible to now navigate towards it later on
            dispatch({type: "changeLoginVisibility", payload: true});
            // Making the Landing screen visible makes the tab bar slightly look weird -
            // to alleivate this, I display a Toast to the user to hide this visual irregularity
            // It has to be hidden as the Landing screen won't work otherwise unfortunately per testing
            Toast.show({
              type: 'success',
              position: 'bottom',
              text1: "You are now logged out!",
              text2: 'Thanks for using the app!',
              visibilityTime: 3000,
              autoHide: true,
              topOffset: 30,
              bottomOffset: 10,
            });

            setCheckUser(true); // Reset back to true - the next user may need to be verified again
            console.log("06: Signing out. Value is now resetting to true");

            // Reset the UUID we hold in the global Redux store as well by sending
            // the "N/A" value - this makes the UUID be unusable value / ensure the
            // user is properly logged out as we no longer hold the uuid
            dispatch({type: "setUUID", payload: "N/A"})
            // There is a slight lag (about just by 1) when we dispatch to the Global Store
            // to make the Landing Screen visible / usable by the navigation - hence, I use the
            // setTimeout function to briefly wait for 5 (I believe milliseconds) before we call
            // the navigation.navigate("Landing") - the delay just ensures it's loaded in time,
            // while being short enough that users wont notice
            setTimeout(() => {
              navigation.navigate("Landing");
            }, 5);
          }}
        >Sign Out</Text>
        <Ionicons
          style = {{ marginLeft: 3, marginTop: 3}}
          onPress = {() => {
            // Same approach as the above - the same is just applied to the icon as well
            dispatch({type: "changeLoginVisibility", payload: true});
            Toast.show({
              type: 'success',
              position: 'bottom',
              text1: "You are now logged out!",
              text2: 'Thanks for using the app!',
              visibilityTime: 3000,
              autoHide: true,
              topOffset: 30,
              bottomOffset: 10,
            });

            setCheckUser(true); // Reset back to true - the next user may need to be verified again
            console.log("06: Signing out. Value is now resetting to true");

            dispatch({type: "setUUID", payload: "N/A"})
            setTimeout(() => {
              navigation.navigate("Landing");
            }, 5);
          }}
          name="log-out"
          size = {20}
        />
      </View>
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
            navigation.navigate("AddSleepData")
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
            navigation.navigate("AddEpworthData")
          }
        >
          Enter todays Epworth score
        </Button>
      </View>
    </View>
  );
}

// Set of styling to apply for components e.g. Text or the View
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: "#F7E3D9",
  },
  signOutContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7E3D9",
    alignSelf: "flex-end",
    top: 58,
    right: 12,
    position: "absolute",
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
