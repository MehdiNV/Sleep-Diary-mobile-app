import React, {useState, useEffect} from 'react';
import { StyleSheet, Text, ScrollView } from 'react-native';
import { Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { View } from '../components/Themed';
import DateTimePicker from '@react-native-community/datetimepicker';
import Toast from 'react-native-toast-message';
import { useSelector } from 'react-redux';
import * as SecureStore from 'expo-secure-store';
import moment from "moment";


const ViewData = () => {
  // The UUID of the logged-in user
  const uuid = useSelector(state => state.uuid);

  // State used for holding the 'Start Date' entry
  const [startDate, setStartDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);

  // State used for holding the 'End date' entry
  const [endDate, setEndDate] = useState(new Date());
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  // Methods used for changing the states
  // For Start Date - the onChange and Show methods
  const onStartDateChange = async (event, selectedDate) => {
      setShowStartDatePicker(Platform.OS === 'ios');
      if (moment(selectedDate).isAfter(endDate, "day")){
        Toast.show({
          type: 'error',
          position: 'bottom',
          text1: 'Start date cannot be past the end date',
          text2: 'Please enter a different date',
          visibilityTime: 4000,
          autoHide: true,
          topOffset: 30,
          bottomOffset: 40,
        });
      }
      else {
        const currentDate = selectedDate || startDate;
        setStartDate(currentDate);
        await calculateSleepingRecords();
      }

  };

  const showStartPicker = () => {
    setShowStartDatePicker(true);
  }
  // Likewise for the End Date
  const onEndDateChange = async (event, selectedDate) => {
    setShowEndDatePicker(Platform.OS === 'ios');
    if (moment(selectedDate).isAfter(new Date(), "day")){
      Toast.show({
        type: 'error',
        position: 'bottom',
        text1: 'End Date cannot be into the future!',
        text2: 'Try either the pesent date, or any day before it',
        visibilityTime: 4000,
        autoHide: true,
        topOffset: 30,
        bottomOffset: 40,
      });
    }
    else{
      const currentDate = selectedDate || endDate;
      setEndDate(currentDate);
      await calculateSleepingRecords();
    }
  };

  const showEndPicker = () => {
    setShowEndDatePicker(true);
  }

  // Calculate data needed for the date ranges specified
  const calculateSleepingRecords = async () => {
    console.log(":3c")
  }

  useEffect(() => {
    async function loadInitialData(){
      calculateSleepingRecords();
    }
    loadInitialData();
  }, [])

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

      <ScrollView style = {styles.dataScrollView}>
        <Text style = {styles.subheader}>Stats</Text>
        <View style = {styles.dataRow}>
          <Text style = {styles.rowSituation}>Average sleep duration:</Text>
          <Text>TODO</Text>
        </View>
        <View style = {styles.dataRow}>
          <Text style = {styles.rowSituation}>Average falling asleep time:</Text>
          <Text>TODO</Text>
        </View>
        <View style = {styles.dataRow}>
          <Text style = {styles.rowSituation}>Average wake-up time:</Text>
          <Text>TODO</Text>
        </View>

        <View style={styles.separator} lightColor="black" darkColor="rgba(255,255,255,0.1)" />
        <Text style = {styles.subheader}>Sleep durations</Text>
        <Text>TODO Sleep Graph</Text>
        <View style={styles.separator} lightColor="black" darkColor="rgba(255,255,255,0.1)" />
        <Text style = {styles.subheader}>Epworth Score</Text>
        <Text>TODO - Epworth graph</Text>
        <View style={styles.separator} lightColor="black" darkColor="rgba(255,255,255,0.1)" />
        <Text style = {styles.subheader}>Note</Text>
        <Text>Keep up the good work! The more data you have,
          the easier it will be for you to optimise your
          sleeping schedule and / or detect hidden problems
          with your sleep</Text>
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
  dataScrollView: {
    marginTop: 5,
    width: "85%",
  },
  subheader: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 15,
    textDecorationLine: "underline",
    marginBottom: 8,
  },
  dataRow: {
    backgroundColor: "#F7E3D9",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5  ,
  },
  rowSituation: {
    width: "80%",
    textAlignVertical: "center",
  },
});


export default ViewData;
