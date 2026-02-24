import deployedContracts from '@/contracts/deployedContracts';
import {
  useAccount,
  useDeployedContractInfo,
  useReadContract,
  useScaffoldReadContract,
  useScaffoldWriteContract
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

function YourContractReads({
  address,
  abi
}: {
  address: string;
  abi: InterfaceAbi;
}) {
  const account = useAccount();
  const enable = !!address && !!abi;

  const [greetingInput, setGreetingInput] = useState('');

  const {
    data: greeting,
    isLoading: greetingLoading,
    error: greetingError,
    refetch: refetchGreeting
  } = useScaffoldReadContract({
    contractName: 'YourContract',
    functionName: 'greeting',
    enable
  });

  const {
    data: userGreetingCounter,
    isLoading: userGreetingCounterLoading,
    error: userGreetingCounterError
  } = useScaffoldReadContract({
    contractName: 'YourContract',
    functionName: 'userGreetingCounter',
    args: account?.address ? [account.address as `0x${string}`] : undefined,
    enable: enable && !!account?.address
  });

  const {
    data: totalCounter,
    isLoading: counterLoading,
    error: counterError
  } = useReadContract({
    address,
    abi,
    functionName: 'totalCounter',
    enable
  });

  const {
    data: premium,
    isLoading: premiumLoading,
    error: premiumError
  } = useReadContract({
    address,
    abi,
    functionName: 'premium',
    enable
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
      {hasError && (
        <Text className="text-sm text-amber-600">
          One or more reads failed. Switch to the correct network and try again.
        </Text>
      )}
    </View>
  );
}

export default function Home() {
  const { data: yourContract, isLoading: contractLoading } =
    useDeployedContractInfo({ contractName: 'YourContract' });

  const showContractSection = useMemo(() => {
    const chainIds = Object.keys(deployedContracts).map(Number);
    return chainIds.length > 0;
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="flex flex-row items-center justify-between px-4 py-2">
          <Text className="text-2xl font-bold font-[Poppins-Bold]">
            ETH Mobile
          </Text>

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
            ) : (
              <YourContractReads
                address={yourContract.address}
                abi={yourContract.abi as InterfaceAbi}
              />
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
