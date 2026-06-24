import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  withSpring,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import ViewShot, { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as Haptics from 'expo-haptics';
import { colors } from '../theme/colors';
import { TicketReceipt } from '../components/TicketReceipt';
import { usePortfolioDetail } from '../hooks/usePortfolios';
import { Portfolio } from '../types/portfolio';

interface PortfolioDetailScreenProps {
  portfolioId: string;
  initialPortfolio?: Portfolio;
  onBack: () => void;
}

export function PortfolioDetailScreen({
  portfolioId,
  initialPortfolio,
  onBack,
}: PortfolioDetailScreenProps) {
  const { portfolio: fetchedPortfolio, loading } = usePortfolioDetail(portfolioId);
  const portfolio = fetchedPortfolio || initialPortfolio;
  const viewShotRef = useRef<any>(null);
  const [isPrinting, setIsPrinting] = useState(true);
  const [printComplete, setPrintComplete] = useState(false);

  const printProgress = useSharedValue(0);
  const paperOpacity = useSharedValue(0);
  const paperScale = useSharedValue(0.95);
  const shimmerPosition = useSharedValue(-1);

  const onPrintDone = () => {
    setPrintComplete(true);
  };

  useEffect(() => {
    if (portfolio) {
      paperOpacity.value = withTiming(1, { duration: 300 });
      paperScale.value = withSpring(1, { damping: 20, stiffness: 200 });

      printProgress.value = withTiming(1, {
        duration: 2200,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      }, (finished) => {
        if (finished) {
          runOnJS(onPrintDone)();
        }
      });

      shimmerPosition.value = withDelay(
        500,
        withSequence(
          withTiming(2, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        )
      );

      if (Platform.OS === 'ios') {
        setTimeout(() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }, 200);
        setTimeout(() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }, 600);
        setTimeout(() => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }, 2200);
      }

      setTimeout(() => {
        setIsPrinting(false);
      }, 2400);
    }
  }, [portfolio]);

  const receiptAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: paperOpacity.value,
      transform: [
        { scale: paperScale.value },
      ],
      maxHeight: printProgress.value === 0 ? 0 : undefined,
      overflow: 'hidden' as const,
    };
  });

  const clipStyle = useAnimatedStyle(() => {
    const height = printProgress.value * 3000;
    return {
      maxHeight: height,
      overflow: 'hidden' as const,
    };
  });

  const handleShare = async () => {
    try {
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      const uri = await captureRef(viewShotRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
      });

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: `${portfolio?.name} Portfolio Receipt`,
        });
      } else {
        Alert.alert('Sharing not available on this device');
      }
    } catch (error: any) {
      Alert.alert('Error', 'Failed to capture receipt: ' + error.message);
    }
  };

  if (loading && !portfolio) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.paper} />
        <Text style={styles.loadingText}>LOADING RECEIPT...</Text>
      </View>
    );
  }

  if (!portfolio) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>RECEIPT NOT FOUND</Text>
        <TouchableOpacity onPress={onBack} style={styles.backButtonAlt}>
          <Text style={styles.backButtonAltText}>GO BACK</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backArrow}>{'<'}</Text>
          <Text style={styles.backText}>BACK</Text>
        </TouchableOpacity>

        {printComplete && (
          <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
            <Text style={styles.shareText}>SHARE</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Printer slot */}
      <View style={styles.printerSlotContainer}>
        <View style={styles.printerBody}>
          <View style={styles.printerLed} />
          <View style={styles.printerSlot} />
          <View style={styles.printerLed} />
        </View>
      </View>

      {/* Scrollable receipt area */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Printing status */}
        {isPrinting && (
          <View style={styles.printingStatus}>
            <View style={styles.printingDots}>
              <Animated.View style={[styles.dot, styles.dotActive]} />
              <Animated.View style={[styles.dot, styles.dotActive]} />
              <Animated.View style={[styles.dot, styles.dotActive]} />
            </View>
            <Text style={styles.printingText}>PRINTING...</Text>
          </View>
        )}

        {/* Receipt with animation */}
        <Animated.View style={[styles.receiptContainer, receiptAnimatedStyle]}>
          <Animated.View style={clipStyle}>
            <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1 }}>
              <View style={styles.receiptCapture}>
                <TicketReceipt portfolio={portfolio} />
              </View>
            </ViewShot>
          </Animated.View>
        </Animated.View>

        {/* Action buttons */}
        {printComplete && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleShare}
              activeOpacity={0.8}
            >
              <Text style={styles.actionButtonText}>SHARE RECEIPT</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonSecondary]}
              onPress={onBack}
              activeOpacity={0.8}
            >
              <Text style={[styles.actionButtonText, styles.actionButtonTextSecondary]}>
                BACK TO RECEIPTS
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
  },
  backArrow: {
    fontFamily: 'SpaceMono',
    fontSize: 18,
    color: colors.gray500,
    fontWeight: '700',
  },
  backText: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    color: colors.gray500,
    letterSpacing: 2,
    fontWeight: '700',
  },
  backButtonAlt: {
    borderWidth: 1,
    borderColor: colors.gray700,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 4,
  },
  backButtonAltText: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    color: colors.gray500,
    letterSpacing: 2,
  },
  shareButton: {
    borderWidth: 1,
    borderColor: colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  shareText: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    color: colors.accent,
    letterSpacing: 2,
    fontWeight: '700',
  },
  printerSlotContainer: {
    alignItems: 'center',
    paddingBottom: 4,
  },
  printerBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  printerLed: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.green,
  },
  printerSlot: {
    width: 160,
    height: 3,
    backgroundColor: colors.gray900,
    borderRadius: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 60,
  },
  printingStatus: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  printingDots: {
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.gray700,
  },
  dotActive: {
    backgroundColor: colors.accent,
  },
  printingText: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    color: colors.gray500,
    letterSpacing: 4,
  },
  receiptContainer: {
    marginTop: 4,
  },
  receiptCapture: {
    backgroundColor: colors.background,
    padding: 4,
  },
  actions: {
    marginTop: 24,
    gap: 12,
  },
  actionButton: {
    backgroundColor: colors.accent,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    fontFamily: 'SpaceMono',
    fontSize: 14,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: 3,
  },
  actionButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.gray700,
  },
  actionButtonTextSecondary: {
    color: colors.gray500,
  },
});
