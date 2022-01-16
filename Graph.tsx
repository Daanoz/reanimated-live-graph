/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React, {useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';

import AnimatedGraph from './AnimatedGraph';

const SAMPLE_COUNT = 36;

const Graph = () => {
  const [samples, setSamples] = useState<{x: number; y: number; z: number}[]>(
    Array(SAMPLE_COUNT).fill({
      x: 0,
      y: 0,
      z: 0,
    }),
  );
  useEffect(() => {
    const interval = setInterval(() => {
      setSamples(current => {
        current.push({
          x: Math.random() * 100,
          y: Math.random() * 100,
          z: Math.random() * 100,
        });
        return current.slice(SAMPLE_COUNT * -1);
      });
    }, 500);
    return () => clearInterval(interval);
  }, []);
  return (
    <View style={styles.wrapper}>
      <AnimatedGraph samples={samples} min={100} />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    height: 300,
    width: '100%',
  },
});

export default Graph;
