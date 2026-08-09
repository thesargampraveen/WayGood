import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import App from '../../App';
import HomeScreen from '../Screens/Homescreen';
import DetailsScreen from '../Screens/Detailsscreen';
import Datascreen from '../Screens/Datascreen';


const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={App}
          
        />

        <Stack.Screen
          name="Details"
          component={DetailsScreen}
          options={{
            title: 'University Details'
          }}
        />
        <Stack.Screen
        name ="Data"
        component ={Datascreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;