import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import useCachedResources from './hooks/useCachedResources';
import useColorScheme from './hooks/useColorScheme';
import Navigation from './navigation';
import Toast from 'react-native-toast-message';
// Imports for React Redux
import { createStore } from 'redux';
import { Provider } from 'react-redux'

const App = () => {
  const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();

  // Reducer for the Redux Store
  // Before a new action (change) is made to the store, we examine its type and
  // its payload before deciding how to apply it (e.g. add the payload to the state)
  const myReducer = (state, action) => {
    if (action.type === "setUUID"){ // Set a new UUID - return a state with this uuid
      return {uuid: action.payload, loginVisibility: state.loginVisibility};
    }
    else if (action.type === "changeLoginVisibility"){
      return {
        uuid: state.uuid, loginVisibility: action.payload
      }
    }
    else { // Return the state as it is
      return state;
    }
  }

  const store = createStore(myReducer,
    {uuid: "N/A", loginVisibility: true});

  if (!isLoadingComplete) {
    return null;
  } else {
    return (
      <Provider store = {store}>
        <SafeAreaProvider>
          <Navigation colorScheme={colorScheme} />
          <StatusBar />
          <Toast ref={(ref) => Toast.setRef(ref)} />
        </SafeAreaProvider>
      </Provider>
    );
  }
}

export default App;
