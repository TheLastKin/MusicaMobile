/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import MainPage from './src/MainPage';

axios.defaults.baseURL = "http://192.168.1.5:3000/"

const App = () => {

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <MainPage/>
    </GestureHandlerRootView>
  )
};

export default App;
