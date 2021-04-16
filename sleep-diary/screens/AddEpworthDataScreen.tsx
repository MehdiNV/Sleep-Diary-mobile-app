import React, {useState} from 'react';
import { useSelector } from 'react-redux';

import { StyleSheet, Text, ScrollView, TextInput } from 'react-native';
import { Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { View } from '../components/Themed';
import DateTimePicker from '@react-native-community/datetimepicker';
import Toast from 'react-native-toast-message';
import * as SecureStore from 'expo-secure-store';
import moment from "moment";
import _ from 'lodash';

const AddEpworthData = () => {
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
  // Function: onChange
  // This is called when the user changes the date they want to enter a epworth score for
  // For example, the user changes the date from 15/04/2021 to 16/04/2021
  const onDateChange = (event, selectedDate) => {
    setShow(Platform.OS === 'ios');
    // Do a quick check to see if it's the same day - if so, do not set that date
    // As it would be illogical to have a epworth score entered for a date that is in the future
    if (moment(selectedDate).isAfter(new Date(), "day")){
      // If it is past the current date, then show an error message to the uers and ask them to
      // enter a different date (and not save the value that was entered)
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
      // If we reach this point, then the date input is fine - hence, we change the calendar date
      const currentDate = selectedDate || date;
      setDate(currentDate);
    }
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

    // Filters all the records we have, and sees if we have any record that match the date and type
    // As in, checks if we already have an entry specifically for this date
    // If nothing matches, this should be empty. Otherwise, it won't (and hence we have to overwrrite the existing date value)
    const matchingDate = _.filter(sleepingRecords, function(element) {
        return (moment(element.date).isSame(date, "day") &&
          element.type == "epworth");
    });

    // New Record / Entry that is going to be included in this users data
    const newEntryValue = {type: "epworth", date: date, value: currScore}

    if (matchingDate.length == 0){ // Checks if no other dates matched
      // If so, then this is a wholly new contribution that can be added in!
      sleepingRecords.push(newEntryValue); // Add a new record
      // And save the new sleeping records for the user
      await SecureStore.setItemAsync(uuid, JSON.stringify(sleepingRecords));
      // Notify to the user to wait / that it's being added - we'll show a 'success' msg right after
      Toast.show({
        type: 'info',
        position: 'bottom',
        text1: "One second....",
        text2: 'Please hold - added the entry now...',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 30,
        bottomOffset: 40,
      });
    }
    else { // We already have an entry for this night / date
      // Hence, we should replace the record we have here instead
      Toast.show({
        type: 'info',
        position: 'bottom',
        text1: "Entry for this date already exists",
        text2: 'Please hold - overwriting the values with the new entry...',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 30,
        bottomOffset: 40,
      });

      // Unique-fy all the sleeping records we have on hand; that is, remove any duplicates
      // just in case if any actually exists (distinguish them by the combo we get using
      // date + type of a record)
      sleepingRecords = _.uniqBy(sleepingRecords, function(record) {
        // ID records by their date+type (and remove any that match the same date+type)
        return (record.date + record.type)
      })

      // Same behaviour / approach as the one taken in Add Sleep Data - comments from there
      // apply just as equally to this var
      var overwrittenSleepingRecords = _.map(sleepingRecords, function(element) {
        return (moment(element.date).isSame(date, "day")
          && element.type == "epworth") ?
            newEntryValue
          :
            element;
      });
      // Overwrite the current UUID -> record with a new sleeping record, so the relationship will
      // now look like UUID -> new (updated) sleeping records
      await SecureStore.setItemAsync(uuid, JSON.stringify(overwrittenSleepingRecords));
    }
    // We want to have a delay between the 'loading' and 'success' messages, so we add a timeout / delay
    // using the code below (e.g. wait 3.5 seconds). This makes the app more intuitive (the user feels
    // like something is happening, they have an understanding of what is going on at all times)
    setTimeout(async () => {
      notifyStorageSuccess();
    }, 3500);
  }

  // When called, shows a 'success' toast to denote the new entry was added in
  const notifyStorageSuccess = async () => {
    Toast.show({
      type: 'success',
      position: 'bottom',
      text1: "Entry is now added in!",
      text2: 'This date now has your data added in',
      visibilityTime: 4000,
      autoHide: true,
      topOffset: 30,
      bottomOffset: 40,
    });
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
            onPress = {() => {
              // Makes the date-picker widget visible
              setShow(true);
            })}
          >
          {moment(date).format("DD/MM/YY")}
          </Button>

          <Ionicons
            size = {30}
            name = "calendar"
            style = {{ marginTop: 5, marginLeft: 5 }}
            onPress = {() => {
              // Like the above - makes the date widget visible for the user
              setShow(true);
            })}
          />

          {show && (
            <DateTimePicker
              value={date}
              mode={mode}
              is24Hour={true}
              display="default"
              onChange={onDateChange}
            />
          )}
        </View>
        <View style={styles.separator} lightColor="black" darkColor="rgba(255,255,255,0.1)" />
      </View>

      <ScrollView style = {styles.questionnaireSection}>
        <Text style = {{marginBottom: 20}}>
          How likely are you to doze off or fall asleep in
          the situations described below, in contrast to feeling tired?
          This refers to your usual way of life in recent times
        </Text>
        <Text style = {{marginBottom: 20}}>
          Even if you haven't done some of these things recently
          try to work out how they would have affected you
        </Text>
        <Text>
          Use the following scale to choose the most appropriate
          number for each situation:
        </Text>
        <Text>0 = would never doze</Text>
        <Text>1 = Slight chance of dozing</Text>
        <Text>2 = Moderate chance of dozing</Text>
        <Text>3 = High chance of dozing</Text>

        {
          /*
          The below is a container that organises everything in a row by
          row style. This is done in order to reflect the way the screen was
          designed to look in its original storyboard
          */
        }
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

// StyleSheet for the component - contains styling properties that make the
// screen look the way it is e.g. alignments, sizes, etc
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
