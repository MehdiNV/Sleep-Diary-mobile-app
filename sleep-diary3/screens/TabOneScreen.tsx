import * as React from 'react';
import { StyleSheet, Image, Button} from 'react-native';

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
        title = "LOGINBABY"
        onPress = {() => {
          navigation.navigate("TabTwo")
        }}
      />

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
  }
});

export default TabOneScreen;
