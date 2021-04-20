import React, {useState, useEffect, useCallback} from 'react';
import { useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';

import { StyleSheet, Text, ScrollView, Dimensions } from 'react-native';
import { Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { View } from '../components/Themed';
import DateTimePicker from '@react-native-community/datetimepicker';
import Toast from 'react-native-toast-message';
import * as SecureStore from 'expo-secure-store';
import {
  LineChart,
  BarChart,
  PieChart,
  ProgressChart,
  ContributionGraph,
  StackedBarChart
} from "react-native-chart-kit";
import moment from "moment";
import _ from 'lodash';

const ViewData = () => {
  // The UUID of the logged-in user
  // useSelector hook just fetches the global state, and gives us the uuid from it
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

  // State variables holding a) the data used for the sleep chart and
  // b) whether to show that sleep chart
  const [sleepChartData, setSleepChartData] = useState({})
  const [showSleepChart, setShowSleepChart] = useState(false);

  // The same as the above, but for the Epworth variant
  const [epworthChartData, setEpworthChartData] = useState({});
  const [showEpworthChart, setShowEpworthChart] = useState(false);

  // Hook that runs initially when the screen is rendered (e.g. navigated to for its very
  // first time), as well as subsequently anytime the startDate or EndDate is altered
  // For example, if the user changes the date range, useEffect will run again (to run
  // new calculations)
  useEffect(() => {
    async function loadInitialData(){
      await calculateSleepingRecords();
    }
    // Call to load the initial data for this screen (e.g. calculate the sleeping records
    // and check if we have to display anything like a chart).
    loadInitialData();
  }, [startDate, endDate])

  useFocusEffect(
    useCallback(() => {
      async function loadInitialData(){
        await calculateSleepingRecords();
      }
      loadInitialData();
    }, [])
  );

  useEffect(() => {
    // Triggers if the uuid in Redux store changes - ensures the uuid held above is accurate as a result
    // Resets everything in this screen
    setStartDate(new Date());
    setShowStartDatePicker(false);
    setEndDate(new Date());
    setShowEndDatePicker(false);

    setAvgSleepData({
      avgDuration: "Insufficient data",
      avgAsleepTime: "Insufficient data",
      avgWakeTime: "Insufficient data",
    })

    // Charts
    setSleepChartData({});
    setShowSleepChart(false);
    setEpworthChartData({});
    setShowEpworthChart(false);
  },[uuid]);

  // Methods used for changing the states
  // For Start Date - the onChange and Show methods
  const onStartDateChange = async (event, selectedDate) => {
      setShowStartDatePicker(Platform.OS === 'ios');
      // Checks if the selected date is past the end date (e.g. weird range that overlap)
      if (moment(selectedDate).isAfter(endDate, "day")){
        // If so, then we just display a warning to the user
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
        // Otherwise, we set the startDate variable to be the input the user selected
        const currStartDate = selectedDate || startDate;
        setStartDate(currStartDate);
      }

  };
  // showStartPicker: When called, shows the widget to allow a user to pick a start date
  const showStartPicker = () => {
    setShowStartDatePicker(true);
  }
  // Likewise like the startDateChange method, but for the End Date
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
  // Like the showStartPicker, but for the endDate instead
  const showEndPicker = () => {
    setShowEndDatePicker(true);
  }

  // Calculate data needed for the date ranges specified
  const calculateSleepingRecords = async () => {
    // Fetch all the sleeping records that are linked to this account
    let sleepingRecords = await SecureStore.getItemAsync(uuid);
    sleepingRecords = JSON.parse(sleepingRecords);

    // Filter the records to only the ones that are within range the user specified
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
    // Like the above, but filters by the type = "epworth" instead
    const epworthEntries = _.filter(entriesWithinRange, function(element) {
      return (
        element.type == "epworth"
      )
    });

    if (sleepEntries.length == 0){ // No data to use, so set the below
      setAvgSleepData({
        avgDuration: "Insufficient data",
        avgAsleepTime: "Insufficient data",
        avgWakeTime: "Insufficient data",
      })
    }
    else { // Else, we have some data we can use for averages!
      // Iterate through all the entries now
      // So at this point, we have an array like: [{}, ...., {}, {}] etc
      // Each object inside this array is a record we can use

      // Calculate the Average Sleep Length
      let totalSleepingHours = _.sumBy(sleepEntries, function(record) {
        const sleepDate = record.value.fallingAsleep
        const awakeDate = record.value.awake
        return moment(awakeDate).diff(moment(sleepDate), "hours", true);
      });
      // Divide it by the number of nights to get the average length of sleep
      totalSleepingHours = totalSleepingHours / sleepEntries.length
      // Now, we wrap the resulting number (e.g. 9.75) into a duration object
      const durationTime = moment.duration(totalSleepingHours, "hours")
      // Afterwards, we then format it into a X hours (and y minutes if minutes > 0)
      const averageSleepLength = durationTime.hours() + " hrs" + (
        durationTime.minutes() != 0 ? (" and " + durationTime.minutes() + " mins")
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

        // Format both the current records sleeping value, and the first value to be the same date
        // The reason they have to be the same date is so that it makes the .diff calculations easier
        // If they are different dates, the number of hours between them will include days (which
        // skews the final output). Hence, I reset them to be 1st Jan, 2000 but keep the hour and
        // minute (so that now, we can use the avg angle calculation method correctly here - as it
        // only applies to the hours on the clock face / 360 degree instead of incl. days)
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

      // Calculate the average wake-up time
      // We'll just do the same approach as the above, but using wake-up times instead
      const firstRecordWakeValue = firstRecord.value.awake
      // Overwrite the totalOffset - but for our avg wake up values instead
      totalOffset = _.sumBy(sleepEntries, function(record) {
        if (firstRecord.date == record.date) {
          return
        }

        // Format both the current records sleeping value, and the first value to be the same date
        // The reason they have to be the same date is so that it makes the .diff calculations easier
        // If they are different dates, the number of hours between them will include days (which
        // skews the final output). Hence, I reset them to be 1st Jan, 2000 but keep the hour and
        // minute (so that now, we can use the avg angle calculation method correctly here - as it
        // only applies to the hours on the clock face / 360 degree instead of incl. days)
        const currAwakeDate = record.value.awake
        const currAwakeHour = moment(currAwakeDate).hour()
        const currAwakeMinute = moment(currAwakeDate).minute()
        const awakeString = "01-01-2000 " + currAwakeHour + ":" + currAwakeMinute

        const firstRecordHour = moment(firstRecordWakeValue).hour()
        const firstRecordMinute = moment(firstRecordWakeValue).minute()
        const firstRecordString = "01-01-2000 " + firstRecordHour + ":" + firstRecordMinute

        return moment(awakeString, "DD-MM-YYYY HH:mm").diff
          (moment(firstRecordString, "DD-MM-YYYY HH:mm"), "hours", true);
      });
      // Calculate the mean offset
      totalOffset = totalOffset / sleepEntries.length
      // Add that offset to the first entry - that should now be our avg sleep time
      // The offset could be +ve or -ve - so the firstRecord time could go forward or backward
      const avgWakeTime = moment(firstRecordWakeValue).add(totalOffset, "hours")

      // Update the state var used for the statistics with the new values
      setAvgSleepData({
        avgDuration: averageSleepLength,
        avgAsleepTime: moment(avgSleepingTime).format("HH:mmA"),
        avgWakeTime: moment(avgWakeTime).format("HH:mmA"),
      })
    }
    // Finally, now that we have the data for sleep entries and epworth, pass it to
    // the chart function to see if it's something we can display or not
    // This data is already cleaned by being filtered by their types and checked if
    // they're within the specified date range - all that's needed is to format it for charts
    calculateChartData(sleepEntries, epworthEntries);
  }

  const calculateChartData = (sleepEntries, epworthEntries) => {
    // Sort the two arrays by their date
    // This is necessary since the charts will need to be chronological from left to right
    sleepEntries = _.sortBy(sleepEntries, [function(record) {return record.date}]);
    epworthEntries = _.sortBy(epworthEntries, [function(record) {return record.date}]);

    // Now, we first perform calculations to ensure we can show the sleep chart data corerctly
    if (sleepEntries.length == 0) { // If we have no sleep entries, then do not show the chart!
      setShowSleepChart(false);
      setSleepChartData({});
    }
    else {
      // Otherwise, we have enough data to display something, so do the below

      // Get an array of all the sleep lengths in the records we have
      // So this may look like: [8, 9, 10, 11, 6, 7] each number being the
      // length of hours the user had
      const sleepingLengths = _.map(sleepEntries, function(record) {
          const sleepDate = record.value.fallingAsleep
          const awakeDate = record.value.awake
          return moment(awakeDate).diff(moment(sleepDate), "hours", true);
      })

      // Go through the entries, and fetch the dates. When fetching, format them so they're
      // in a more display-able state e.g. 13/04 becomes 13th, 14/04 becomes 14th etc
      const sleepDates = _.map(sleepEntries, function(record) {
          return moment(record.date).format("Do");
      })

      // Give the chart data using what we scraped (e.g. dates, length of slepe, etc)
      setSleepChartData({
        labels: sleepDates,
        datasets: [
          {
            data: sleepingLengths
          }
        ]
      })
      // Finally, display the chart since we have enough data (at least 1) to show something
      setShowSleepChart(true);

    }

    // Perform calculations likewise for the Epworth chart, like it was done above for Sleep
    if (epworthEntries.length == 0) {
      // No epworth scores are present, so no worth in displaying its chart
      setShowEpworthChart(false);
      setEpworthChartData({});
    }
    else {
      const epworthScores = _.map(epworthEntries, function(record) {
          const epworthScore = record.value
          return epworthScore;
      })

      const epworthDates = _.map(epworthEntries, function(record) {
          return moment(record.date).format("Do");
      })

      setEpworthChartData({
        labels: epworthDates,
        datasets: [
          {
            data: epworthScores
          }
        ]
      })

      setShowEpworthChart(true);
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
        <View style = {{ backgroundColor: "#F7E3D9"}}>
          {showSleepChart ?
            <LineChart
              data={sleepChartData}
              yAxisSuffix=" hrs"
              width={380} // from react-native
              height={210}
              fromZero
              segments = {7}
              yAxisInterval={1} // optional, defaults to 1
              chartConfig={{
                backgroundColor: "#e26a00",
                backgroundGradientFrom: "#F7E3D9",
                backgroundGradientTo: "#F7E3D9",
                decimalPlaces: 0, // optional, defaults to 2dp
                color: (opacity = 0.1) => `rgba(0, 0, 0, ${opacity})`,
                labelColor: (opacity = 0.1) => `rgba(0, 0, 0, ${opacity})`,
                propsForDots: {
                  r: "2",
                  strokeWidth: "2",
                  stroke: "black"
                }
              }}
              style={{
                paddingVertical: 2,
                backgroundColor: "#F7E3D9",
                borderRadius: 4,
                alignSelf: "center",
              }}
            />
          :
          <Text
            style = {{ alignSelf: "center", backgroundColor: "#F7E3D9"}}
          >Insufficient data for Sleep chart</Text>
          }
        </View>
        <View style={styles.separator} lightColor="black" darkColor="rgba(255,255,255,0.1)" />
        <Text style = {styles.subheader}>Epworth Score</Text>
        <View style = {{ backgroundColor: "#F7E3D9" }}>
          {showEpworthChart ?
            <LineChart
              data={epworthChartData}
              width={380} // from react-native
              height={210}
              fromZero
              segments = {7}
              yAxisInterval={1} // optional, defaults to 1
              chartConfig={{
                backgroundColor: "#e26a00",
                backgroundGradientFrom: "#F7E3D9",
                backgroundGradientTo: "#F7E3D9",
                decimalPlaces: 0, // optional, defaults to 2dp
                color: (opacity = 0.1) => `rgba(0, 0, 0, ${opacity})`,
                labelColor: (opacity = 0.1) => `rgba(0, 0, 0, ${opacity})`,
                propsForDots: {
                  r: "2",
                  strokeWidth: "2",
                  stroke: "black"
                }
              }}
              style={{
                paddingVertical: 2,
                backgroundColor: "#F7E3D9",
                borderRadius: 4,
                alignSelf: "center",
              }}
            />
            :
            <Text
              style = {{ alignSelf: "center", backgroundColor: "#F7E3D9"}}
            >Insufficient data for Epworth chart</Text>
          }
        </View>
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
    marginVertical: 10,
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
