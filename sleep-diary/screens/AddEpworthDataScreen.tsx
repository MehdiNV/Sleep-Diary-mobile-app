import React, {useState} from 'react';
import { StyleSheet, Text, ScrollView } from 'react-native';
import { Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

import { View } from '../components/Themed';
import moment from "moment";

const AddEpworthData = () => {
  // Section for showing 'Date for' calendar entry
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
        <Text>How likely are you to doze off or fall asleep in
          the situations described below, in contrast to feeling tired?
          This refers to your usual way of life in recent times</Text>

          <Text>Even if you haven't done some of these things recently
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

            <View style = {styles.row}>
              <Text style = {styles.rowSituation}>Sitting and reading</Text>
              <Text>Input</Text>
            </View>
            <View style = {styles.row}>
              <Text style = {styles.rowSituation}>Watching TV</Text>
              <Text>Input</Text>
            </View>
            <View style = {styles.row}>
              <Text style = {styles.rowSituation}>Sitting, inactive in a public place (e.g. theatre or a meeting)</Text>
              <Text>Input</Text>
            </View>
            <View style = {styles.row}>
              <Text style = {styles.rowSituation}>As a passenger in a car for an hour without an break</Text>
              <Text>Input</Text>
            </View>
            <View style = {styles.row}>
              <Text style = {styles.rowSituation}>Lying down to rest in the afternoon when circumstances permit</Text>
              <Text>Input</Text>
            </View>
            <View style = {styles.row}>
              <Text style = {styles.rowSituation}>Sitting and talking to someone</Text>
              <Text>Input</Text>
            </View>
            <View style = {styles.row}>
              <Text style = {styles.rowSituation}>Sitting quietly after a lunch without alcohol</Text>
              <Text>Input</Text>
            </View>
            <View style = {styles.row}>
              <Text style = {styles.rowSituation}>In a car, while stopped for a few minutes in the traffic</Text>
              <Text>Input</Text>
            </View>

          </View>

          { /*
          <View style = { styles.epworthRow}>
            <View style = {styles.questionsSection}>
              <Text></Text>
              <Text></Text>
              <Text></Text>
              <Text></Text>
              <Text></Text>
              <Text></Text>
              <Text></Text>
              <Text></Text>
            </View>

            <View style = {styles.scoring}>
              <Text>Situation Dozing</Text>
              <Text>Situation Dozing</Text>
              <Text>Situation Dozing</Text>
              <Text>Situation Dozing</Text>
              <Text>Situation Dozing</Text>
              <Text>Situation Dozing</Text>
              <Text>Situation Dozing</Text>
              <Text>Situation Dozing</Text>
            </View>
          </View>
          */}
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
    marginTop: 15,
  },
  row: {
    backgroundColor: "#F7E3D9",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  rowHeader: {
    fontWeight: "bold",
  },
  rowSituation: {
    width: "80%",
  },
});


export default AddEpworthData;
