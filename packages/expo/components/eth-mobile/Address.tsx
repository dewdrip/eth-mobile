import { useClipboard, useEnsName, useNetwork } from '@/hooks/eth-mobile';
import { useTheme } from '@/theme';
import { truncateAddress } from '@/utils/eth-mobile';
import { Ionicons } from '@expo/vector-icons';
import { getAddress, isAddress } from 'ethers';
import React, { useMemo } from 'react';
import {
  Linking,
  Pressable,
  Text,
  TextStyle,
  View,
  ViewStyle
} from 'react-native';
import { Blockie } from '.';

type Props = {
  address: string;
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
  iconStyle?: TextStyle;
  copyable?: boolean;
  showBlockie?: boolean;
  /** When true, resolve and show ENS name (with address as secondary). Copy still uses address. */
  resolveEns?: boolean;
};

/**
 * Displays an Ethereum address with optional blockie, copy, explorer link, and ENS.
 * Address is shown in checksummed form. When block explorer is available (from current network),
 * tapping the address opens it in the explorer.
 *
 * @param address - The Ethereum address to display
 * @param containerStyle - Optional style for the container
 * @param textStyle - Optional style for the text
 * @param iconStyle - Optional style for the icon
 * @param copyable - Whether to show the copy icon (default: true)
 * @param showBlockie - Whether to show the blockie (default: true)
 * @param resolveEns - Whether to resolve and show ENS name (default: false)
 */
export function Address({
  address,
  containerStyle,
  textStyle,
  iconStyle,
  copyable = true,
  showBlockie = true,
  resolveEns = true
}: Props) {
  const { colors } = useTheme();
  const { copy, isCopied } = useClipboard();
  const network = useNetwork();
  const { ensName, isLoading: ensLoading } = useEnsName(
    resolveEns ? address : undefined
  );

  const checksummed = useMemo(() => {
    if (!address || typeof address !== 'string') return '';
    try {
      return isAddress(address) ? getAddress(address) : address;
    } catch {
      return address;
    }
  }, [address]);

  if (!checksummed) {
    return (
      <View className="flex-row items-center gap-x-2" style={containerStyle}>
        <Text
          className="text-lg font-[Poppins] opacity-70"
          style={[{ color: colors.text }, textStyle]}
        >
          —
        </Text>
      </View>
    );
  }

  const explorerUrl = network?.blockExplorer
    ? `${network.blockExplorer}/address/${checksummed}`
    : null;

  const openExplorer = () => {
    if (explorerUrl) Linking.openURL(explorerUrl);
  };

  const displayPrimary =
    resolveEns && ensName ? ensName : truncateAddress(checksummed);
  const displaySecondary =
    resolveEns && ensName && !ensLoading ? truncateAddress(checksummed) : null;

  const addressContent = (
    <View>
      <Text
        className="text-lg font-[Poppins]"
        style={[{ color: colors.text }, textStyle]}
      >
        {displayPrimary}
      </Text>
      {displaySecondary != null && (
        <Text
          className="text-base font-[Poppins] opacity-70 -mt-2"
          style={{ color: colors.text }}
        >
          {displaySecondary}
        </Text>
      )}
    </View>
  );

  return (
    <View className="flex-row items-center gap-x-2" style={containerStyle}>
      {showBlockie && checksummed && (
        <Blockie address={checksummed} size={1.3 * 24} />
      )}
      {explorerUrl ? (
        <Pressable
          onPress={openExplorer}
          className="flex-row items-center gap-x-2"
          accessibilityLabel="Open address in block explorer"
          accessibilityRole="button"
        >
          {addressContent}
        </Pressable>
      ) : (
        addressContent
      )}
      {copyable && checksummed && (
        <Pressable
          onPress={() => copy(checksummed)}
          hitSlop={12}
          accessibilityLabel="Copy address"
          accessibilityRole="button"
        >
          <Ionicons
            name={isCopied ? 'checkmark-circle-outline' : 'copy-outline'}
            size={20}
            style={[{ color: colors.primary }, iconStyle]}
          />
        </Pressable>
      )}
    </View>
  );
}
