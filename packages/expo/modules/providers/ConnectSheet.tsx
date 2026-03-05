import { Ionicons } from '@expo/vector-icons';
import {
  BottomSheetScrollView,
  useBottomSheetModal
} from '@gorhom/bottom-sheet';
import React, { useCallback } from 'react';
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
import { client } from './Thirdweb';

const LOGOS = {
  google: require('../../assets/images/logos/google.png'),
  facebook: require('../../assets/images/logos/facebook.png'),
  apple: require('../../assets/images/logos/apple.png'),
  metamask: require('../../assets/images/logos/metamask.png'),
  base: require('../../assets/images/logos/base.png'),
  rainbow: require('../../assets/images/logos/rainbow.png')
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

const inApp = inAppWallet({
  auth: {
    options: ['google', 'apple', 'facebook'],
    redirectUrl: 'ethmobile://'
  }
});

function WalletRow({
  name,
  sublabel,
  logo,
  onPress,
  isLoading
}: {
  name: string;
  sublabel?: string;
  logo: ImageSourcePropType;
  onPress: () => void;
  isLoading: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={isLoading}
      className="flex-row items-center py-4 border-b border-gray-100 active:opacity-80"
    >
      <Image
        source={logo}
        style={{ width: 24, height: 24, borderRadius: 4 }}
        resizeMode="contain"
      />
      <View className="flex-1 ml-3">
        <Text className="text-base font-[Poppins-SemiBold] text-gray-900">
          {name}
        </Text>
        {sublabel ? (
          <Text className="text-xs font-[Poppins] text-gray-500">
            {sublabel}
          </Text>
        ) : null}
      </View>
      {isLoading ? (
        <ActivityIndicator size="small" color="#374151" />
      ) : (
        <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
      )}
    </Pressable>
  );
}

export default function ConnectSheet() {
  const { dismiss } = useBottomSheetModal();
  const { connect, isConnecting } = useConnect({ client });

  const handleSocialConnect = useCallback(
    async (strategy: 'google' | 'apple' | 'facebook') => {
      try {
        await connect(async () => {
          await inApp.connect({ client, strategy });
          return inApp;
        });
        dismiss();
      } catch (_) {
        // User cancelled or error – keep sheet open
      }
    },
    [connect, dismiss]
  );

  const handleConnect = useCallback(
    async (walletId: string) => {
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
        await connect(async () => {
          await wallet.connect({ client });
          return wallet;
        });
        dismiss();
      } catch (_) {
        // User cancelled or error – keep sheet open
      }
    },
    [connect, dismiss]
  );

  return (
    <BottomSheetScrollView className="flex-1 bg-white">
      <View className="pb-8">
        <Text className="text-xl font-semibold font-[Poppins-SemiBold] text-gray-900 ml-4 my-2">
          Sign in
        </Text>

        <View className="px-4 py-6">
          <View className="flex-row gap-3 mb-6">
            {SOCIAL_OPTIONS.map(({ strategy, logo }) => (
              <Pressable
                key={strategy}
                onPress={() => handleSocialConnect(strategy)}
                disabled={isConnecting}
                className="flex-1 aspect-square max-h-14 items-center justify-center rounded-xl border border-gray-200 bg-white active:opacity-80"
              >
                <Image
                  source={logo}
                  style={{ width: 28, height: 28 }}
                  resizeMode="contain"
                />
              </Pressable>
            ))}
          </View>

          <View className="flex-row items-center gap-3 mb-4">
            <View className="flex-1 h-px bg-gray-200" />
            <Text className="text-xs font-[Poppins] text-gray-500">OR</Text>
            <View className="flex-1 h-px bg-gray-200" />
          </View>

          <Text className="text-sm font-[Poppins] text-gray-600 mb-4">
            Connect a wallet
          </Text>
          {WALLETS.map(w => (
            <WalletRow
              key={w.id}
              name={w.name}
              sublabel={'sublabel' in w ? w.sublabel : undefined}
              logo={w.logo}
              onPress={() => handleConnect(w.id)}
              isLoading={isConnecting}
            />
          ))}
        </View>
      </View>
    </BottomSheetScrollView>
  );
}
