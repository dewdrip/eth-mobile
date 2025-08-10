import { Blockie } from '@/components/eth-mobile';
import { ConsentModalParams } from '@/components/modals/ConsentModal';
import { clearRecipients } from '@/store/reducers/Recipients';
import { COLORS, FONT_SIZE } from '@/utils/constants';
import { truncateAddress } from '@/utils/eth-mobile';
import React from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { useModal } from 'react-native-modalfy';
import { useDispatch, useSelector } from 'react-redux';

type Props = {
  onSelect: (recipient: string) => void;
};

export default function PastRecipients({ onSelect }: Props) {
  const recipients: string[] = useSelector((state: any) => state.recipients);
  const dispatch = useDispatch();

  const { openModal } = useModal();

  const clear = () => {
    const params: ConsentModalParams = {
      title: 'Clear Past Recipients',
      description:
        'This will erase all your past recipients. Are you sure you want to go through with this?',
      iconColor: COLORS.error,
      titleStyle: { color: COLORS.error },
      okButtonStyle: { backgroundColor: COLORS.error },
      onAccept: () => dispatch(clearRecipients())
    };

    openModal('ConsentModal', params);
  };

  return (
    <View className="mb-4">
      {recipients.length > 0 && (
        <>
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-semibold font-[Poppins-SemiBold]">
              Recents
            </Text>
            <Pressable onPress={clear}>
              <Text className="text-lg font-[Poppins] text-red-500">Clear</Text>
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
