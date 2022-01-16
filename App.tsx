/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React from 'react';
import {SafeAreaView, ScrollView, StatusBar, Text, View} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';
import Graph from './Graph';

const App = () => {
  return (
    <SafeAreaView
      style={{
        backgroundColor: Colors.white,
      }}>
      <StatusBar barStyle={'light-content'} />
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View
          style={{
            backgroundColor: Colors.white,
          }}>
          <Text style={{color: Colors.black}}>ReAnimated Test</Text>
          <Graph />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default App;
