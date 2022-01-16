import React, {useCallback, useMemo, useState, useEffect} from 'react';
import Animated, {
  useSharedValue,
  withTiming,
  Easing,
  withSequence,
  cancelAnimation,
  useAnimatedProps,
} from 'react-native-reanimated';

import {
  LayoutChangeEvent,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import {Path, Svg} from 'react-native-svg';

interface AnimatedGraphProps {
  min: number;
  samples: {
    x: number;
    y: number;
    z: number;
  }[];
}

const AnimatedPath = Animated.createAnimatedComponent(Path);

const LabelSpace = 30;

export const AnimatedGraph = ({
  samples,
  min,
}: AnimatedGraphProps): JSX.Element => {
  const [, maxValue, xSamples, ySamples, zSamples] = useMemo(() => {
    const last = samples[samples.length - 1];
    return [
      last,
      Math.max(last?.x, last?.y, last?.z),
      samples.map(sample => sample.x),
      samples.map(sample => sample.y),
      samples.map(sample => sample.z),
    ];
  }, [samples]);
  const [chartSize, setChartSize] = useState<{width: number; height: number}>({
    width: 250,
    height: 250,
  });
  const maxChart = Math.max(min, Math.ceil(maxValue));

  const updateLayout = useCallback(
    (event: LayoutChangeEvent) => {
      setChartSize({
        width: event.nativeEvent.layout.width - LabelSpace,
        height: event.nativeEvent.layout.height,
      });
    },
    [setChartSize],
  );

  if (samples.length < 4) {
    return <View style={graphStyles.wrapper} />;
  }

  return (
    <View style={graphStyles.wrapper} onLayout={updateLayout}>
      <GraphAxis max={maxChart} height={chartSize.height} />
      <View style={graphStyles.linesWrapper}>
        <GraphLine
          maxRange={maxChart}
          samples={xSamples}
          size={chartSize}
          color="blue"
        />
        <GraphLine
          maxRange={maxChart}
          samples={ySamples}
          size={chartSize}
          color="red"
        />
        <GraphLine
          maxRange={maxChart}
          samples={zSamples}
          size={chartSize}
          color="green"
        />
      </View>
    </View>
  );
};

const graphStyles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    flex: 1,
    flexDirection: 'column',
    width: '100%',
  },
  linesWrapper: {
    left: LabelSpace,
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
});

interface GraphLineProps {
  maxRange: number;
  samples: number[];
  size: {width: number; height: number};
  color: string;
}

const GraphLine = ({
  maxRange,
  samples,
  size,
  color,
}: GraphLineProps): JSX.Element => {
  const stepWidth = size.width / (samples.length - 2);
  const lineWidth = stepWidth * (samples.length - 1);
  const offset = useSharedValue(0);
  const path = useMemo(() => {
    const y = (val: number) =>
      Math.round(Math.min(Math.max(1 - val / maxRange, 0), 1) * size.height);
    const p = [y(samples[0])];
    for (let i = 1; i < samples.length; i++) {
      p.push(y(samples[i]));
    }
    return p;
  }, [samples, size.height, maxRange]);
  const timingConfig = useMemo(
    () => ({
      toBegin: {duration: 0},
      animate: {duration: 500, easing: Easing.linear},
    }),
    [],
  );

  useEffect(() => {
    cancelAnimation(offset);
    offset.value = withSequence(
      withTiming(-stepWidth, timingConfig.toBegin),
      withTiming(0, timingConfig.animate),
    );
  }, [path, offset, stepWidth, timingConfig]);

  const animatedProps = useAnimatedProps(() => {
    const d = path
      .map((y, i) => {
        let x = i * stepWidth - offset.value;
        if (!Number.isFinite(x)) {
          x = 0;
        }
        return i === 0 ? `M${x} ${y}` : `L${x} ${y}`;
      })
      .join(' ');
    return {d};
  });

  const offsetStyle = useMemo<ViewStyle>(
    () => ({
      left: -stepWidth,
      width: lineWidth,
      position: 'absolute',
    }),
    [lineWidth, stepWidth],
  );
  const wrapperStyle = useMemo<ViewStyle[]>(
    () => [
      {
        width: size.width,
        height: size.height,
      },
      graphLineStyles.wrapper,
    ],
    [size.width, size.height],
  );

  return (
    <>
      <View style={wrapperStyle}>
        <Animated.View style={offsetStyle}>
          <Svg height={size.height} width={lineWidth}>
            <AnimatedPath
              animatedProps={animatedProps}
              stroke={color}
              fill="none"
            />
          </Svg>
        </Animated.View>
      </View>
    </>
  );
};

const graphLineStyles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    overflow: 'hidden',
  },
});

interface GraphAxisProps {
  max: number;
  height: number;
}

const GraphAxis = ({max, height}: GraphAxisProps): JSX.Element => {
  const axisList = useMemo(
    () =>
      new Array(5)
        .fill(0)
        .map((v, i) => (i / 5) * max)
        .reverse(),
    [max],
  );
  const getTop = (val: number) => {
    return Math.round(((max - val) / max) * height);
  };

  return (
    <View style={axisStyles.container}>
      {axisList.map(val => {
        return (
          <View key={val} style={[axisStyles.axis, {top: getTop(val)}]}>
            <View style={axisStyles.axisLabel}>
              <Text>{val}</Text>
            </View>
            <View style={axisStyles.axisBar} />
          </View>
        );
      })}
    </View>
  );
};

const axisStyles = StyleSheet.create({
  container: {
    position: 'relative',
    height: '100%',
  },
  axis: {
    position: 'absolute',
    flexDirection: 'row',
  },
  axisLabel: {
    position: 'absolute',
    flexDirection: 'row',
    flex: 0,
    width: LabelSpace,
    bottom: 7,
  },
  axisBar: {
    backgroundColor: '#edebf2',
    height: 1,
    flex: 1,
  },
});

export default AnimatedGraph;
