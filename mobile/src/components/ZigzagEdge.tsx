import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

interface ZigzagEdgeProps {
  position: 'top' | 'bottom';
  color?: string;
}

export function ZigzagEdge({ position, color = colors.paper }: ZigzagEdgeProps) {
  const triangles = Array.from({ length: 30 }, (_, i) => i);

  return (
    <View
      style={[
        styles.container,
        position === 'top' ? styles.top : styles.bottom,
      ]}
    >
      {triangles.map((i) => (
        <View
          key={i}
          style={[
            styles.triangle,
            {
              borderBottomColor: position === 'top' ? color : 'transparent',
              borderTopColor: position === 'bottom' ? color : 'transparent',
            },
            position === 'top' ? styles.triangleDown : styles.triangleUp,
          ]}
        />
      ))}
    </View>
  );
}

const TRIANGLE_SIZE = 14;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    width: '100%',
    overflow: 'hidden',
    height: TRIANGLE_SIZE,
  },
  top: {
    marginBottom: -1,
  },
  bottom: {
    marginTop: -1,
  },
  triangle: {
    width: 0,
    height: 0,
    borderLeftWidth: TRIANGLE_SIZE / 2,
    borderRightWidth: TRIANGLE_SIZE / 2,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  triangleDown: {
    borderBottomWidth: TRIANGLE_SIZE,
    borderTopWidth: 0,
  },
  triangleUp: {
    borderTopWidth: TRIANGLE_SIZE,
    borderBottomWidth: 0,
  },
});
