import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import React, {useState} from 'react';

import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';
import Landing from '../screens/LandingScreen';
import Home from '../screens/HomeScreen';
import AddSleepData from '../screens/AddSleepDataScreen';
import AddEpworthData from '../screens/AddEpworthDataScreen';
import ViewData from '../screens/ViewDataScreen';
import Settings from '../screens/SettingsScreen';
import { useSelector, useDispatch } from 'react-redux';

import { BottomTabParamList, TabOneParamList, TabTwoParamList } from '../types';

const BottomTab = createBottomTabNavigator<BottomTabParamList>();

export default function BottomTabNavigator() {
  const colorScheme = useColorScheme();
  const showLoginScreen = useSelector(state => state.loginVisibility)
  const dispatch = useDispatch();

  return (
    <BottomTab.Navigator
      initialRouteName="Landing"
      tabBarOptions={{
        activeTintColor: Colors[colorScheme].tint,
        showLabel: false,
        style: {
          backgroundColor: "#F7E3D9",
          borderTopWidth: 0,
          elevation: 0, // Removes shadow visuals from the border of the tab bar
        }
      }}>

      {showLoginScreen ?
      <BottomTab.Screen
        name="Landing"
        component={LandingNavigator}
        options={{
          tabBarVisible: false,
        }}
      />
      : null
      }
      <BottomTab.Screen
        name="Home"
        component={HomeNavigator}
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />
        }}
        listeners={({ navigation }) => ({
          focus: () => {
            dispatch({type: "changeLoginVisibility", payload: false})
          },
        })}
      />
      <BottomTab.Screen
        name="AddEpworthData"
        component={AddEpworthDataNavigator}
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="medkit" color={color} />
        }}
        listeners={({ navigation }) => ({
          focus: () => {
            dispatch({type: "changeLoginVisibility", payload: false})
          },
        })}
      />
      <BottomTab.Screen
        name="AddSleepData"
        component={AddSleepDataNavigator}
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="add" color={color} />
        }}
        listeners={({ navigation }) => ({
          focus: () => {
            dispatch({type: "changeLoginVisibility", payload: false})
          },
        })}
      />
      <BottomTab.Screen
        name="ViewData"
        component={ViewDataNavigator}
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="bar-chart" color={color} />
        }}
        listeners={({ navigation }) => ({
          focus: () => {
            dispatch({type: "changeLoginVisibility", payload: false})
          },
        })}
      />
      <BottomTab.Screen
        name="Settings"
        component={SettingsNavigator}
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="settings" color={color} />
        }}
        listeners={({ navigation }) => ({
          focus: () => {
            dispatch({type: "changeLoginVisibility", payload: false})
          },
        })}
      />
    </BottomTab.Navigator>
  );
}

// You can explore the built-in icon families and icons on the web at:
// https://icons.expo.fyi/
function TabBarIcon(props: { name: React.ComponentProps<typeof Ionicons>['name']; color: string }) {
  return <Ionicons size={30} style={{ marginBottom: -3 }} {...props} />;
}

// Each tab has its own navigation stack, you can read more about this pattern here:
// https://reactnavigation.org/docs/tab-based-navigation#a-stack-navigator-for-each-tab
const LandingStack = createStackNavigator<TabOneParamList>();

function LandingNavigator() {
  return (
    <LandingStack.Navigator>
      <LandingStack.Screen
        name="Landing"
        component={Landing}
        options={{
          headerShown: false,
          tabBarVisible: false,
        }}
      />
    </LandingStack.Navigator>
  );
}

const HomeStack = createStackNavigator<TabTwoParamList>();

function HomeNavigator() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen
        name="Home"
        component={Home}
        options={{
          headerShown: false,
        }}
      />
    </HomeStack.Navigator>
  );
}

const AddSleepDataStack = createStackNavigator();

function AddSleepDataNavigator() {
  return (
    <AddSleepDataStack.Navigator>
      <AddSleepDataStack.Screen
        name="AddSleepData"
        component={AddSleepData}
        options={{
          headerShown: false,
        }}
      />
    </AddSleepDataStack.Navigator>
  );
}

const AddEpworthDataStack = createStackNavigator();

function AddEpworthDataNavigator() {
  return (
    <AddEpworthDataStack.Navigator>
      <AddEpworthDataStack.Screen
        name="AddEpworthData"
        component={AddEpworthData}
        options={{
          headerShown: false,
        }}
      />
    </AddEpworthDataStack.Navigator>
  );
}

const ViewDataStack = createStackNavigator();

function ViewDataNavigator() {
  return (
    <ViewDataStack.Navigator>
      <ViewDataStack.Screen
        name="ViewData"
        component={ViewData}
        options={{
          headerShown: false,
        }}
      />
    </ViewDataStack.Navigator>
  );
}

const SettingsStack = createStackNavigator();

function SettingsNavigator() {
  return (
    <SettingsStack.Navigator>
      <SettingsStack.Screen
        name="Settings"
        component={Settings}
        options={{
          headerShown: false,
        }}
      />
    </SettingsStack.Navigator>
  );
}
