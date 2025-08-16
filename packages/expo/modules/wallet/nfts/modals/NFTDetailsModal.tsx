import Button from '@/components/buttons/CustomButton';
import { useAccount, useNetwork } from '@/hooks/eth-mobile';
import { removeNFT } from '@/store/reducers/NFTs';
import { COLORS, FONT_SIZE } from '@/utils/constants';
import { parseIPFS } from '@/utils/eth-mobile';
import { Ionicons } from '@expo/vector-icons';
import { Address } from 'abitype';
import React, { useEffect, useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { useDispatch } from 'react-redux';

type Props = {
  modal: {
    closeModal: () => void;
    params: {
      nft: {
        address: Address;
        name: string;
        symbol: string;
        id: number;
        uri: string;
      };
      onSend: () => void;
    };
  };
};

export default function NFTDetailsModal({
  modal: {
    closeModal,
    params: { nft, onSend }
  }
}: Props) {
  const dispatch = useDispatch();
  const network = useNetwork();
  const account = useAccount();

  const [image, setImage] = useState('');

  const send = () => {
    closeModal();
    onSend();
  };

  const remove = () => {
    closeModal();
    dispatch(
      removeNFT({
        networkId: network.id,
        accountAddress: account.address,
        nftAddress: nft.address,
        tokenId: nft.id
      })
    );
  };

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const _nftURI = parseIPFS(nft.uri);
        const _nft = await (await fetch(_nftURI)).json();

        if (_nft) {
          const imageURI = _nft.image.replace(
            'https://ipfs.io/ipfs/',
            'https://api.universalprofile.cloud/ipfs/'
          );

          setImage(imageURI);
        }
      } catch (error) {
        error;
      }
    };
    fetchImage();
  }, [nft]);

  return (
    <Pressable
      onPress={closeModal}
      className="bg-transparent flex-1 items-center justify-between w-[90%]"
    >
      <View className="w-[97%] h-[90%] bg-cyan-500 mt-5">
        {image && (
          <Image
            source={{ uri: image }}
            className="w-full h-full"
            resizeMode="cover"
          />
        )}
      </View>

      <View className="bg-white w-[90%] p-5">
        <Text className="text-2xl font-medium">
          {nft.name} #{Number(nft.id).toLocaleString('en-US')}
        </Text>

        <View className="flex-row justify-between items-center mt-5">
          <Button
            type="outline"
            text="Send"
            onPress={send}
            style={{ width: '90%' }}
          />
          <Ionicons
            name="trash-outline"
            size={FONT_SIZE.xl * 1.5}
            color={COLORS.primary}
            onPress={remove}
          />
        </View>
      </View>
    </Pressable>
  );
}
