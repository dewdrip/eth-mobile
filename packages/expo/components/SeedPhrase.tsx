import { COLORS } from '@/utils/constants';
import { BlurView } from '@react-native-community/blur';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-paper';

type Props = {
  seedPhrase: string | undefined;
  onReveal?: () => void;
};

export default function SeedPhrase({ seedPhrase, onReveal }: Props) {
  const [show, setShow] = useState(false);

  const reveal = () => {
    setShow(true);
    if (!onReveal) return;
    onReveal();
  };
  return (
    <View
      className="w-full border-2 rounded-2xl p-4"
      style={{ borderColor: COLORS.primary }}
    >
      <View className="flex-row flex-wrap justify-between items-center w-full">
        {seedPhrase?.split(' ').map((word, index) => (
          <Text
            key={word}
            className="w-[45%] p-2 bg-gray-100 rounded-2xl text-center font-bold mb-2 font-[Poppins]"
          >
            {index + 1}. {word}
          </Text>
        ))}
      </View>

      {!show && (
        <>
          <BlurView
            style={styles.blurView}
            blurType="light"
            blurAmount={6}
            reducedTransparencyFallbackColor="white"
          />
          <View className="absolute top-0 left-0 right-0 bottom-0 justify-center items-center gap-y-2">
            <Text className="text-lg font-[Poppins]">
              Tap to reveal your seed phrase
            </Text>
            <Text className="text-sm text-gray-500 font-[Poppins]">
              Make sure no one is watching your screen
            </Text>
            <Button
              mode="contained"
              icon="eye"
              onPress={reveal}
              style={styles.viewButton}
              labelStyle={{
                color: 'white',
                fontSize: 16,
                fontFamily: 'Poppins'
              }}
            >
              View
            </Button>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  blurView: {
    position: 'absolute',
    top: -20,
    left: -20,
    bottom: -20,
    right: -20
  },
  viewButton: {
    marginTop: 8,
    borderRadius: 25,
    backgroundColor: '#2AB858'
  }
});
