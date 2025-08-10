import CustomButton from '@/components/buttons/CustomButton';
import { Blockie, CopyableText } from '@/components/eth-mobile';
import EditAccountNameForm from '@/components/forms/EditAccountNameForm';
import { useAccount } from '@/hooks/eth-mobile';
import { Account, removeAccount } from '@/store/reducers/Accounts';
import { COLORS, FONT_SIZE } from '@/utils/constants';
import Device from '@/utils/device';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useModal } from 'react-native-modalfy';
import QRCode from 'react-native-qrcode-svg';
import { useDispatch, useSelector } from 'react-redux';

type Props = {
  modal: {
    closeModal: () => void;
  };
};

export default function AccountDetailsModal({ modal: { closeModal } }: Props) {
  const dispatch = useDispatch();

  const accounts: Account[] = useSelector((state: any) => state.accounts);
  const connectedAccount: Account = useAccount();

  const { openModal } = useModal();

  const [isEditingAccountName, setIsEditingAccountName] = useState(false);

  const handleAccountRemoval = () => {
    closeModal();
    dispatch(removeAccount(connectedAccount.address));
  };

  return (
    <View
      className="bg-white rounded-3xl p-5"
      style={{ width: Device.getDeviceWidth() * 0.9 }}
    >
      <View className="flex-col items-center gap-4">
        <Blockie address={connectedAccount.address} size={FONT_SIZE.xl * 2.5} />
        {isEditingAccountName ? (
          <EditAccountNameForm close={() => setIsEditingAccountName(false)} />
        ) : (
          <View className="flex-row items-center gap-2">
            <Text className="text-2xl font-[Poppins]">
              {connectedAccount.name}
            </Text>
            <Ionicons
              name="pencil"
              size={FONT_SIZE.xl}
              onPress={() => setIsEditingAccountName(true)}
            />
          </View>
        )}

        <QRCode value={connectedAccount.address} size={12 * FONT_SIZE['xl']} />

        <CopyableText
          value={connectedAccount.address}
          containerStyle={styles.addressContainer}
          textStyle={styles.addressText}
        />

        <CustomButton
          text="Show private key"
          onPress={() => openModal('PrivateKeyModal')}
        />

        {accounts.length > 1 && (
          <CustomButton
            type="outline"
            text="Remove account"
            onPress={handleAccountRemoval}
            style={{ backgroundColor: COLORS.error }}
            labelStyle={{ color: 'white' }}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  addressContainer: {
    paddingHorizontal: 15,
    paddingVertical: 5,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    width: '100%'
  },
  addressText: {
    fontSize: FONT_SIZE.xl,
    width: '92%'
  }
});
