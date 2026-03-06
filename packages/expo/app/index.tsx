import deployedContracts from '@/contracts/deployedContracts';
import {
  useAccount,
  useDeployedContractInfo,
  useNetwork,
  useScaffoldWriteContract
} from '@/hooks/eth-mobile';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View
} from 'react-native';
import { createPublicClient, decodeEventLog, http, parseEther } from 'viem';

const MAX_BET_ETH = '0.1';
const NUMBERS = [0, 1, 2, 3, 4, 5] as const;
const LOCAL_CHAIN_ID = 31337;

function getPlayErrorMessage(raw: string): string {
  const s = raw.toLowerCase();
  if (s.includes('invalidguess')) return 'Guess must be between 0 and 5.';
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
  const account = useAccount();
  const network = useNetwork();
  const { data: guessContract, isLoading: contractLoading } =
    useDeployedContractInfo({ contractName: 'GuessTheNumber' });
  const { writeContractAsync: playAsync, isMining: isPlaying } =
    useScaffoldWriteContract({ contractName: 'GuessTheNumber' });

  const [guess, setGuess] = useState<number>(0);
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
      id => (deployedContracts as any)[id]?.GuessTheNumber != null
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
    return (
      <View className="flex-1 items-center justify-center bg-[#0f0f12]">
        <ActivityIndicator size="large" color="#27B858" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#0f0f12]">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        <Link href="/debugContracts" push asChild>
          <Pressable hitSlop={8} className="self-end m-4">
            <Ionicons name="bug-outline" size={24} color="#666" />
          </Pressable>
        </Link>

        {!account?.address ? (
          <View className="mx-4 mt-6 flex-1 px-1">
            <View className="p-10">
              <Text className="text-center text-xl font-bold font-[Poppins-Bold] tracking-tight text-white">
                Welcome to
              </Text>
              <Text className="text-center text-3xl font-bold font-[Poppins-Bold] tracking-tight text-white">
                ETH Mobile
              </Text>
              <Text className="mt-4 text-center text-lg font-[Poppins-SemiBold] text-[#27B858]">
                Let's play a game.
              </Text>
              <View className="mt-6 rounded-2xl bg-[#1a1a1f] p-5">
                <Text className="text-center text-base leading-6 font-[Poppins] text-gray-300">
                  Guess the right number from{' '}
                  <Text className="font-[Poppins-SemiBold] text-white">
                    0–5
                  </Text>
                  , and I'll{' '}
                  <Text className="font-[Poppins-SemiBold] text-[#27B858]">
                    double your bet
                  </Text>
                  .
                </Text>
                <Text className="mt-3 text-center text-sm font-[Poppins] text-gray-500">
                  0 · 1 · 2 · 3 · 4 · 5
                </Text>
              </View>
              <Text className="mt-8 text-center text-2xl font-bold font-[Poppins-Bold] text-white">
                You in?
              </Text>
              <Text className="mt-3 text-center text-base font-[Poppins] text-gray-400">
                Connect your wallet to play —{' '}
                <Text className="font-[Poppins-SemiBold] text-[#27B858]">
                  Swipe the pill
                </Text>{' '}
                on the right →
              </Text>
              <View className="mt-8 flex-row justify-center">
                <View className="h-14 w-14 items-center justify-center rounded-full bg-[#27B858]/25">
                  <Ionicons name="wallet-outline" size={32} color="#27B858" />
                </View>
              </View>
            </View>
          </View>
        ) : !isLocalNetwork ? (
          <View className="mx-4 mt-8 rounded-2xl bg-[#1a1a1f] p-6">
            <Text className="text-center text-base font-[Poppins] text-gray-400">
              Switch to Local Network (Hardhat) in your wallet to play this
              game.
            </Text>
          </View>
        ) : !guessContract?.address ? (
          <View className="mx-4 mt-8 rounded-2xl bg-[#1a1a1f] p-6">
            <Text className="text-center text-base font-[Poppins] text-gray-400">
              Game contract not deployed on this network. Run deploy on local
              chain.
            </Text>
          </View>
        ) : (
          <>
            <View className="mx-4 mt-6 rounded-2xl bg-[#1a1a1f] p-5">
              <Text className="text-center text-sm font-[Poppins] text-gray-500">
                Pick 0–5. Bet up to 0.1 ETH. Double your bet if you win.
              </Text>
            </View>

            <View className="mx-4 mt-4 rounded-2xl bg-[#1a1a1f] p-5">
              <Text className="mb-3 text-sm font-[Poppins-SemiBold] text-gray-400">
                Your guess
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {NUMBERS.map(n => (
                  <Pressable
                    key={n}
                    onPress={() => setGuess(n)}
                    className="h-12 w-12 items-center justify-center rounded-xl border-2 border-[#2a2a30] bg-[#25252b]"
                    style={{
                      borderColor: guess === n ? '#27B858' : '#2a2a30',
                      backgroundColor:
                        guess === n ? 'rgba(39,184,88,0.12)' : '#25252b'
                    }}
                  >
                    <Text
                      className="text-lg font-bold font-[Poppins-Bold] text-white"
                      style={{ color: guess === n ? '#27B858' : '#fff' }}
                    >
                      {n}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View className="mx-4 mt-4 rounded-2xl bg-[#1a1a1f] p-5">
              <Text className="mb-2 text-sm font-[Poppins-SemiBold] text-gray-400">
                Bet (ETH)
              </Text>
              <TextInput
                value={betEth}
                onChangeText={t => {
                  setBetEth(t);
                  setError('');
                }}
                placeholder="0.01"
                placeholderTextColor="#555"
                keyboardType="decimal-pad"
                className="rounded-xl border border-[#2a2a30] bg-[#25252b] px-4 py-3.5 text-lg font-[Poppins] text-white"
                maxLength={10}
              />
              <Text className="mt-1.5 text-xs font-[Poppins] text-gray-500">
                Max {MAX_BET_ETH} ETH
              </Text>
            </View>

            {error ? (
              <View className="mx-4 mt-3 rounded-xl bg-red-500/15 px-4 py-2">
                <Text className="text-sm font-[Poppins] text-red-400">
                  {error}
                </Text>
              </View>
            ) : null}

            <View className="mx-4 mt-5">
              <Pressable
                onPress={play}
                disabled={!betValid || isPlaying}
                className="rounded-2xl py-4 active:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: '#27B858' }}
              >
                {isPlaying ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text className="text-center text-lg font-bold font-[Poppins-Bold] text-white">
                    Play
                  </Text>
                )}
              </Pressable>
            </View>

            {lastResult ? (
              <View
                className="mx-4 mt-6 rounded-2xl p-5"
                style={{
                  backgroundColor: lastResult.won
                    ? 'rgba(39,184,88,0.15)'
                    : 'rgba(239,68,68,0.12)'
                }}
              >
                <Text
                  className="text-center text-base font-[Poppins-SemiBold]"
                  style={{
                    color: lastResult.won ? '#27B858' : '#ef4444'
                  }}
                >
                  {lastResult.won
                    ? `You won! The number was ${lastResult.result}.`
                    : `You lost. The number was ${lastResult.result}.`}
                </Text>
                <Text className="mt-1 text-center text-sm font-[Poppins] text-gray-400">
                  Bet: {lastResult.bet} ETH
                </Text>
              </View>
            ) : null}
          </>
        )}
      </ScrollView>
    </View>
  );
}
