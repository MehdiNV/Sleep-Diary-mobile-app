import * as React from 'react';
import { StyleSheet, Image} from 'react-native';
import { Button } from 'react-native-paper';

import EditScreenInfo from '../components/EditScreenInfo';
import { Text, View } from '../components/Themed';

const TabOneScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sleep Analyser</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />

      <Image
        style = {styles.imageProportions}
        source={require("../assets/images/sleepAnalysis.png")}
        resizeMode = "contain"
      />

      <Button
        style = {styles.button}
        labelStyle = {{ color: "black" }}
        mode = "contained"
        onPress = {() => navigation.navigate("TabTwo")}
      >
        Login
      </Button>

      <Button
        style = {styles.button}
        labelStyle = {{ color: "black" }}
        mode = "contained"
      >
        Sign Up
      </Button>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 35,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: "3%",
    height: 1,
    width: '75%',
  },
  imageProportions: {
    height: "45%",
    width: "85%",
  },
  button: {
    marginVertical: 5,
    width: 135,
    backgroundColor: "#F9C7E4",
  }
});

export default TabOneScreen;
