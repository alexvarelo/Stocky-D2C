import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

interface DottedLineProps {
  color?: string;
  spacing?: number;
  dashWidth?: number;
  dashHeight?: number;
  style?: any;
}

export function DottedLine({
  color = colors.inkFaint,
  spacing = 6,
  dashWidth = 4,
  dashHeight = 1,
  style,
}: DottedLineProps) {
  const dashes = Array.from({ length: 50 }, (_, i) => i);

  return (
    <View style={[styles.container, style]}>
      {dashes.map((i) => (
        <View
          key={i}
          style={[
            styles.dash,
            {
              backgroundColor: color,
              width: dashWidth,
              height: dashHeight,
              marginRight: spacing,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    overflow: 'hidden',
    marginVertical: 10,
  },
  dash: {
    borderRadius: 1,
  },
});
