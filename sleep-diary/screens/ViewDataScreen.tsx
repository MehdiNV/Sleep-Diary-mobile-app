import React, {useState} from 'react';
import { StyleSheet, Text } from 'react-native';
import { Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { View } from '../components/Themed';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from "moment";


const ViewData = () => {
  // State used for holding the 'Start Date' entry
  const [startDate, setStartDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);

  // State used for holding the 'End date' entry
  const [endDate, setEndDate] = useState(new Date());
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  // Methods used for changing the states
  // For Start Date - the onChange and Show methods
  const onStartDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || startDate;
    setShowStartDatePicker(Platform.OS === 'ios');
    setStartDate(currentDate);
  };

  const showStartPicker = () => {
    setShowStartDatePicker(true);
  }
  // Likewise for the End Date
  const onEndDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || endDate;
    setShowEndDatePicker(Platform.OS === 'ios');
    setEndDate(currentDate);
  };

  const showEndPicker = () => {
    setShowEndDatePicker(true);
  }

  console.log(new Date())
  console.log (endDate)
  return (
    <View style={styles.container}>
      <View style = {styles.screenContent}>
        <Text style={styles.title}>View your progress</Text>

        <Text style = {styles.subtitle}>Show me data between:</Text>
        <View style = {styles.dateEntry}>
          <Button
            style = {styles.button}
            mode = "contained"
            labelStyle = {{ color: "black", fontSize: 12}}
            onPress = {showStartPicker}
          >
          {moment(startDate).format("DD/MM/YY")}
          </Button>
          <Ionicons
            size = {30}
            name = "calendar"
            style = {{ marginTop: 5, marginLeft: 5, marginRight: 10 }}
            onPress = {showStartPicker}
          />

          <Text>to</Text>

          <Button
            style = {styles.button}
            mode = "contained"
            labelStyle = {{ color: "black", fontSize: 12}}
            onPress = {showEndPicker}
          >
          {
            moment(endDate).isSame(new Date(), "day") ?
              "Present"
            :
              moment(endDate).format("DD/MM/YY")
          }
          </Button>
          {/*The above checks if the end date is the current date - if so ...
            ...then we change the text to display 'Present' instead.
            The second parameter, "day", tells moment.js to check if the two dates...
            ...have the same day, month and year (not necessarily time though).
            */}
          <Ionicons
            size = {30}
            name = "calendar"
            style = {{ marginTop: 5, marginLeft: 5 }}
            onPress = {showEndPicker}
          />

          {showStartDatePicker && (
            <DateTimePicker
              value={startDate}
              mode={"calendar"}
              is24Hour={true}
              display="default"
              onChange={onStartDateChange}
            />
          )}

          {showEndDatePicker && (
            <DateTimePicker
              value={endDate}
              mode={"calendar"}
              is24Hour={true}
              display="default"
              onChange={onEndDateChange}
            />
          )}
        </View>
        <View style={styles.separator} lightColor="black" darkColor="rgba(255,255,255,0.1)" />

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
    alignSelf: "center",
    fontWeight: 'bold',
  },
  subtitle: {
    marginTop: "5%",
    textAlign: "center",
  },
  screenContent: {
    marginTop: "25%",
    width: "85%",
    backgroundColor: "#F7E3D9",
  },
  separator: {
    marginVertical: "3%",
    height: 2,
    width: '100%',
  },
  dateEntry: {
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
});


export default ViewData;
