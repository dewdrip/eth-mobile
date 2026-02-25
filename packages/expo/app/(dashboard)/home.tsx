import deployedContracts from '@/contracts/deployedContracts';
import {
  useAccount,
  useBalance,
  useDeployedContractInfo,
  useReadContract,
  useScaffoldContractEvent,
  useScaffoldReadContract,
  useScaffoldWriteContract,
  useSignMessage
} from '@/hooks/eth-mobile';
import { client } from '@/modules/providers/Thirdweb';
import Device from '@/utils/device';
import { Ionicons } from '@expo/vector-icons';
import { InterfaceAbi } from 'ethers';
import { Link } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View
} from 'react-native';
import { ConnectButton } from 'thirdweb/react';

function YourContractReads(props: { address: string; abi: InterfaceAbi }) {
  if (!props?.address) return null;
  const { address, abi } = props;
  const account = useAccount();
  const enabled = !!address && !!abi;

  const [greetingInput, setGreetingInput] = useState('');

  const {
    data: greetingChangeEvents,
    isLoading: eventsLoading,
    error: eventsError,
    refetch: refetchEvents
  } = useScaffoldContractEvent({
    contractName: 'YourContract',
    eventName: 'GreetingChange',
    fromBlock: 0n
  });

  const {
    data: greeting,
    isLoading: greetingLoading,
    error: greetingError,
    refetch: refetchGreeting
  } = useScaffoldReadContract({
    contractName: 'YourContract',
    functionName: 'greeting',
    enabled
  });

  const {
    data: userGreetingCounter,
    isLoading: userGreetingCounterLoading,
    error: userGreetingCounterError
  } = useScaffoldReadContract({
    contractName: 'YourContract',
    functionName: 'userGreetingCounter',
    args: account?.address ? [account.address as `0x${string}`] : undefined,
    enabled: enabled && !!account?.address
  });

  const {
    data: totalCounter,
    isLoading: counterLoading,
    error: counterError
  } = useReadContract({
    address,
    abi,
    functionName: 'totalCounter',
    enabled
  });

  const {
    data: premium,
    isLoading: premiumLoading,
    error: premiumError
  } = useReadContract({
    address,
    abi,
    functionName: 'premium',
    enabled
  });

  const { writeContractAsync, isLoading: isUpdatingGreeting } =
    useScaffoldWriteContract({
      contractName: 'YourContract'
    });

  const setGreeting = async () => {
    await writeContractAsync({
      functionName: 'setGreeting',
      args: [greetingInput.trim() || 'Hello World!']
    });
    refetchGreeting?.();
    refetchEvents?.();
    setGreetingInput('');
  };

  const loading =
    greetingLoading ||
    counterLoading ||
    premiumLoading ||
    userGreetingCounterLoading;
  const hasError =
    greetingError || counterError || premiumError || userGreetingCounterError;

  if (loading && greeting == null && totalCounter == null && premium == null) {
    return <ActivityIndicator size="small" color="#555" />;
  }

  return (
    <View className="gap-2">
      <View>
        <Text className="text-sm font-[Poppins] text-gray-600">greeting</Text>
        {greetingError ? (
          <Text className="text-base text-red-600">
            {String(greetingError)}
          </Text>
        ) : (
          <Text className="text-base font-[Poppins]">
            {greeting != null ? String(greeting) : '—'}
          </Text>
        )}
      </View>
      <View>
        <Text className="text-sm font-[Poppins] text-gray-600 mb-1">
          New greeting
        </Text>
        <TextInput
          value={greetingInput}
          onChangeText={setGreetingInput}
          placeholder="Enter greeting..."
          placeholderTextColor="#999"
          className="border border-gray-300 rounded-xl px-3 py-2.5 text-base font-[Poppins] bg-white"
          editable={!isUpdatingGreeting}
        />
        <Pressable
          onPress={setGreeting}
          disabled={isUpdatingGreeting}
          className="mt-2 py-2.5 px-4 bg-black rounded-xl active:opacity-80 disabled:opacity-50"
        >
          {isUpdatingGreeting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text className="text-center text-white font-[Poppins]">
              Set greeting
            </Text>
          )}
        </Pressable>
      </View>
      <View>
        <Text className="text-sm font-[Poppins] text-gray-600">
          userGreetingCounter
        </Text>
        {userGreetingCounterError ? (
          <Text className="text-base text-red-600">
            {String(userGreetingCounterError)}
          </Text>
        ) : (
          <Text className="text-base font-[Poppins]">
            {userGreetingCounter != null ? String(userGreetingCounter) : '—'}
          </Text>
        )}
      </View>
      <View>
        <Text className="text-sm font-[Poppins] text-gray-600">
          totalCounter
        </Text>
        {counterError ? (
          <Text className="text-base text-red-600">{String(counterError)}</Text>
        ) : (
          <Text className="text-base font-[Poppins]">
            {totalCounter != null ? String(totalCounter) : '—'}
          </Text>
        )}
      </View>
      <View>
        <Text className="text-sm font-[Poppins] text-gray-600">premium</Text>
        {premiumError ? (
          <Text className="text-base text-red-600">{String(premiumError)}</Text>
        ) : (
          <Text className="text-base font-[Poppins]">
            {premium != null ? String(premium) : '—'}
          </Text>
        )}
      </View>

      <View className="mt-3 pt-3 border-t border-gray-200">
        <Text className="text-sm font-[Poppins-Bold] text-gray-700 mb-2">
          GreetingChange events (Thirdweb)
        </Text>
        {(() => {
          const eventsList = (greetingChangeEvents ?? []) as any[];
          if (eventsLoading && eventsList.length === 0) {
            return <ActivityIndicator size="small" color="#555" />;
          }
          if (eventsError) {
            return (
              <Text className="text-sm text-red-600">
                {String(eventsError)}
              </Text>
            );
          }
          if (eventsList.length === 0) {
            return (
              <Text className="text-sm font-[Poppins] text-gray-500">
                No GreetingChange events yet.
              </Text>
            );
          }
          return (
            <View className="gap-3">
              {[...eventsList].reverse().map((event: any, index: number) => {
                const args = event.args ?? {};
                const blockNumber = event.blockNumber ?? event.log?.blockNumber;
                const txHash =
                  event.transactionHash ?? event.log?.transactionHash;
                const logIndex = event.logIndex ?? event.log?.logIndex ?? index;
                const key = txHash ? `${txHash}-${logIndex}` : `event-${index}`;
                const argEntries = Object.entries(args);
                return (
                  <View
                    key={key}
                    className="p-3 bg-white rounded-lg border border-gray-200"
                  >
                    {(blockNumber != null || txHash) && (
                      <View className="mb-2 pb-2 border-b border-gray-100">
                        {blockNumber != null && (
                          <Text className="text-xs font-[Poppins] text-gray-500">
                            Block: {String(blockNumber)}
                          </Text>
                        )}
                        {txHash && (
                          <Text
                            className="text-xs font-[Poppins] text-gray-500 mt-0.5"
                            numberOfLines={1}
                            ellipsizeMode="middle"
                          >
                            Tx: {String(txHash)}
                          </Text>
                        )}
                      </View>
                    )}
                    <Text className="text-xs font-[Poppins-Bold] text-gray-600 mb-1.5">
                      Event params
                    </Text>
                    <View className="gap-1">
                      {argEntries.length > 0 ? (
                        argEntries.map(([paramName, paramValue]) => {
                          const displayValue =
                            paramValue != null && typeof paramValue === 'bigint'
                              ? paramValue.toString()
                              : String(paramValue ?? '—');
                          const isAddress =
                            typeof paramValue === 'string' &&
                            paramValue.startsWith('0x') &&
                            paramValue.length === 42;
                          const shortValue = isAddress
                            ? `${displayValue.slice(0, 6)}...${displayValue.slice(-4)}`
                            : displayValue;
                          return (
                            <View
                              key={paramName}
                              className="flex-row flex-wrap gap-x-2"
                            >
                              <Text className="text-xs font-[Poppins] text-gray-500 min-w-[120px]">
                                {paramName}:
                              </Text>
                              <Text className="text-xs font-[Poppins] text-gray-800 flex-1">
                                {shortValue}
                              </Text>
                            </View>
                          );
                        })
                      ) : (
                        <Text className="text-xs font-[Poppins] text-gray-500">
                          No params
                        </Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          );
        })()}
      </View>

      {hasError && (
        <Text className="text-sm text-amber-600">
          One or more reads failed. Switch to the correct network and try again.
        </Text>
      )}
    </View>
  );
}

export default function Home() {
  const account = useAccount();
  const { data: yourContract, isLoading: contractLoading } =
    useDeployedContractInfo({ contractName: 'YourContract' });

  const {
    isLoading: balanceLoading,
    displayValue,
    symbol
  } = useBalance({ address: account?.address ?? '' });

  const [signMessageInput, setSignMessageInput] = useState('');
  const { sign, signature, error: signError, isSigning } = useSignMessage();

  const showContractSection = useMemo(() => {
    const chainIds = Object.keys(deployedContracts).map(Number);
    return chainIds.length > 0;
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="flex flex-row items-center justify-between px-4 py-2">
          <View className="flex flex-col gap-0.5">
            <Text className="text-2xl font-bold font-[Poppins-Bold]">
              ETH Mobile
            </Text>
            {account?.address && (
              <View className="flex flex-row items-center gap-1.5">
                {balanceLoading ? (
                  <ActivityIndicator size="small" color="#555" />
                ) : displayValue != null && symbol ? (
                  <Text className="text-sm font-[Poppins] text-gray-600">
                    {Number(displayValue).toFixed(4)} {symbol}
                  </Text>
                ) : null}
              </View>
            )}
          </View>

          <View className="flex flex-row items-center gap-x-3">
            <ConnectButton client={client} theme="light" />
            <Link href="/debugContracts" push asChild>
              <Ionicons
                name="bug-outline"
                size={Device.getDeviceWidth() * 0.07}
                color="#555"
              />
            </Link>

            <Link href="/wallet" push asChild>
              <Ionicons
                name="wallet-outline"
                size={Device.getDeviceWidth() * 0.07}
                color="#555"
              />
            </Link>

            <Link href="/settings" push asChild>
              <Ionicons
                name="settings-outline"
                size={Device.getDeviceWidth() * 0.07}
                color="#555"
              />
            </Link>
          </View>
        </View>

        {account?.address && (
          <View className="mx-4 mb-4 p-4 border border-gray-200 rounded-2xl bg-gray-50">
            <Text className="text-lg font-[Poppins-Bold] mb-3">
              Sign message (Thirdweb)
            </Text>
            <TextInput
              className="mb-3 rounded-lg border border-gray-200 bg-white px-3 py-2 text-base font-[Poppins] text-gray-800"
              placeholder="Enter message to sign..."
              placeholderTextColor="#9ca3af"
              value={signMessageInput}
              onChangeText={setSignMessageInput}
              editable={!isSigning}
            />
            <Pressable
              onPress={() => sign(signMessageInput)}
              disabled={isSigning || !signMessageInput.trim()}
              className="mb-3 rounded-lg bg-gray-800 py-2.5 active:opacity-80 disabled:opacity-50"
            >
              {isSigning ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text className="text-center font-[Poppins-SemiBold] text-white">
                  Sign message
                </Text>
              )}
            </Pressable>
            {signError && (
              <Text className="mb-2 text-sm font-[Poppins] text-red-600">
                {signError}
              </Text>
            )}
            {signature && (
              <View className="rounded-lg bg-gray-100 p-2">
                <Text className="text-xs font-[Poppins] text-gray-500">
                  Signature
                </Text>
                <Text
                  className="text-sm font-[Poppins] text-gray-800"
                  numberOfLines={3}
                  ellipsizeMode="middle"
                >
                  {signature}
                </Text>
              </View>
            )}
          </View>
        )}

        {showContractSection && (
          <View className="mx-4 mb-4 p-4 border border-gray-200 rounded-2xl bg-gray-50">
            <Text className="text-lg font-[Poppins-Bold] mb-3">
              YourContract (packages/hardhat/contracts/YourContract.sol)
            </Text>
            {contractLoading ? (
              <ActivityIndicator size="small" color="#555" />
            ) : !yourContract ? (
              <Text className="text-base font-[Poppins] text-gray-500">
                Switch to a network where YourContract is deployed (e.g. local
                chain 31337) to see live data.
              </Text>
            ) : yourContract?.address && yourContract?.abi ? (
              <YourContractReads
                address={yourContract.address}
                abi={yourContract.abi as InterfaceAbi}
              />
            ) : (
              <Text className="text-base font-[Poppins] text-gray-500">
                Switch to a network where YourContract is deployed (e.g. local
                chain 31337) to see live data.
              </Text>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
