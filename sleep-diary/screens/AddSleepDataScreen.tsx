import React, {useState} from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text } from 'react-native';
import { Button } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';

import { View } from '../components/Themed';
import moment from "moment";

const AddSleepData = () => {
  const [date, setDate] = useState(new Date());
  const [mode, setMode] = useState('date');
  const [show, setShow] = useState(false);

  const [awakeDate, setAwakeDate] = useState(new Date());
  const [showAwakePicker, setShowAwakePicker] = useState(false);


  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShow(Platform.OS === 'ios');
    setDate(currentDate);
  };

  const setAwakeTime = (event, selectedTime) => {
    const currentDate = selectedTime || awakeDate;
    setShowAwakePicker(Platform.OS === 'ios');
    setAwakeDate(currentDate);
  }

  const showAwakeTimePicker = () => {
    setShowAwakePicker(true);
  }

  // -----
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


  return (
    <View style={styles.container}>
      <View style = {styles.screenContent}>
        <Text style = {styles.title}>Enter new date</Text>

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
        <Text>Don't worry if it's not accurate - try to think of the time you went
          into bed / tried to fully sleep</Text>

        <View style = {styles.timeEntry}>
          <Button
            style = {styles.timeButton}
            mode = "contained"
            labelStyle = {{ color: "black", fontSize: 12}}
            onPress = {showTimepicker}
          >
          {moment(date).format("HH:mmA")}
          </Button>

          <Ionicons
            size = {30}
            name = "time"
            style = {{ marginTop: 5, marginLeft: 5 }}
            onPress = {showTimepicker}
          />

        </View>

        <View style={styles.separator} lightColor="black" darkColor="rgba(255,255,255,0.1)" />
        <Text style={styles.subtitle}>What time did you wake up at?</Text>
        <Text>Approximations are fine here! Here, enter your final wake-up time only
          (i.e. the time you woke up fully and did not return back to sleep)</Text>

          <View style = {styles.timeEntry}>
            <Button
              style = {styles.timeButton}
              mode = "contained"
              labelStyle = {{ color: "black", fontSize: 12}}
              onPress = {showAwakeTimePicker}
            >
            {moment(awakeDate).format("HH:mmA")}
            </Button>

            {showAwakePicker && (
              <DateTimePicker
                value={awakeDate}
                mode={"time"}
                is24Hour={true}
                display="default"
                onChange={setAwakeTime}
              />
            )}

            <Ionicons
              size = {30}
              name = "time"
              style = {{ marginTop: 5, marginLeft: 5 }}
              onPress = {showAwakeTimePicker}
            />

          </View>


      </View>
      <View style = {styles.bottom}>
      <Button
        style = {styles.submitButton}
        mode = "contained"
        labelStyle = {{ color: "black", fontSize: 12}}
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

});


export default AddSleepData;
