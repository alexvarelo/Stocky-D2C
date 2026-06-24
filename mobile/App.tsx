import React, { useState, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useFonts } from 'expo-font';
import { AuthProvider, useAuth } from './src/lib/AuthContext';
import { LoginScreen } from './src/screens/LoginScreen';
import { PortfolioListScreen } from './src/screens/PortfolioListScreen';
import { PortfolioDetailScreen } from './src/screens/PortfolioDetailScreen';
import { Portfolio } from './src/types/portfolio';
import { colors } from './src/theme/colors';

type Screen =
  | { name: 'list' }
  | { name: 'detail'; portfolioId: string; portfolio?: Portfolio };

function AppContent() {
  const { user, loading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<Screen>({ name: 'list' });

  const handleSelectPortfolio = useCallback((portfolio: Portfolio) => {
    setCurrentScreen({
      name: 'detail',
      portfolioId: portfolio.id,
      portfolio,
    });
  }, []);

  const handleBack = useCallback(() => {
    setCurrentScreen({ name: 'list' });
  }, []);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.paper} />
      </View>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  if (currentScreen.name === 'detail') {
    return (
      <PortfolioDetailScreen
        portfolioId={currentScreen.portfolioId}
        initialPortfolio={currentScreen.portfolio}
        onBack={handleBack}
      />
    );
  }

  return <PortfolioListScreen onSelectPortfolio={handleSelectPortfolio} />;
}

export default function App() {
  const [fontsLoaded] = useFonts({
    SpaceMono: require('./assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.paper} />
      </View>
    );
  }

  return (
    <AuthProvider>
      <StatusBar style="light" />
      <AppContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
