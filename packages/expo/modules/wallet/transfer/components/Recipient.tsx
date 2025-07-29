import { Blockie } from '@/components/eth-mobile';
import ethmobileConfig from '@/ethmobile.config';
import { useAccount } from '@/hooks/eth-mobile';
import { Account } from '@/store/reducers/Accounts';
import { COLORS } from '@/utils/constants';
import { isENS } from '@/utils/eth-mobile';
import { FONT_SIZE } from '@/utils/styles';
import { isAddress, JsonRpcProvider } from 'ethers';
import React, { useState } from 'react';
import { Keyboard, Pressable, View } from 'react-native';
import { useModal } from 'react-native-modalfy';
import { Text, TextInput } from 'react-native-paper';
import { useSelector } from 'react-redux';

type Props = {
  recipient: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
};

export default function Recipient({ recipient, onChange, onSubmit }: Props) {
  const { openModal } = useModal();

  const accounts: Account[] = useSelector((state: any) => state.accounts);

  const [error, setError] = useState('');

  const account = useAccount();

  const scanQRCode = () => {
    Keyboard.dismiss();
    openModal('QRCodeScanner', {
      onScan: onChange
    });
  };

  const getAddressName = () => {
    const _recipient = accounts.find(
      account => account.address?.toLowerCase() === recipient?.toLowerCase()
    );

    if (!_recipient) return;
    return `(${_recipient.name})`;
  };

  const handleInputChange = async (value: string) => {
    onChange(value);

    if (error) {
      setError('');
    }

    if (isENS(value)) {
      try {
        const provider = new JsonRpcProvider(
          `https://eth-mainnet.alchemyapi.io/v2/${ethmobileConfig.networks.ethereum}`
        );

        const address = await provider.resolveName(value);

        if (address && isAddress(address)) {
          onChange(address);
        } else {
          setError('Invalid ENS');
        }
      } catch (error) {
        setError('Could not resolve ENS');
        return;
      }
    }
  };

  const selectAccount = () => {
    if (accounts.length > 1) {
      openModal('AccountsSelectionModal', {
        selectedAccount: recipient,
        onSelect: (account: Account) => onChange(account.address)
      });
    } else {
      onChange(account.address);
    }
  };
  return (
    <View className="mb-4">
      <View className="flex-row items-center mb-2 gap-x-2">
        <Text className="text-lg font-[Poppins]">To:</Text>
        <Pressable onPress={selectAccount}>
          <Text
            className="text-lg font-[Poppins]"
            style={{ color: COLORS.primary }}
          >
            My account
            <Text className="text-lg font-[Poppins]">{getAddressName()}</Text>
          </Text>
        </Pressable>
      </View>

      <TextInput
        value={recipient}
        mode="outlined"
        style={{ backgroundColor: '#f5f5f5' }}
        placeholder="Recipient Address"
        placeholderTextColor="#a3a3a3"
        textColor="black"
        onChangeText={handleInputChange}
        onSubmitEditing={onSubmit}
        left={
          isAddress(recipient) ? (
            <TextInput.Icon
              icon={() => (
                <Blockie address={recipient} size={1.8 * FONT_SIZE['xl']} />
              )}
            />
          ) : null
        }
        right={<TextInput.Icon icon="qrcode-scan" onPress={scanQRCode} />}
        error={!!error}
        outlineStyle={{ borderRadius: 12, borderColor: COLORS.gray }}
        contentStyle={{ fontFamily: 'Poppins' }}
      />
      {error && (
        <Text className="text-sm font-[Poppins] text-red-500 mt-1">
          {error}
        </Text>
      )}
    </View>
  );
}
