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

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShow(Platform.OS === 'ios');
    setDate(currentDate);
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

  return (
    <View style={styles.container}>
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

      <View style = {styles.screenContent}>
        <View style={styles.separator} lightColor="black" darkColor="rgba(255,255,255,0.1)" />
        <Text style={styles.subtitle}>What time did you go to sleep?</Text>
        <Text>Don't worry if it's not accurate - try to think of the time you went
          into bed / tried to fully sleep</Text>

        <View style={styles.separator} lightColor="black" darkColor="rgba(255,255,255,0.1)" />
        <Text style={styles.subtitle}>What time did you wake up at?</Text>
        <Text>Approximations are fine here! Here, enter your final wake-up time only
          (i.e. the time you woke up fully and did not return back to sleep)</Text>
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
    marginTop: 1,
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
    height: 3,
    width: '75%',
  },
  button: {
    marginTop: 15,
    marginBottom: 10,
    width: "25%",
    backgroundColor: "white",
    borderColor: "black",
    borderWidth: 1,
    alignSelf: "center",
    marginLeft: 10,
  }
});


export default AddSleepData;
