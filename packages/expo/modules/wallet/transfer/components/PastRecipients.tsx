import { Blockie } from '@/components/eth-mobile';
import { clearRecipients } from '@/store/reducers/Recipients';
import { truncateAddress } from '@/utils/eth-mobile';
import { FONT_SIZE } from '@/utils/styles';
import React from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

type Props = {
  onSelect: (recipient: string) => void;
};

export default function PastRecipients({ onSelect }: Props) {
  const recipients: string[] = useSelector((state: any) => state.recipients);
  const dispatch = useDispatch();

  const clear = () => {
    dispatch(clearRecipients());
  };

  return (
    <View className="mb-4">
      {recipients.length > 0 && (
        <>
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-[Poppins]">Recents</Text>
            <Pressable onPress={clear}>
              <Text className="text-lg font-[Poppins] text-primary">Clear</Text>
            </Pressable>
          </View>

          <FlatList
            keyExtractor={item => item}
            data={recipients}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => onSelect(item)}
                className="flex-row items-center mb-4"
              >
                <Blockie address={item} size={1.7 * FONT_SIZE['xl']} />
                <Text className="ml-2 text-lg font-[Poppins]">
                  {truncateAddress(item)}
                </Text>
              </Pressable>
            )}
          />
        </>
      )}
    </View>
  );
}
