import { useTheme, type ThemeColors } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import {
  BottomSheetScrollView,
  useBottomSheetModal
} from '@gorhom/bottom-sheet';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ImageSourcePropType,
  Pressable,
  Text,
  View
} from 'react-native';
import { useConnect } from 'thirdweb/react';
import { createWallet, inAppWallet } from 'thirdweb/wallets';
import { client } from '../../Thirdweb';

const LOGOS = {
  google: require('../../../../assets/images/logos/google.png'),
  facebook: require('../../../../assets/images/logos/facebook.png'),
  apple: require('../../../../assets/images/logos/apple.png'),
  metamask: require('../../../../assets/images/logos/metamask.png'),
  base: require('../../../../assets/images/logos/base.png'),
  rainbow: require('../../../../assets/images/logos/rainbow.png')
};

const SOCIAL_OPTIONS = [
  { strategy: 'google' as const, logo: LOGOS.google },
  { strategy: 'facebook' as const, logo: LOGOS.facebook },
  { strategy: 'apple' as const, logo: LOGOS.apple }
] as const;

const WALLETS = [
  { id: 'io.metamask', name: 'MetaMask', logo: LOGOS.metamask },
  {
    id: 'com.coinbase.wallet',
    name: 'Base',
    sublabel: 'formerly Coinbase Wallet',
    logo: LOGOS.base
  },
  { id: 'me.rainbow', name: 'Rainbow', logo: LOGOS.rainbow }
] as const;

function WalletRow({
  name,
  sublabel,
  logo,
  onPress,
  onCancel,
  isLoading,
  disabled = false,
  colors
}: {
  name: string;
  sublabel?: string;
  logo: ImageSourcePropType;
  onPress: () => void;
  onCancel?: () => void;
  isLoading: boolean;
  disabled?: boolean;
  colors: ThemeColors;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={isLoading || disabled}
      className="flex-row items-center py-4 border-b active:opacity-80 disabled:opacity-60"
      style={{ borderBottomColor: colors.border }}
    >
      <Image
        source={logo}
        style={{ width: 24, height: 24, borderRadius: 4 }}
        resizeMode="contain"
      />
      <View className="flex-1 ml-3">
        <Text
          className="text-base font-[Poppins-SemiBold]"
          style={{ color: colors.text }}
        >
          {name}
        </Text>
        {sublabel ? (
          <Text
            className="text-xs font-[Poppins]"
            style={{ color: colors.textMuted }}
          >
            {sublabel}
          </Text>
        ) : null}
      </View>
      {isLoading ? (
        <View className="flex-row items-center gap-2">
          {onCancel ? (
            <Pressable onPress={onCancel} hitSlop={8} className="py-1 px-0">
              <Text
                className="text-sm font-[Poppins-SemiBold]"
                style={{ color: colors.error }}
              >
                Cancel
              </Text>
            </Pressable>
          ) : null}
          <ActivityIndicator size="small" color={colors.textMuted} />
        </View>
      ) : (
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      )}
    </Pressable>
  );
}

type ConnectingId = 'google' | 'facebook' | 'apple' | string | null;

export default function ConnectSheet() {
  const { colors } = useTheme();
  const { dismiss } = useBottomSheetModal();
  const { connect, cancelConnection } = useConnect({ client });
  const [connectingId, setConnectingId] = useState<ConnectingId>(null);

  const handleCancelWalletConnect = useCallback(() => {
    cancelConnection();
    setConnectingId(null);
  }, [cancelConnection]);

  const handleSocialConnect = useCallback(
    async (strategy: 'google' | 'apple' | 'facebook') => {
      setConnectingId(strategy);
      try {
        const inApp = inAppWallet({
          auth: {
            options: ['google', 'apple', 'facebook'],
            redirectUrl: 'ethmobile://'
          }
        });

        const wallet = await connect(async () => {
          await inApp.connect({ client, strategy });
          return inApp;
        });
        if (wallet) dismiss();
      } catch (_) {
        // User cancelled or error – keep sheet open
      } finally {
        setConnectingId(null);
      }
    },
    [connect, dismiss]
  );

  const handleConnect = useCallback(
    async (walletId: string) => {
      setConnectingId(walletId);
      try {
        const wallet =
          walletId === 'com.coinbase.wallet'
            ? createWallet('com.coinbase.wallet', {
                appMetadata: {
                  name: 'Treegens'
                },
                mobileConfig: {
                  callbackURL: 'ethmobile://'
                }
              })
            : createWallet(walletId as 'io.metamask' | 'me.rainbow');
        const walletResult = await connect(async () => {
          await wallet.connect({ client });
          return wallet;
        });
        if (walletResult) dismiss();
      } catch (_) {
        // User cancelled or error – keep sheet open
      } finally {
        setConnectingId(null);
      }
    },
    [connect, dismiss]
  );

  return (
    <BottomSheetScrollView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
    >
      <View className="pb-8">
        <Text
          className="text-xl font-semibold font-[Poppins-SemiBold] ml-4 my-2"
          style={{ color: colors.text }}
        >
          Sign in
        </Text>

        <View className="px-4 py-6">
          <View className="flex-row gap-3 mb-6">
            {SOCIAL_OPTIONS.map(({ strategy, logo }) => {
              const isThisConnecting = connectingId === strategy;
              return (
                <Pressable
                  key={strategy}
                  onPress={() => handleSocialConnect(strategy)}
                  disabled={!!connectingId}
                  className="flex-1 aspect-square max-h-14 items-center justify-center rounded-xl border active:opacity-80"
                  style={{
                    borderColor: colors.border,
                    backgroundColor: colors.background
                  }}
                >
                  {isThisConnecting ? (
                    <ActivityIndicator size="small" color={colors.textMuted} />
                  ) : (
                    <Image
                      source={logo}
                      style={{ width: 28, height: 28 }}
                      resizeMode="contain"
                    />
                  )}
                </Pressable>
              );
            })}
          </View>

          <View className="flex-row items-center gap-3 mb-4">
            <View
              className="flex-1 h-px"
              style={{ backgroundColor: colors.border }}
            />
            <Text
              className="text-xs font-[Poppins]"
              style={{ color: colors.textMuted }}
            >
              OR
            </Text>
            <View
              className="flex-1 h-px"
              style={{ backgroundColor: colors.border }}
            />
          </View>

          <Text
            className="text-sm font-[Poppins] mb-4"
            style={{ color: colors.textSecondary }}
          >
            Connect a wallet
          </Text>
          {WALLETS.map(w => (
            <WalletRow
              key={w.id}
              name={w.name}
              sublabel={'sublabel' in w ? w.sublabel : undefined}
              logo={w.logo}
              onPress={() => handleConnect(w.id)}
              onCancel={handleCancelWalletConnect}
              isLoading={connectingId === w.id}
              disabled={!!connectingId && connectingId !== w.id}
              colors={colors}
            />
          ))}
        </View>
      </View>
    </BottomSheetScrollView>
  );
}
