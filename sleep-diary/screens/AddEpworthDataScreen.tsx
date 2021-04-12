import React, {useState} from 'react';
import { StyleSheet, Text, ScrollView, TextInput } from 'react-native';
import { Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import Toast from 'react-native-toast-message';
import * as SecureStore from 'expo-secure-store';

import { View } from '../components/Themed';
import moment from "moment";
import _ from 'lodash';

// Import needed for Redux
import { useSelector } from 'react-redux';

const AddEpworthData = ({ route }) => {
  const uuid = useSelector(state => state.uuid); // Get the UUID of the logged in account

  // Section for showing 'Date for' calendar entry
  const [date, setDate] = useState(new Date());
  const [mode, setMode] = useState('date');
  const [show, setShow] = useState(false);

  const [epworthScore, setEpworthScore] = useState({})
  /*
    Format for the code below in lodash is:
    1) Convert the data strcture to have numbers instead (_.toNumber and _.map)
    2) Get the values of this data structure (object)...
    ...out solely - disregard the keys (_.values)
    3) Now having a array of integers, sum them up (_.sum)
    Basically, I wanted to get all the values saved in the state...
    ...(which is an object), and sum them up. This accomplishes it by...
    ...turning all the values into integers, packaging them into an array...
    ...and away from their original key-value pairing, and then summing them
  */
  const currScore = _.sum(_.values(_.map(epworthScore, (element) => {
                          return _.toNumber(element)
                        })))

  // Methods used for the 'Date for' calendar entry
  const onChange = (event, selectedDate) => {
    setShow(Platform.OS === 'ios');
    if (moment(selectedDate).isAfter(new Date(), "day")){
      Toast.show({
        type: 'error',
        position: 'bottom',
        text1: 'You cannot enter a date into the future!',
        text2: 'Please enter a different date',
        visibilityTime: 4000,
        autoHide: true,
        topOffset: 30,
        bottomOffset: 40,
      });
    }
    else {
      const currentDate = selectedDate || date;
      setDate(currentDate);
    }
  };

  const showMode = (currentMode) => {
    setShow(true);
    setMode(currentMode);
  };

  const showDatepicker = () => {
    showMode('date');
  };

  const showTimepicker = () => {
    showMode('time');
  };

  // Text Handler for the number inputs (The epworth scoring)
  const handleTextChange = (inputIdentifier, value) => {
    if (/^\d+$/.test(value) || value === '') { // Checks if it's actually a number
      if (_.toNumber(value) >= 0 && _.toNumber(value) <= 3){
        // Check as well if the number is between the permitted 0 to 3 range

        // Take a copy of the state, and set the new value in it
        // This ensures we update the state (using the ...epworth copy) instead of overwriting it
        setEpworthScore({...epworthScore, [inputIdentifier]: value})
      }
    }
    // The Regex used to accomplish this can be found below:
    // https://gist.github.com/AlexisLeon/80b5641eb30b43bc598288e41052ac39
  }

  // Method that adds the data to the storage for the user
  const addEpworthData = async () => {
    let sleepingRecords = await SecureStore.getItemAsync(uuid);
    sleepingRecords = JSON.parse(sleepingRecords); // Convert it to its array format

    const matchingDate = _.filter(sleepingRecords, function(element) {
        console.log ("Elements date " + element.date)
        console.log ("My date " + date);
        return (moment(element.date).isSame(date, "day"));
    });

    const newEntryValue = {type: "epworth", date: date, value: currScore}

    console.log("Before----");
    console.log("Before: Sleeping Records")
    console.log(sleepingRecords)
    console.log("Before: Matching Dates")
    console.log(matchingDate)

    if (matchingDate.length == 0){ // Checks if no other dates matched
      // If so, then this is a wholly new contribution that can be added in!
      sleepingRecords.push(newEntryValue); // Add a new record
      // And save the new sleeping records for the user
      await SecureStore.setItemAsync(uuid, JSON.stringify(sleepingRecords));
    }
    else { // We already have an entry for this night / date
      // Hence, we should replace the record we have here instead
      Toast.show({
        type: 'info',
        position: 'bottom',
        text1: "Entry for this date already exists",
        text2: 'Overwriting this entry with new value',
        visibilityTime: 4000,
        autoHide: true,
        topOffset: 30,
        bottomOffset: 40,
      });

      var overwrittenSleepingRecords = _.map(sleepingRecords, function(element) {
        return (moment(element.date).isSame(date, "day")) ?
            newEntryValue
          :
            element;
      });

      await SecureStore.setItemAsync(uuid, JSON.stringify(overwrittenSleepingRecords));
    }

    sleepingRecords = await SecureStore.getItemAsync(uuid);
    sleepingRecords = JSON.parse(sleepingRecords);
    
    console.log("After----");
    console.log("After: Sleeping Records")
    console.log(sleepingRecords)
    console.log("After: Matching Dates")
    console.log(matchingDate)
  }


  return (
    <View style={styles.container}>
      <View style = {styles.screenContent}>
        <Text style={styles.title}>Enter Epworth data</Text>
        {
          /* Same as the one used in Add Sleep Data
             Used here as well since it's needed for similar goal
          */
        }
        <View style = {styles.dateEntry}>
          <Text>Data for the night of</Text>
          <Button
            style = {styles.button}
            mode = "contained"
            labelStyle = {{ color: "black", fontSize: 12}}
            onPress = {showDatepicker}
          >
          {moment(date).format("DD/MM/YY")}
          </Button>

          <Ionicons
            size = {30}
            name = "calendar"
            style = {{ marginTop: 5, marginLeft: 5 }}
            onPress = {showDatepicker}
          />

          {show && (
            <DateTimePicker
              value={date}
              mode={mode}
              is24Hour={true}
              display="default"
              onChange={onChange}
            />
          )}
        </View>
        <View style={styles.separator} lightColor="black" darkColor="rgba(255,255,255,0.1)" />
      </View>

      <ScrollView style = {styles.questionnaireSection}>
        <Text style = {{marginBottom: 20}}>How likely are you to doze off or fall asleep in
          the situations described below, in contrast to feeling tired?
          This refers to your usual way of life in recent times</Text>
        <Text style = {{marginBottom: 20}}>Even if you haven't done some of these things recently
          try to work out how they would have affected you</Text>
        <Text>Use the following scale to choose the most appropriate
          number for each situation:</Text>
        <Text>0 = would never doze</Text>
        <Text>1 = Slight chance of dozing</Text>
        <Text>2 = Moderate chance of dozing</Text>
        <Text>3 = High chance of dozing</Text>
        <View style = {styles.rowSection}>
          <View style = {styles.row}>
            <Text style = {styles.rowHeader}>Situation Dozing</Text>
            <Text style = {styles.rowHeader}>Chance</Text>
          </View>

          <View style = {styles.dataRow}>
            <Text style = {styles.rowSituation}>Sitting and reading</Text>
            <TextInput
              keyboardType = 'numeric'
              textContentType='telephoneNumber'
              onChangeText={(value) => handleTextChange("row1", value)}
              value = {epworthScore["row1"]}
              style = {styles.textInput}
              maxLength = {1}
            />
          </View>
          <View style = {styles.dataRow}>
            <Text style = {styles.rowSituation}>Watching TV</Text>
            <TextInput
              keyboardType = 'numeric'
              textContentType='telephoneNumber'
              onChangeText={(value) => handleTextChange("row2", value)}
              value = {epworthScore["row2"]}
              style = {styles.textInput}
              maxLength = {1}
            />
          </View>
          <View style = {styles.dataRow}>
            <Text style = {styles.rowSituation}>Sitting, inactive in a public place (e.g. theatre or a meeting)</Text>
            <TextInput
              keyboardType = 'numeric'
              textContentType='telephoneNumber'
              onChangeText={(value) => handleTextChange("row3", value)}
              value = {epworthScore["row3"]}
              style = {styles.textInput}
              maxLength = {1}
            />
          </View>
          <View style = {styles.dataRow}>
            <Text style = {styles.rowSituation}>As a passenger in a car for an hour without an break</Text>
            <TextInput
              keyboardType = 'numeric'
              textContentType='telephoneNumber'
              onChangeText={(value) => handleTextChange("row4", value)}
              value = {epworthScore["row4"]}
              style = {styles.textInput}
              maxLength = {1}
            />
          </View>
          <View style = {styles.dataRow}>
            <Text style = {styles.rowSituation}>Lying down to rest in the afternoon when circumstances permit</Text>
            <TextInput
              keyboardType = 'numeric'
              textContentType='telephoneNumber'
              onChangeText={(value) => handleTextChange("row5", value)}
              value = {epworthScore["row5"]}
              style = {styles.textInput}
              maxLength = {1}
            />
          </View>
          <View style = {styles.dataRow}>
            <Text style = {styles.rowSituation}>Sitting and talking to someone</Text>
            <TextInput
              keyboardType = 'numeric'
              textContentType='telephoneNumber'
              onChangeText={(value) => handleTextChange("row6", value)}
              value = {epworthScore["row6"]}
              style = {styles.textInput}
              maxLength = {1}
            />
          </View>
          <View style = {styles.dataRow}>
            <Text style = {styles.rowSituation}>Sitting quietly after a lunch without alcohol</Text>
            <TextInput
              keyboardType = 'numeric'
              textContentType='telephoneNumber'
              onChangeText={(value) => handleTextChange("row7", value)}
              value = {epworthScore["row7"]}
              style = {styles.textInput}
              maxLength = {1}
            />
          </View>
          <View style = {styles.dataRow}>
            <Text style = {styles.rowSituation}>In a car, while stopped for a few minutes in the traffic</Text>
            <TextInput
              keyboardType = 'numeric'
              textContentType='telephoneNumber'
              onChangeText={(value) => handleTextChange("row8", value)}
              value = {epworthScore["row8"]}
              style = {styles.textInput}
              maxLength = {1}
            />
          </View>
        </View>
        {/* End of the 'Row' section*/}

        <View style = {styles.epworthResult}>
          <Text style = {{ fontWeight: "bold", alignSelf: "center", fontSize: 17}}>Total</Text>
          <Text style = {styles.scoreBox}>{currScore}</Text>
        </View>

        <Button
          style = {styles.submitButton}
          mode = "contained"
          labelStyle = {{ color: "black" }}
          onPress = {async () => {await addEpworthData()}}
        >
          Submit
        </Button>

      </ScrollView>

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
    alignSelf: "center",
    fontWeight: 'bold',
  },
  screenContent: {
    marginTop: "25%",
    width: "85%",
    backgroundColor: "#F7E3D9",
  },
  dateEntry: {
    marginTop: "5%",
    backgroundColor: "#F7E3D9",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    marginTop: 15,
    marginBottom: 10,
    width: "35%",
    backgroundColor: "white",
    borderColor: "black",
    borderWidth: 1,
    alignSelf: "center",
    marginLeft: 10,
  },
  separator: {
    marginVertical: "3%",
    height: 2,
    width: '100%',
  },
  questionnaireSection: {
    marginTop: 5,
    backgroundColor: "#F7E3D9",
    width: "85%",
    marginBottom: 10,
  },
  rowSection: {
    marginTop: 5,
  },
  row: {
    backgroundColor: "#F7E3D9",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  dataRow: {
    backgroundColor: "#F7E3D9",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  rowHeader: {
    fontWeight: "bold",
  },
  rowSituation: {
    width: "80%",
    textAlignVertical: "center",
  },
  textInput: {
    height: 28,
    backgroundColor: "white",
    borderColor: "black",
    borderStyle: "solid",
    borderWidth: 1,
    textAlign: "center",
    textAlignVertical: "center",
    alignSelf: "center",
    marginRight: 12, // Makes the TextInput be...
    //...better positioned under the 'Chance'
  },
  epworthResult: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    backgroundColor: "#F7E3D9",
    marginTop: 15,
  },
  scoreBox: {
    borderColor: "black",
    borderWidth: 3,
    borderStyle: "solid",
    backgroundColor: "white",
    padding: 5,
    paddingLeft: 10,
    paddingRight: 10,
    alignSelf: "center",
    textAlign: "center",
    textAlignVertical: "center",
  },
  submitButton: {
    marginTop: 15,
    marginBottom: 25,
    width: "95%",
    backgroundColor: "#F9C7E4",
    borderColor: "black",
    alignSelf: "center",
    borderWidth: 1,
  }
});


export default AddEpworthData;
