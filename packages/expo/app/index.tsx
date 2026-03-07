import deployedContracts from '@/contracts/deployedContracts';
import {
  useAccount,
  useDeployedContractInfo,
  useNetwork,
  useScaffoldContractEvent,
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
import { Pressable, ScrollView, Text, View } from 'react-native';
import { formatEther, parseEther } from 'viem';

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

  const { data: playEvents } = useScaffoldContractEvent({
    contractName: 'LuckyGuess',
    eventName: 'Played',
    fromBlock: 0n,
    watch: true,
    enabled: true
  });

  const playHistory = useMemo(() => {
    if (!playEvents?.length || !account?.address) return [];
    const myAddress = account.address.toLowerCase();
    return playEvents
      .filter(
        e =>
          e.args &&
          String(
            (e.args as any).player ?? (e.args as any)[0] ?? ''
          ).toLowerCase() === myAddress
      )
      .map(e => {
        const a = e.args as any;
        const won = Boolean(a?.won ?? a?.[4]);
        const result = Number(a?.result ?? a?.[2] ?? 0);
        const betWei = a?.bet ?? a?.[3] ?? 0n;
        const betStr =
          typeof betWei === 'bigint' ? formatEther(betWei) : String(betWei);
        return { won, result, bet: betStr };
      })
      .reverse();
  }, [playEvents, account?.address]);

  const winsCount = useMemo(
    () => playHistory.filter(r => r.won).length,
    [playHistory]
  );
  const lossesCount = useMemo(
    () => playHistory.filter(r => !r.won).length,
    [playHistory]
  );

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
    try {
      await playAsync({
        functionName: 'play',
        args: [guess],
        value: betWei
      });
    } catch (e: any) {
      const raw =
        typeof e === 'string'
          ? e
          : (e?.message ?? e?.details ?? 'Transaction failed.');
      setError(getPlayErrorMessage(raw));
    }
  }, [canPlay, betValid, isPlaying, playAsync, guess, betWei]);

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
            <View className="mt-6">
              <Text
                className="mb-2 px-4 text-sm font-[Poppins-SemiBold]"
                style={{ color: colors.textMuted }}
              >
                History
              </Text>
              <Text
                className="mb-3 px-4 text-xs font-[Poppins]"
                style={{ color: colors.textMutedAlt }}
              >
                {playHistory.length === 0
                  ? 'No plays yet. Wins and losses will appear here.'
                  : `${winsCount} win${winsCount !== 1 ? 's' : ''}, ${lossesCount} loss${lossesCount !== 1 ? 'es' : ''}`}
              </Text>
              {playHistory.map((r, i) => (
                <View key={i} className="mt-2">
                  <HomeLastResult won={r.won} result={r.result} bet={r.bet} />
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}
