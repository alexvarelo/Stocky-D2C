import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { DottedLine } from './DottedLine';
import { ZigzagEdge } from './ZigzagEdge';
import { Portfolio, Holding } from '../types/portfolio';

interface TicketReceiptProps {
  portfolio: Portfolio;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value);
}

function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatTime(): string {
  return new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function generateBarcode(): string {
  let barcode = '';
  const chars = '║│║║│║│║║║│║│║║│║║│║│║║║│║│║║│';
  for (let i = 0; i < 30; i++) {
    barcode += chars[Math.floor(Math.random() * chars.length)];
  }
  return barcode;
}

function HoldingRow({ holding, index }: { holding: Holding; index: number }) {
  const value = holding.quantity * holding.average_price;
  const returnPct = holding.total_invested > 0
    ? ((value - holding.total_invested) / holding.total_invested) * 100
    : 0;

  return (
    <View style={styles.holdingRow}>
      <View style={styles.holdingLeft}>
        <Text style={styles.holdingIndex}>{String(index + 1).padStart(2, '0')}</Text>
        <View>
          <Text style={styles.holdingTicker}>{holding.ticker}</Text>
          <Text style={styles.holdingQty}>{holding.quantity} shares</Text>
        </View>
      </View>
      <View style={styles.holdingRight}>
        <Text style={styles.holdingValue}>{formatCurrency(value)}</Text>
        <Text style={[
          styles.holdingReturn,
          { color: returnPct >= 0 ? '#1B5E20' : '#B71C1C' },
        ]}>
          {formatPercent(returnPct)}
        </Text>
      </View>
    </View>
  );
}

export function TicketReceipt({ portfolio }: TicketReceiptProps) {
  const returnColor = portfolio.total_return_percentage >= 0
    ? '#1B5E20'
    : '#B71C1C';

  return (
    <View style={styles.receiptWrapper}>
      <ZigzagEdge position="top" />

      <View style={styles.receipt}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>STOCKY</Text>
          <Text style={styles.subtitle}>PORTFOLIO RECEIPT</Text>
        </View>

        <DottedLine />

        {/* Portfolio Info */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>PORTFOLIO</Text>
            <Text style={styles.infoValue}>{portfolio.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>DATE</Text>
            <Text style={styles.infoValue}>{formatDate(portfolio.created_at)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>TIME</Text>
            <Text style={styles.infoValue}>{formatTime()}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>ITEMS</Text>
            <Text style={styles.infoValue}>{portfolio.holdings_count}</Text>
          </View>
        </View>

        {portfolio.description ? (
          <>
            <DottedLine />
            <Text style={styles.description}>"{portfolio.description}"</Text>
          </>
        ) : null}

        <DottedLine />

        {/* Holdings Header */}
        <View style={styles.holdingsHeader}>
          <Text style={styles.holdingsHeaderText}>HOLDINGS</Text>
          <Text style={styles.holdingsHeaderText}>VALUE</Text>
        </View>

        <DottedLine dashWidth={2} spacing={4} />

        {/* Holdings List */}
        {portfolio.holdings.map((holding, index) => (
          <HoldingRow key={holding.ticker} holding={holding} index={index} />
        ))}

        <DottedLine />

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TOTAL INVESTED</Text>
            <Text style={styles.totalValue}>{formatCurrency(portfolio.total_invested)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>CURRENT VALUE</Text>
            <Text style={[styles.totalValueBig]}>{formatCurrency(portfolio.total_value)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>RETURN</Text>
            <Text style={[styles.totalValueBig, { color: returnColor }]}>
              {formatPercent(portfolio.total_return_percentage)}
            </Text>
          </View>
        </View>

        <DottedLine />

        {/* Barcode */}
        <View style={styles.barcodeSection}>
          <Text style={styles.barcode}>{generateBarcode()}</Text>
          <Text style={styles.barcodeId}>{portfolio.id.substring(0, 16).toUpperCase()}</Text>
        </View>

        <DottedLine />

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>THANK YOU FOR INVESTING</Text>
          <Text style={styles.footerSubtext}>powered by stocky</Text>
          <Text style={styles.footerDate}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>
      </View>

      <ZigzagEdge position="bottom" />
    </View>
  );
}

const styles = StyleSheet.create({
  receiptWrapper: {
    alignItems: 'center',
    width: '100%',
  },
  receipt: {
    backgroundColor: colors.paper,
    width: '100%',
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  logo: {
    fontFamily: 'SpaceMono',
    fontSize: 32,
    fontWeight: '900',
    color: colors.ink,
    letterSpacing: 8,
  },
  subtitle: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    color: colors.inkLight,
    letterSpacing: 4,
    marginTop: 4,
  },
  infoSection: {
    gap: 6,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    color: colors.inkFaint,
    letterSpacing: 1,
  },
  infoValue: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    color: colors.ink,
    fontWeight: '600',
  },
  description: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    color: colors.inkLight,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 4,
  },
  holdingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  holdingsHeaderText: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    color: colors.inkFaint,
    letterSpacing: 2,
    fontWeight: '700',
  },
  holdingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.paperEdge,
  },
  holdingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  holdingIndex: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    color: colors.inkFaint,
  },
  holdingTicker: {
    fontFamily: 'SpaceMono',
    fontSize: 14,
    fontWeight: '700',
    color: colors.ink,
  },
  holdingQty: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    color: colors.inkLight,
  },
  holdingRight: {
    alignItems: 'flex-end',
  },
  holdingValue: {
    fontFamily: 'SpaceMono',
    fontSize: 13,
    fontWeight: '600',
    color: colors.ink,
  },
  holdingReturn: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    fontWeight: '600',
  },
  totalsSection: {
    gap: 8,
    paddingVertical: 4,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    color: colors.inkLight,
    letterSpacing: 1,
  },
  totalValue: {
    fontFamily: 'SpaceMono',
    fontSize: 13,
    color: colors.ink,
    fontWeight: '600',
  },
  totalValueBig: {
    fontFamily: 'SpaceMono',
    fontSize: 18,
    color: colors.ink,
    fontWeight: '900',
  },
  barcodeSection: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  barcode: {
    fontFamily: 'SpaceMono',
    fontSize: 24,
    color: colors.ink,
    letterSpacing: -2,
  },
  barcodeId: {
    fontFamily: 'SpaceMono',
    fontSize: 9,
    color: colors.inkFaint,
    letterSpacing: 3,
    marginTop: 4,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  footerText: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    fontWeight: '700',
    color: colors.ink,
    letterSpacing: 2,
  },
  footerSubtext: {
    fontFamily: 'SpaceMono',
    fontSize: 9,
    color: colors.inkFaint,
    marginTop: 4,
    letterSpacing: 1,
  },
  footerDate: {
    fontFamily: 'SpaceMono',
    fontSize: 9,
    color: colors.inkFaint,
    marginTop: 2,
  },
});
