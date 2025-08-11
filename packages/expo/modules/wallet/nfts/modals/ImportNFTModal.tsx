import Button from '@/components/buttons/CustomButton';
import { useAccount, useERC721Metadata, useNetwork } from '@/hooks/eth-mobile';
import { useNFTs } from '@/modules/wallet/nfts/hooks/useNFTs';
import { addNFT } from '@/store/reducers/NFTs';
import { COLORS, FONT_SIZE } from '@/utils/constants';
import { Ionicons } from '@expo/vector-icons';
import { Address } from 'abitype';
import { ethers } from 'ethers';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TextInput } from 'react-native-paper';
import { useToast } from 'react-native-toast-notifications';
import { useDispatch } from 'react-redux';

type Props = {
  modal: {
    closeModal: () => void;
  };
};

export default function ImportNFTModal({ modal: { closeModal } }: Props) {
  const [address, setAddress] = useState<string | undefined>(undefined);
  const [tokenId, setTokenId] = useState<string | undefined>(undefined);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [tokenIdError, setTokenIdError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState<boolean>(false);

  const account = useAccount();
  const network = useNetwork();

  const dispatch = useDispatch();

  const { getERC721Metadata } = useERC721Metadata();

  const { nftExists } = useNFTs();

  const toast = useToast();

  const importNFT = async () => {
    try {
      if (!ethers.isAddress(address)) {
        setAddressError('Invalid address');
        return;
      }

      if (!tokenId) {
        setTokenIdError('Invalid token id');
        return;
      }

      if (nftExists(address, Number(tokenId))) {
        toast.show('Token already exists!', {
          type: 'warning'
        });
        return;
      }

      if (addressError || tokenIdError) {
        setAddressError(null);
        setTokenIdError(null);
      }

      setIsImporting(true);

      const nftMetadata = await getERC721Metadata(
        address as Address,
        tokenId as Address
      );

      const payload = {
        networkId: network.id,
        accountAddress: account.address,
        nft: {
          address: address as Address,
          name: nftMetadata?.name,
          symbol: nftMetadata?.symbol,
          tokenId: tokenId as Address,
          tokenURI: nftMetadata?.tokenURI
        }
      };

      closeModal();
      dispatch(addNFT(payload));
    } catch (error) {
      console.error(error);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <View className="bg-white rounded-3xl p-5 m-5 w-[90%]">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-2xl font-[Poppins]">Import NFT</Text>
        <Ionicons
          name="close-outline"
          size={FONT_SIZE['xl'] * 1.7}
          onPress={closeModal}
        />
      </View>

      <View className="gap-4">
        <View className="gap-2">
          <Text className="text-lg font-[Poppins]">Address</Text>
          <TextInput
            value={address}
            mode="outlined"
            outlineColor={COLORS.primary}
            activeOutlineColor={COLORS.primary}
            outlineStyle={{ borderRadius: 12, borderColor: COLORS.gray }}
            contentStyle={{ fontFamily: 'Poppins' }}
            placeholder={'0x...'}
            placeholderTextColor="#a3a3a3"
            textColor="black"
            onChangeText={setAddress}
            onSubmitEditing={importNFT}
          />
          {addressError ? (
            <Text className="text-sm font-[Poppins] text-red-500">
              {addressError}
            </Text>
          ) : null}
        </View>

        <View className="gap-2">
          <Text className="text-lg font-[Poppins]">Token ID</Text>
          <TextInput
            value={tokenId}
            mode="outlined"
            outlineColor={COLORS.primary}
            activeOutlineColor={COLORS.primary}
            outlineStyle={{ borderRadius: 12, borderColor: COLORS.gray }}
            contentStyle={{ fontFamily: 'Poppins' }}
            placeholder={'Enter the token id'}
            placeholderTextColor="#a3a3a3"
            textColor="black"
            onChangeText={setTokenId}
            onSubmitEditing={importNFT}
          />
          {tokenIdError ? (
            <Text className="text-sm font-[Poppins] text-red-500">
              {tokenIdError}
            </Text>
          ) : null}
        </View>

        <View className="flex-row gap-4">
          <Button
            type="outline"
            text="Cancel"
            onPress={closeModal}
            style={styles.button}
          />
          <Button
            text="Import"
            onPress={importNFT}
            loading={isImporting}
            disabled={isImporting}
            style={styles.button}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: 10,
    width: '50%'
  }
});
