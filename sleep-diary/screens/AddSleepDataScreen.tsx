import React, {useState, useEffect} from 'react';
import { useSelector } from 'react-redux';

import { StyleSheet, Text } from 'react-native';
import { Modal, Portal, Button, Provider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { View } from '../components/Themed';
import DateTimePicker from '@react-native-community/datetimepicker';
import Toast from 'react-native-toast-message';
import * as SecureStore from 'expo-secure-store';
import moment from "moment";
import _ from 'lodash';

const AddSleepData = () => {
  const uuid = useSelector(state => state.uuid); // Get the UUID of the logged in account

  useEffect(() => {
    // Triggers if the uuid in Redux store changes - ensures the uuid held above is accurate as a result
  },[uuid]);

  // Section for showing 'Date for the night of' part
  const [date, setDate] = useState(new Date());
  const [mode, setMode] = useState('date');
  const [show, setShow] = useState(false);

  // Section for picking the sleeping date and time
  const [sleepDate, setSleepDate] = useState(new Date());
  const [sleepTime, setSleepTime] = useState(new Date());
  const [showSleepDatePicker, setShowSleepDatePicker] = useState(false);
  const [showSleepTimePicker, setShowSleepTimePicker] = useState(false);

  // Section for picking the awakening date and time
  const [awakeDate, setAwakeDate] = useState(new Date());
  const [awakeTime, setAwakeTime] = useState(new Date());
  const [showAwakeDatePicker, setShowAwakeDatePicker] = useState(false);
  const [showAwakeTimePicker, setShowAwakeTimePicker] = useState(false);

  // Functions
  // Calendar Sleep Entry Picker
  const onChange = (event, selectedDate) => {
    setShow(Platform.OS === 'ios');
    if (moment(selectedDate).isAfter(new Date(), "day")) {
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

  // Methods that are linked to the Awake Picker (Widgets for selecting time
  // ...and date)
  // Func: updateAwakeTime
  // This is called when the user selects a new time using the time Widget
  // Once they do, we recieve their new choice (or cancellation) and appropriately
  // update the state information we hold
  const updateAwakeTime = (event, selectedTime) => {
    const currAwakeTime = selectedTime || awakeTime;
    setShowAwakeTimePicker(Platform.OS === 'ios');
    setAwakeTime(currAwakeTime);
  }
  // Func: updateAwakeDate
  // Likewise like the above, but for the date (that you wake up on) instead
  const updateAwakeDate = (event, selectedDate) => {
    const currAwakeDate = selectedDate || awakeDate;
    setShowAwakeDatePicker(Platform.OS === 'ios');
    setAwakeDate(currAwakeDate);
  }
  // showAwakePickerWidgets: Shows the time and date widgets (for selecting time and date user woke up on)
  const showAwakePickerWidgets = () => {
    setShowAwakeDatePicker(true);
    setShowAwakeTimePicker(true);
  }

  // Methods for the Sleep picker / widget used for sleeping date & time
  // updateSleepTime: recieves the selected time inputted, and updates the state that holds it
  const updateSleepTime = (event, selectedTime) => {
    const currSleepTime = selectedTime || sleepTime;
    setShowSleepTimePicker(Platform.OS === 'ios');
    setSleepTime(currSleepTime);
  }
  // updateSleepDate: Same as the above, but for dates instead
  const updateSleepDate = (event, selectedDate) => {
    const currSleepDate = selectedDate || sleepDate;
    setShowSleepDatePicker(Platform.OS === 'ios');
    setSleepDate(currSleepDate);
  }
  // showSleepPickerWidgets: Shows both the time and date pickers
  // The calendar / date one is shown first (overlays the time) - idea here is that to the user,
  // they still get the option of adding both date and time without being aware that it's just
  // two widgets back-to-back
  const showSleepPickerWidgets = () => {
    setShowSleepDatePicker(true);
    setShowSleepTimePicker(true);
  }

  // Date Storage Section
  // Function: storeSleepData
  // Function that essentially saves the inputs of the user into Expo's SecureStore
  // If the record already exists, then we overwrite it there instead. This works near-identically
  // to the mechanism used in AddEpworthData, so all comments from there apply equally as well
  const storeSleepData = async () => {
    // Format the Date and Time of both into one
    const sleepDateTime = moment((moment(sleepDate).format("DD/MM/YY") +
      " " + moment(sleepTime).format("HH:mmA")),
      "DD/MM/YY HH:mmA").toDate();

    // Likewise for Awakening counter-part
    const awakeDateTime = moment((moment(awakeDate).format("DD/MM/YY") +
      " " + moment(awakeTime).format("HH:mmA")),
      "DD/MM/YY HH:mmA").toDate();
    // By this point, they're now tidily converted into two Date objects we can save

    let sleepingRecords = await SecureStore.getItemAsync(uuid);
    sleepingRecords = JSON.parse(sleepingRecords); // Convert it to its array format

    // Check all the objects in the sleeping records [] array
    // See if any have the same day and type
    const matchingDate = _.filter(sleepingRecords, function(element) {
        return (moment(element.date).isSame(date, "day") &&
          element.type == "sleep");
    });

    // The new object we intend to add into this users array records
    const newEntryValue = {
      type: "sleep",
      date: date,
      value: {fallingAsleep: sleepDateTime, awake: awakeDateTime}
    }

    if (matchingDate.length == 0){ // Check if any records matched / the user already had an entry
      // If not, continue here
      // Given that the records are an array, all we do here is push a new obj into them
      sleepingRecords.push(newEntryValue);
      await SecureStore.setItemAsync(uuid, JSON.stringify(sleepingRecords));
      // Notify the user to wait / that it'll be added in
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
    else {
      // Notify the user that they already had an entry - and that we are goingt overwrite it
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

      // There could be duplicate sleep entries in our records, although this shouldn't be possible
      // However, for safety / caution, we can just remove any that exists using Lodash's uniqBy method
      sleepingRecords = _.uniqBy(sleepingRecords, function(record) {
        // This says to identify records by their date+type (and remove any that match the same date+type)
        return (record.date + record.type)
      })

      // We still have the Key-Val pairing with our Secure Store - as in, we have uuid -> sleepRecords
      // Since we want to update this, all we can do is set the Key to point to a new sleep record e.g.
      // it's now uuid -> (updated) sleep record (by overwriting the previous key-val relationship)
      // This is done via map method - iterate through the records, and keep the ones that are unique
      // and overwrite (e.g. use the newEntryValue obj instead of the existing element) for elements that
      // match the current date
      var overwrittenSleepingRecords = _.map(sleepingRecords, function(element) {
        return ((moment(element.date).isSame(date, "day"))
          && element.type == "sleep") ?
            newEntryValue
          :
            element;
      });

      // Save the item into storage (now it goes from uuid -> records to uuid -> (updated, overwritten) records)
      await SecureStore.setItemAsync(uuid, JSON.stringify(overwrittenSleepingRecords));
    }

    // A tiny function that waits until the info messages have been seen for some time
    // before showcasing the positive 'entry added' message
    setTimeout(async () => {
      notifyStorageSuccess();
    }, 3500);
  }

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
        <Text style = {styles.title}>Enter new data</Text>
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
        <Text style={styles.subtitle}>What time did you go to sleep?</Text>
        <Text>
          Don't worry if it's not accurate - try to think of the time you went
          into bed / tried to fully sleep
        </Text>

        <View style = {styles.timeEntry}>
          <Button
            style = {styles.timeButton}
            mode = "contained"
            labelStyle = {{ color: "black", fontSize: 12}}
            onPress = {showSleepPickerWidgets}
          >
          {
            moment(sleepDate).format("DD/MM/YY")
            + " " +
            moment(sleepTime).format("HH:mmA")
          }
          </Button>
          {
            /* Checks whether we should show the widgets or not. If both are true, then we do */
          }
          {(showSleepDatePicker && showSleepTimePicker) && (
            <>
              <DateTimePicker
                value={sleepTime}
                mode={"time"}
                is24Hour={true}
                display="default"
                onChange={updateSleepTime}
              />
              <DateTimePicker
                value={sleepDate}
                mode={"calendar"}
                is24Hour={true}
                display="default"
                onChange={updateSleepDate}
              />
            </>
          )}

          <Ionicons
            size = {30}
            name = "time"
            style = {{ marginTop: 5, marginLeft: 5 }}
            onPress = {showSleepPickerWidgets}
          />

        </View>

        <View style={styles.separator} lightColor="black" darkColor="rgba(255,255,255,0.1)" />
        <Text style={styles.subtitle}>What time did you wake up at?</Text>
        <Text>
          Approximations are fine here! Here, enter your final wake-up time only
          (i.e. the time you woke up fully and did not return back to sleep)
        </Text>

        <View style = {styles.timeEntry}>
          <Button
            style = {styles.timeButton}
            mode = "contained"
            labelStyle = {{ color: "black", fontSize: 12}}
            onPress = {showAwakePickerWidgets}
          >
          {
            moment(awakeDate).format("DD/MM/YY")
            + " " +
            moment(awakeTime).format("HH:mmA")
          }
          </Button>
          {
            /* Checks whether we should show the awake picker widgets or not.
            If both are true, then we do*/
          }
          {(showAwakeDatePicker && showAwakeTimePicker) && (
            <>
              <DateTimePicker
                value={awakeTime}
                mode={"time"}
                is24Hour={true}
                display="default"
                onChange={updateAwakeTime}
              />
              <DateTimePicker
                value={awakeDate}
                mode={"calendar"}
                is24Hour={true}
                display="default"
                onChange={updateAwakeDate}
              />
            </>
          )}

          <Ionicons
            size = {30}
            name = "time"
            style = {{ marginTop: 5, marginLeft: 5 }}
            onPress = {showAwakePickerWidgets}
          />

        </View>
    </View>

    <View style = {styles.bottom}>
      <Button
        style = {styles.submitButton}
        mode = "contained"
        labelStyle = {{ color: "black", fontSize: 12}}
        onPress = {async () => {storeSleepData()}}
      >
        Submit
      </Button>
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
  screenContent: {
    marginTop: "25%",
    width: "85%",
    backgroundColor: "#F7E3D9",
  },
  dateEntry: {
    marginTop: "10%",
    backgroundColor: "#F7E3D9",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  timeEntry: {
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    backgroundColor: "#F7E3D9",
  },
  title: {
    fontSize: 35,
    alignSelf: "center",
    fontWeight: 'bold',
  },
  subtitle: {
    textDecorationLine: "underline",
    marginBottom: 15,
  },
  separator: {
    marginVertical: "3%",
    height: 3,
    width: '100%',
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
  timeButton: {
    marginTop: 15,
    marginBottom: 10,
    width: "90%",
    backgroundColor: "white",
    borderColor: "black",
    borderWidth: 1,
    alignSelf: "center",
    marginLeft: 10,
  },
  bottom: {
    flex: 1,
    justifyContent: "flex-end",
    marginBottom: 75,
    width: "100%",
    backgroundColor: "#F7E3D9",
  },
  submitButton: {
    alignSelf: "center",
    backgroundColor: "#F9C7E4",
    borderColor: "black",
    borderWidth: 1,
    width: "80%",
  },
  dateTimePicker: {
    position: 'absolute',
    width: "100%",
    bottom: '-5%',
    zIndex: 100,
  }

});


export default AddSleepData;
