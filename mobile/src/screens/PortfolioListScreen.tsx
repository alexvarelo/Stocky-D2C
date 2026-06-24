import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { colors } from '../theme/colors';
import { useAuth } from '../lib/AuthContext';
import { usePortfolios } from '../hooks/usePortfolios';
import { PortfolioTicketCard } from '../components/PortfolioTicketCard';
import { Portfolio } from '../types/portfolio';

interface PortfolioListScreenProps {
  onSelectPortfolio: (portfolio: Portfolio) => void;
}

export function PortfolioListScreen({ onSelectPortfolio }: PortfolioListScreenProps) {
  const { userProfile, signOut } = useAuth();
  const { portfolios, loading, refetch } = usePortfolios();

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.printerTop}>
        <View style={styles.printerDot} />
        <View style={styles.printerDot} />
        <View style={styles.printerSlot} />
        <View style={styles.printerDot} />
        <View style={styles.printerDot} />
      </View>

      <View style={styles.headerContent}>
        <View>
          <Text style={styles.greeting}>
            {userProfile?.full_name || userProfile?.username || 'Investor'}
          </Text>
          <Text style={styles.subGreeting}>YOUR PORTFOLIO RECEIPTS</Text>
        </View>
        <TouchableOpacity onPress={signOut} style={styles.logoutButton}>
          <Text style={styles.logoutText}>EXIT</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{portfolios.length}</Text>
          <Text style={styles.statLabel}>PORTFOLIOS</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {portfolios.reduce((sum, p) => sum + p.holdings_count, 0)}
          </Text>
          <Text style={styles.statLabel}>HOLDINGS</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            ${((portfolios.reduce((sum, p) => sum + p.total_value, 0)) / 1000).toFixed(1)}K
          </Text>
          <Text style={styles.statLabel}>TOTAL</Text>
        </View>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🧾</Text>
      <Text style={styles.emptyText}>NO RECEIPTS YET</Text>
      <Text style={styles.emptySubtext}>
        Create portfolios in the Stocky web app to see them here
      </Text>
    </View>
  );

  if (loading && portfolios.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.paper} />
        <Text style={styles.loadingText}>PRINTING...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={portfolios}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PortfolioTicketCard
            portfolio={item}
            onPress={() => onSelectPortfolio(item)}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={onRefresh}
            tintColor={colors.paper}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    color: colors.gray500,
    letterSpacing: 4,
  },
  listContent: {
    paddingBottom: 40,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
  },
  printerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  printerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.surface,
  },
  printerSlot: {
    width: 120,
    height: 4,
    backgroundColor: colors.surface,
    borderRadius: 2,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  greeting: {
    fontFamily: 'SpaceMono',
    fontSize: 20,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: 1,
  },
  subGreeting: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    color: colors.gray500,
    letterSpacing: 3,
    marginTop: 4,
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: colors.gray700,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 4,
  },
  logoutText: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    color: colors.gray500,
    letterSpacing: 2,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 24,
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingVertical: 16,
    gap: 0,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: 'SpaceMono',
    fontSize: 20,
    fontWeight: '900',
    color: colors.white,
  },
  statLabel: {
    fontFamily: 'SpaceMono',
    fontSize: 9,
    color: colors.gray500,
    letterSpacing: 2,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.gray700,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontFamily: 'SpaceMono',
    fontSize: 14,
    color: colors.gray500,
    letterSpacing: 3,
    fontWeight: '700',
  },
  emptySubtext: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    color: colors.gray700,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },
});
