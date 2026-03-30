/**
 * Dev-only: sends 1 ETH from local network's first account to the connected wallet.
 * Only visible on the local network (chain id 31337).
 * DO NOT use this private key in production or commit to public repos.
 */
import { useNetwork } from '@/hooks/eth-mobile';
import { useTheme } from '@/theme';
import React, { useCallback, useState } from 'react';
import { Pressable, Text } from 'react-native';
import { useToast } from 'react-native-toast-notifications';
import { useActiveAccount } from 'thirdweb/react';
import { createWalletClient, defineChain, http, parseEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

const LOCAL_NETWORK_FAUCET_PRIVATE_KEY =
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80' as const;

const LOCAL_CHAIN_ID = 31337;

export default function FaucetButton() {
  const { colors } = useTheme();
  const account = useActiveAccount();
  const network = useNetwork();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const show =
    typeof __DEV__ !== 'undefined' && __DEV__ && network?.id === LOCAL_CHAIN_ID;

  const handlePress = useCallback(async () => {
    if (!account?.address || !network?.provider || !show) return;
    setIsLoading(true);
    try {
      const chain = defineChain({
        id: network.id,
        name: network.name ?? 'Localhost',
        nativeCurrency: {
          name: network.token?.name ?? 'Ether',
          symbol: network.token?.symbol ?? 'ETH',
          decimals: network.token?.decimals ?? 18
        },
        rpcUrls: {
          default: { http: [network.provider] }
        }
      });

      const faucetAccount = privateKeyToAccount(
        LOCAL_NETWORK_FAUCET_PRIVATE_KEY as `0x${string}`
      );
      const client = createWalletClient({
        account: faucetAccount,
        chain,
        transport: http(network.provider)
      });

      await client.sendTransaction({
        to: account.address as `0x${string}`,
        value: parseEther('1')
      });

      toast.show("You've been funded", { type: 'success' });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Faucet request failed';
      toast.show(message, { type: 'danger' });
    } finally {
      setIsLoading(false);
    }
  }, [account?.address, network, show, toast]);

  if (!show) return null;

  return (
    <Pressable className="py-3" onPress={handlePress} disabled={isLoading}>
      <Text
        className="text-base font-[Poppins-SemiBold] text-center"
        style={{ color: colors.primary }}
      >
        {isLoading ? (
          'Sending…'
        ) : (
          <>
            Get{' '}
            <Text style={{ fontWeight: 'bold' }} className="font-extrabold">
              1 ETH
            </Text>
          </>
        )}
      </Text>
    </Pressable>
  );
}
