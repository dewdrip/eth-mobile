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
  HomeGuessButton,
  HomeGuessError,
  HomeGuessPicker,
  HomeLastResult,
  HomeLoading,
  HomeNoContract,
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

function getGuessErrorMessage(raw: string): string {
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
  const { writeContractAsync: playAsync, isMining: isGuessing } =
    useScaffoldWriteContract({ contractName: 'LuckyGuess' });

  const [selectedGuess, setSelectedGuess] = useState<number>(1);
  const [betEth, setBetEth] = useState('');
  const [error, setError] = useState('');

  const hasGuessContract = useMemo(() => {
    const chainIds = Object.keys(deployedContracts).map(Number);
    return chainIds.some(
      id => (deployedContracts as any)[id]?.LuckyGuess != null
    );
  }, []);

  const isLocalNetwork = network?.id === LOCAL_CHAIN_ID;
  const canGuess =
    account?.address &&
    guessContract?.address &&
    isLocalNetwork &&
    hasGuessContract;

  const { data: guessEvents } = useScaffoldContractEvent({
    contractName: 'LuckyGuess',
    eventName: 'Played',
    fromBlock: 0n,
    watch: true,
    enabled: true
  });

  const guessHistory = useMemo(() => {
    if (!guessEvents?.length || !account?.address) return [];
    const myAddress = account.address.toLowerCase();
    return guessEvents
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
  }, [guessEvents, account?.address]);

  const winsCount = useMemo(
    () => guessHistory.filter(r => r.won).length,
    [guessHistory]
  );
  const lossesCount = useMemo(
    () => guessHistory.filter(r => !r.won).length,
    [guessHistory]
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

  const guess = useCallback(async () => {
    if (!canGuess || !betValid || isGuessing) return;
    setError('');
    try {
      await playAsync({
        functionName: 'guess',
        args: [selectedGuess],
        value: betWei
      });
    } catch (e: any) {
      const raw =
        typeof e === 'string'
          ? e
          : (e?.message ?? e?.details ?? 'Transaction failed.');
      setError(getGuessErrorMessage(raw));
    }
  }, [canGuess, betValid, isGuessing, playAsync, selectedGuess, betWei]);

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
            <HomeGuessPicker
              guess={selectedGuess}
              onGuessChange={setSelectedGuess}
            />
            <HomeBetInput
              value={betEth}
              onChange={t => {
                setBetEth(t);
                setError('');
              }}
            />
            {error ? <HomeGuessError message={error} /> : null}
            <HomeGuessButton
              onPress={guess}
              disabled={!betValid}
              isLoading={isGuessing}
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
                {guessHistory.length === 0
                  ? 'No guesses yet. Wins and losses will appear here.'
                  : `${winsCount} win${winsCount !== 1 ? 's' : ''}, ${lossesCount} loss${lossesCount !== 1 ? 'es' : ''}`}
              </Text>
              {guessHistory.map((r, i) => (
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
