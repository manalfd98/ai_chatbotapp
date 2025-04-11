import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import Chat from '../AI_ChatbotApp/src/screens/Chat'
import Login from '../AI_ChatbotApp/src/screens/Login'


const App = () => {
  const Stack = createStackNavigator();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>

      <Stack.Screen name="Login" component={Login} />

          <Stack.Screen name="Chat" component={Chat} />

        
    
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default App

const styles = StyleSheet.create({})