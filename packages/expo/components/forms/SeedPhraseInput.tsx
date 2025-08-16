import { COLORS, FONT_SIZE } from '@/utils/constants';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { TextInput } from 'react-native-paper';

type Props = {
  value?: string;
  infoText?: string | null;
  errorText?: string | null;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  onBlur?: () => void;
};

export default function SeedPhraseInput({
  value,
  infoText,
  errorText,
  onChange,
  onSubmit,
  onBlur
}: Props) {
  const [show, setShow] = useState(false);
  return (
    <View className="gap-y-2">
      <Text className="text-lg font-[Poppins]">Seed Phrase</Text>

      <View className="flex-row items-center">
        <TextInput
          mode="outlined"
          style={{ flex: 1, paddingRight: 55, paddingVertical: 5 }}
          contentStyle={{ fontSize: FONT_SIZE['lg'], fontFamily: 'Poppins' }}
          outlineStyle={{ borderRadius: 12, borderColor: COLORS.gray }}
          activeOutlineColor={COLORS.primary}
          value={value}
          secureTextEntry={!show}
          multiline={show}
          placeholder="Seed Phrase"
          onChangeText={onChange}
          onSubmitEditing={onSubmit}
          onBlur={onBlur}
          selectionColor={COLORS.primary}
          cursorColor="#303030"
        />
        <View className="flex-row gap-x-2 absolute right-2">
          {value && (
            <Ionicons
              name="close"
              color="#a3a3a3"
              size={FONT_SIZE['xl'] * 1.3}
              onPress={() => onChange('')}
            />
          )}
          <Ionicons
            name={show ? 'eye' : 'eye-off'}
            color="#a3a3a3"
            size={FONT_SIZE['xl'] * 1.3}
            onPress={() => setShow(!show)}
          />
        </View>
      </View>

      {infoText ? (
        <Text className="text-sm text-gray-500 font-[Poppins]">{infoText}</Text>
      ) : null}
      {errorText ? (
        <Text className="text-sm text-red-500 font-[Poppins]">{errorText}</Text>
      ) : null}
    </View>
  );
}
