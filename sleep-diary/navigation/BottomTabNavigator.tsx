import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import React, {useState} from 'react';

import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';
import Landing from '../screens/LandingScreen';
import Home from '../screens/HomeScreen';
import { BottomTabParamList, TabOneParamList, TabTwoParamList } from '../types';

const BottomTab = createBottomTabNavigator<BottomTabParamList>();

export default function BottomTabNavigator() {
  const colorScheme = useColorScheme();
  const [isLoginScreen, setIsLoginScreen] = useState(true);

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

      {isLoginScreen ?
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
            setIsLoginScreen(false)
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
