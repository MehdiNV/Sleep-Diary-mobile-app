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
import _ from 'lodash';


const ViewData = () => {
  // The UUID of the logged-in user
  const uuid = useSelector(state => state.uuid);

  // State used for holding the 'Start Date' entry
  const [startDate, setStartDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);

  // State used for holding the 'End date' entry
  const [endDate, setEndDate] = useState(new Date());
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  // State holding sleep averages and related statistics
  const [avgSleepData, setAvgSleepData] = useState({
    avgDuration: "Insufficient data",
    avgAsleepTime: "Insufficient data",
    avgWakeTime: "Insufficient data",
  });

  useEffect(() => {
    async function loadInitialData(){
      await calculateSleepingRecords();
    }
    loadInitialData();
  }, [startDate, endDate])

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
        const currStartDate = selectedDate || startDate;
        setStartDate(currStartDate);
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
      const currEndDate = selectedDate || endDate;
      setEndDate(currEndDate);
    }
  };

  const showEndPicker = () => {
    setShowEndDatePicker(true);
  }

  // Calculate data needed for the date ranges specified
  const calculateSleepingRecords = async () => {
    // Fetch all the sleeping records that are linked to this account
    let sleepingRecords = await SecureStore.getItemAsync(uuid);
    sleepingRecords = JSON.parse(sleepingRecords);

    // Filter the records to only the ones that are within range
    const entriesWithinRange = _.filter(sleepingRecords, function(element) {
      return (
        moment(element.date).isSameOrAfter(startDate, "day") &&
        moment(element.date).isSameOrBefore(endDate, "day")
      )
    });

    // Filter the entries by their type
    const sleepEntries = _.filter(entriesWithinRange, function(element) {
      return (
        element.type == "sleep"
      )
    });

    const epworthEntries = _.filter(entriesWithinRange, function(element) {
      return (
        element.type == "epworth"
      )
    });

    console.log("Output of Logs")
    console.log("Timing values")
    console.log(startDate)
    console.log(endDate)
    console.log("Data Structures")
    console.log(entriesWithinRange)
    console.log(sleepEntries)
    console.log(epworthEntries)
    console.log("----------------")

    if (sleepEntries.length == 0){ // No data to use, so set the below
      setAvgSleepData({
        avgDuration: "Insufficient data",
        avgAsleepTime: "Insufficient data",
        avgWakeTime: "Insufficient data",
      })
    }
    else { // We have some data we can use for averages!
      // Iterate through all the entries now
      // So at this point, we have an array like: [{}, ...., {}, {}] etc
      // Each object inside this array is a record we can use

      // Calculate the Average Sleep Length
      let totalSleepingHours = _.sumBy(sleepEntries, function(record) {
        const sleepDate = record.value.fallingAsleep
        const awakeDate = record.value.awake
        return moment(awakeDate).diff(moment(sleepDate), "hours", true);
      });
      // Now, we wrap the resulting number (e.g. 9.75) into a duration object
      const durationTime = moment.duration(totalSleepingHours, "hours")
      // Afterwards, we then format it into a X hours (and y minutes if minutes > 0)
      const averageSleepLength = durationTime.hours() + " hours" + (
        durationTime.minutes() != 0 ? (" and " + durationTime.minutes() + " minutes")
          : "")

      // Calculate the Average Falling Asleep Time
      // Method here is particularly strange, but I believe the best way to accomplish
      // this form of calculation. We take the 1st record available, and compare all other
      // records to it (e.g. lets say the 1st is 8pm. We'll ask - what's the offset values
      // of all other sleeping times to 8pm? Get that difference, get the mean, and
      // add it onto 8 / subtract from it to get the actual average sleeping time)
      const firstRecord = sleepEntries[0]
      const firstRecordSleepTime = firstRecord.value.fallingAsleep

      let totalOffset = _.sumBy(sleepEntries, function(record) {
        if (firstRecord.date == record.date) {
          return
        }

        const currSleepDate = record.value.fallingAsleep
        const currSleepHour = moment(currSleepDate).hour()
        const currSleepMinute = moment(currSleepDate).minute()
        const sleepString = "01-01-2000 " + currSleepHour + ":" + currSleepMinute

        const firstRecordHour = moment(firstRecordSleepTime).hour()
        const firstRecordMinute = moment(firstRecordSleepTime).minute()
        const firstRecordString = "01-01-2000 " + firstRecordHour + ":" + firstRecordMinute

        return moment(sleepString, "DD-MM-YYYY HH:mm").diff
          (moment(firstRecordString, "DD-MM-YYYY HH:mm"), "hours", true);
      });
      // Calculate the mean offset
      totalOffset = totalOffset / sleepEntries.length
      // Add that offset to the first entry - that should now be our avg sleep time
      // The offset could be +ve or -ve - so the firstRecord time could go forward or backward
      const avgSleepingTime = moment(firstRecordSleepTime).add(totalOffset, "hours")
    }
  }

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
          <Text style = {styles.dataHeader}>Average sleep duration:</Text>
          <Text>{avgSleepData.avgDuration}</Text>
        </View>
        <View style = {styles.dataRow}>
          <Text style = {styles.dataHeader}>Average falling asleep time:</Text>
          <Text>{avgSleepData.avgAsleepTime}</Text>
        </View>
        <View style = {styles.dataRow}>
          <Text style = {styles.dataHeader}>Average wake-up time:</Text>
          <Text>{avgSleepData.avgWakeTime}</Text>
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
    paddingVertical: 5,
  },
  dataHeader: {
    width: "65%",
    textAlignVertical: "center",
  },
});


export default ViewData;
