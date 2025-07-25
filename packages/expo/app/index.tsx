import Device from '@/utils/device';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';

function HighlightedText({ children }: { children: string }) {
  return (
    <View className="bg-green-100 py-1 rounded-full px-4">
      <Text className="text-center text-lg font-[Poppins]">{children}</Text>
    </View>
  );
}

export default function index() {
  const router = useRouter();
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView>
        <View className="flex flex-row items-center justify-between px-4 py-2">
          <Text className="text-2xl font-bold font-[Poppins-Bold]">
            ETH Mobile
          </Text>

          <View className="flex flex-row items-center gap-x-5">
            <Ionicons
              name="bug-outline"
              size={Device.getDeviceWidth() * 0.07}
              color="#555"
              onPress={() => router.push('/debugContracts')}
            />
            <Ionicons
              name="wallet-outline"
              size={Device.getDeviceWidth() * 0.07}
              color="#555"
            />
            <Ionicons
              name="settings-outline"
              size={Device.getDeviceWidth() * 0.07}
              color="#555"
            />
          </View>
        </View>

        <View className="items-center p-8 gap-y-2">
          <Text className="text-3xl text-center mb-4 font-[Poppins]">
            The Building Blocks of Mobile dApps
          </Text>

          <Text className="text-xl font-[Poppins]">Get started by editing</Text>
          <HighlightedText>packages/expo/app</HighlightedText>

          <View className="flex-row items-center gap-x-1 max-w-full mt-2">
            <Text className="text-lg font-[Poppins]">
              Edit your smart contract in
            </Text>
          </View>
          <View className="flex-row items-center gap-x-1 max-w-full">
            <HighlightedText>packages/hardhat/contracts</HighlightedText>
          </View>
        </View>

        <View className="flex-1 pb-4 justify-center items-center gap-4">
          <View className="items-center py-8 w-[90%] border border-gray-300 rounded-3xl bg-white gap-4">
            <Ionicons
              name="bug-outline"
              color="grey"
              size={Device.getDeviceWidth() * 0.09}
            />

            <Text className="text-center text-xl w-[60%] font-[Poppins]">
              Tinker with your smart contracts in
              <Text
                className="underline text-lg"
                onPress={() => router.push('/debugContracts')}
              >
                {' '}
                DebugContracts
              </Text>
            </Text>
          </View>

          <View className="items-center py-8 w-[90%] border border-gray-300 rounded-3xl bg-white gap-4">
            <Ionicons
              name="wallet-outline"
              color="grey"
              size={Device.getDeviceWidth() * 0.09}
            />

            <Text className="text-center text-xl w-[60%] font-[Poppins]">
              Manage your accounts, funds, and tokens in your
              <Text className="underline text-lg font-bold"> Wallet</Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
