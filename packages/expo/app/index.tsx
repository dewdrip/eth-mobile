import deployedContracts from '@/contracts/deployedContracts';
import {
  useAccount,
  useDeployedContractInfo,
  useNetwork,
  useScaffoldWriteContract
} from '@/hooks/eth-mobile';
import {
  HomeBetInput,
  HomeGameIntro,
  HomeGuessPicker,
  HomeLastResult,
  HomeLoading,
  HomeNoContract,
  HomePlayButton,
  HomePlayError,
  HomeWelcome,
  HomeWrongNetwork
} from '@/modules/home';
import { useTheme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { createPublicClient, decodeEventLog, http, parseEther } from 'viem';

const MAX_BET_ETH = '0.1';
const LOCAL_CHAIN_ID = 31337;

function getPlayErrorMessage(raw: string): string {
  const s = raw.toLowerCase();
  if (s.includes('invalidguess')) return 'Guess must be between 1 and 6.';
  if (s.includes('invalidbet'))
    return 'Bet must be greater than 0 and at most 0.1 ETH.';
  if (s.includes('insufficientcontractbalance'))
    return "Contract doesn't have enough to pay winners right now.";
  if (s.includes('transferfailed')) return 'Payout transfer failed.';
  if (s.includes('reject') || s.includes('denied') || s.includes('cancel'))
    return 'Transaction cancelled.';
  return raw || 'Transaction failed.';
}

export default function Home() {
  const { colors } = useTheme();
  const account = useAccount();
  const network = useNetwork();
  const { data: guessContract, isLoading: contractLoading } =
    useDeployedContractInfo({ contractName: 'LuckyGuess' });
  const { writeContractAsync: playAsync, isMining: isPlaying } =
    useScaffoldWriteContract({ contractName: 'LuckyGuess' });

  const [guess, setGuess] = useState<number>(1);
  const [betEth, setBetEth] = useState('');
  const [lastResult, setLastResult] = useState<{
    won: boolean;
    result: number;
    bet: string;
  } | null>(null);
  const [error, setError] = useState('');

  const hasGuessContract = useMemo(() => {
    const chainIds = Object.keys(deployedContracts).map(Number);
    return chainIds.some(
      id => (deployedContracts as any)[id]?.LuckyGuess != null
    );
  }, []);

  const isLocalNetwork = network?.id === LOCAL_CHAIN_ID;
  const canPlay =
    account?.address &&
    guessContract?.address &&
    isLocalNetwork &&
    hasGuessContract;

  const betWei = useMemo(() => {
    const v = betEth.trim();
    if (!v) return 0n;
    const n = parseFloat(v);
    if (isNaN(n) || n <= 0) return 0n;
    if (n > parseFloat(MAX_BET_ETH)) return -1n;
    try {
      return parseEther(v);
    } catch {
      return 0n;
    }
  }, [betEth]);

  const betValid = betWei > 0n && betWei <= parseEther(MAX_BET_ETH);

  const play = useCallback(async () => {
    if (!canPlay || !betValid || isPlaying) return;
    setError('');
    setLastResult(null);
    try {
      const result = (await playAsync({
        functionName: 'play',
        args: [guess],
        value: betWei
      })) as any;
      // Support both viem receipt and Thirdweb-style result (logs may be in different places)
      let logs =
        result?.logs ??
        result?.transaction?.logs ??
        result?.receipt?.logs ??
        [];
      // If no logs, try fetching receipt by hash (e.g. Thirdweb returns only hash)
      const txHash =
        result?.transactionHash ??
        result?.hash ??
        result?.receipt?.transactionHash;
      if (
        logs.length === 0 &&
        txHash &&
        network?.provider &&
        network?.id != null
      ) {
        try {
          const publicClient = createPublicClient({
            chain: {
              id: network.id,
              name: 'Local',
              nativeCurrency: { decimals: 18, name: 'ETH', symbol: 'ETH' },
              rpcUrls: { default: { http: [network.provider] } }
            },
            transport: http(network.provider)
          });
          const receipt = await publicClient.getTransactionReceipt({
            hash: txHash as `0x${string}`
          });
          logs = receipt?.logs ?? [];
        } catch {
          // ignore
        }
      }
      for (const log of logs) {
        try {
          const decoded = decodeEventLog({
            abi: guessContract!.abi as any,
            data: log.data,
            topics: log.topics
          });
          if ((decoded as any).eventName === 'Played') {
            const args = (decoded as any).args;
            if (args) {
              setLastResult({
                won: args.won,
                result: Number(args.result),
                bet: betEth
              });
            }
            break;
          }
        } catch {
          // skip non-Played logs
        }
      }
    } catch (e: any) {
      const raw =
        typeof e === 'string'
          ? e
          : (e?.message ?? e?.details ?? 'Transaction failed.');
      setError(getPlayErrorMessage(raw));
    }
  }, [
    canPlay,
    betValid,
    isPlaying,
    playAsync,
    guess,
    betWei,
    betEth,
    guessContract,
    network?.provider,
    network?.id
  ]);

  if (contractLoading && !guessContract) {
    return <HomeLoading />;
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        <Link href="/debugContracts" push asChild>
          <Pressable hitSlop={8} className="self-end m-4">
            <Ionicons name="bug-outline" size={24} color={colors.textMuted} />
          </Pressable>
        </Link>

        {!account?.address ? (
          <HomeWelcome />
        ) : !isLocalNetwork ? (
          <HomeWrongNetwork />
        ) : !guessContract?.address ? (
          <HomeNoContract />
        ) : (
          <>
            <HomeGameIntro />
            <HomeGuessPicker guess={guess} onGuessChange={setGuess} />
            <HomeBetInput
              value={betEth}
              onChange={t => {
                setBetEth(t);
                setError('');
              }}
            />
            {error ? <HomePlayError message={error} /> : null}
            <HomePlayButton
              onPress={play}
              disabled={!betValid}
              isLoading={isPlaying}
            />
            {lastResult ? (
              <HomeLastResult
                won={lastResult.won}
                result={lastResult.result}
                bet={lastResult.bet}
              />
            ) : null}
          </>
        )}
      </ScrollView>
    </View>
  );
}
