import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { DottedLine } from './DottedLine';
import { Portfolio } from '../types/portfolio';

interface PortfolioTicketCardProps {
  portfolio: Portfolio;
  onPress: () => void;
}

function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  }
  return `$${value.toFixed(2)}`;
}

function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

export function PortfolioTicketCard({ portfolio, onPress }: PortfolioTicketCardProps) {
  const isPositive = portfolio.total_return_percentage >= 0;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      <View style={styles.cardWrapper}>
        {/* Zigzag top edge */}
        <View style={styles.zigzagTop}>
          {Array.from({ length: 30 }, (_, i) => (
            <View key={i} style={styles.zigzagTriangleDown} />
          ))}
        </View>

        <View style={styles.card}>
          {/* Header row */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <Text style={styles.portfolioName}>{portfolio.name}</Text>
              <Text style={styles.holdingsCount}>
                {portfolio.holdings_count} holding{portfolio.holdings_count !== 1 ? 's' : ''}
              </Text>
            </View>
            <View style={styles.headerRight}>
              <Text style={styles.valueLabel}>VALUE</Text>
              <Text style={styles.valueAmount}>
                {formatCurrency(portfolio.total_value)}
              </Text>
            </View>
          </View>

          <DottedLine />

          {/* Tickers preview */}
          <View style={styles.tickersRow}>
            {portfolio.holdings.slice(0, 5).map((h) => (
              <View key={h.ticker} style={styles.tickerChip}>
                <Text style={styles.tickerText}>{h.ticker}</Text>
              </View>
            ))}
            {portfolio.holdings_count > 5 && (
              <View style={[styles.tickerChip, styles.tickerChipMore]}>
                <Text style={styles.tickerTextMore}>+{portfolio.holdings_count - 5}</Text>
              </View>
            )}
          </View>

          <DottedLine />

          {/* Footer row */}
          <View style={styles.footerRow}>
            <Text style={styles.printHint}>TAP TO PRINT</Text>
            <View style={[
              styles.returnBadge,
              { backgroundColor: isPositive ? '#E8F5E9' : '#FFEBEE' },
            ]}>
              <Text style={[
                styles.returnText,
                { color: isPositive ? '#1B5E20' : '#B71C1C' },
              ]}>
                {formatPercent(portfolio.total_return_percentage)}
              </Text>
            </View>
          </View>
        </View>

        {/* Zigzag bottom edge */}
        <View style={styles.zigzagBottom}>
          {Array.from({ length: 30 }, (_, i) => (
            <View key={i} style={styles.zigzagTriangleUp} />
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const TRIANGLE_SIZE = 12;

const styles = StyleSheet.create({
  cardWrapper: {
    marginHorizontal: 20,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  zigzagTop: {
    flexDirection: 'row',
    overflow: 'hidden',
    height: TRIANGLE_SIZE,
    marginBottom: -1,
  },
  zigzagBottom: {
    flexDirection: 'row',
    overflow: 'hidden',
    height: TRIANGLE_SIZE,
    marginTop: -1,
  },
  zigzagTriangleDown: {
    width: 0,
    height: 0,
    borderLeftWidth: TRIANGLE_SIZE / 2,
    borderRightWidth: TRIANGLE_SIZE / 2,
    borderBottomWidth: TRIANGLE_SIZE,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: colors.paper,
    borderTopWidth: 0,
  },
  zigzagTriangleUp: {
    width: 0,
    height: 0,
    borderLeftWidth: TRIANGLE_SIZE / 2,
    borderRightWidth: TRIANGLE_SIZE / 2,
    borderTopWidth: TRIANGLE_SIZE,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.paper,
    borderBottomWidth: 0,
  },
  card: {
    backgroundColor: colors.paper,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  portfolioName: {
    fontFamily: 'SpaceMono',
    fontSize: 16,
    fontWeight: '900',
    color: colors.ink,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  holdingsCount: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    color: colors.inkFaint,
    marginTop: 2,
  },
  valueLabel: {
    fontFamily: 'SpaceMono',
    fontSize: 9,
    color: colors.inkFaint,
    letterSpacing: 2,
  },
  valueAmount: {
    fontFamily: 'SpaceMono',
    fontSize: 18,
    fontWeight: '900',
    color: colors.ink,
  },
  tickersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tickerChip: {
    backgroundColor: colors.paperEdge,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 3,
  },
  tickerChipMore: {
    backgroundColor: colors.inkFaint,
  },
  tickerText: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    fontWeight: '700',
    color: colors.ink,
    letterSpacing: 1,
  },
  tickerTextMore: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 1,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  printHint: {
    fontFamily: 'SpaceMono',
    fontSize: 9,
    color: colors.inkFaint,
    letterSpacing: 3,
  },
  returnBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  returnText: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    fontWeight: '800',
  },
});
