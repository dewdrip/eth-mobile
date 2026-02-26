import { Address } from '@/components/eth-mobile';
import { useBalance, useClipboard } from '@/hooks/eth-mobile';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetView, useBottomSheetModal } from '@gorhom/bottom-sheet';
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Blobbie, useActiveAccount, useDisconnect } from 'thirdweb/react';

function truncateAddress(address: string) {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function WalletDetailsSheet() {
  const { dismiss } = useBottomSheetModal();
  const account = useActiveAccount();
  const { copy, isCopied } = useClipboard();
  const disconnect = useDisconnect();
  const {
    displayValue,
    symbol,
    isLoading: balanceLoading
  } = useBalance({ address: account?.address ?? '' });

  if (!account?.address) return null;

  const handleCopyAddress = () => copy(account.address);
  const handleDisconnect = () => {
    dismiss();
  };

  return (
    <BottomSheetView style={styles.container}>
      <View style={styles.avatarRow}>
        <Blobbie address={account.address} size={64} style={styles.avatar} />
      </View>

      <View style={styles.addressRow}>
        <Address address={account.address} showBlockie={false} />
      </View>

      <View style={styles.balanceRow}>
        {balanceLoading ? (
          <ActivityIndicator size="small" color="#374151" />
        ) : (
          <Text style={styles.balanceText}>
            {displayValue != null ? Number(displayValue).toFixed(4) : '0'}{' '}
            {symbol ?? 'ETH'}
          </Text>
        )}
      </View>

      <View style={styles.actionsRow}>
        <Pressable style={styles.actionButton}>
          <Ionicons name="send" size={18} color="#374151" />
          <Text style={styles.actionButtonText}>Send</Text>
        </Pressable>
        <Pressable style={styles.actionButton}>
          <Ionicons name="arrow-down" size={18} color="#374151" />
          <Text style={styles.actionButtonText}>Receive</Text>
        </Pressable>
      </View>

      <View style={styles.menu}>
        <Pressable style={styles.menuItem}>
          <Ionicons name="logo-ethereum" size={20} color="#374151" />
          <Text style={styles.menuItemText}>Ethereum</Text>
          <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
        </Pressable>
        <Pressable style={styles.menuItem}>
          <Ionicons name="wallet-outline" size={20} color="#374151" />
          <Text style={styles.menuItemText}>View Funds</Text>
          <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
        </Pressable>
        <Pressable style={styles.menuItem} onPress={handleDisconnect}>
          <Ionicons name="log-out-outline" size={20} color="#374151" />
          <Text style={styles.menuItemText}>Disconnect Wallet</Text>
          <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
        </Pressable>
      </View>
    </BottomSheetView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 32,
    backgroundColor: '#fff'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  headerSpacer: { width: 24 },
  closeButton: {
    padding: 4
  },
  avatarRow: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 12
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 4
  },
  addressText: {
    fontSize: 16,
    fontFamily: 'Poppins',
    color: '#374151'
  },
  copyIcon: { marginLeft: 4 },
  copiedHint: {
    fontSize: 12,
    color: '#10b981',
    textAlign: 'center',
    marginBottom: 8
  },
  balanceRow: {
    alignItems: 'center',
    marginBottom: 24
  },
  balanceText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#111827'
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff'
  },
  actionButtonText: {
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
    color: '#374151'
  },
  menu: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6'
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f3f4f6'
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Poppins',
    color: '#374151'
  }
});
