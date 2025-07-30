import { COLORS, FONT_SIZE } from '@/utils/constants';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { TextStyle, View } from 'react-native';
import { Text, TextInput } from 'react-native-paper';

type Props = {
  label: string;
  value?: string;
  defaultValue?: string;
  infoText?: string | boolean | null;
  errorText?: string | boolean | null;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  labelStyle?: TextStyle;
};

export default function PasswordInput({
  label,
  value,
  defaultValue,
  infoText,
  errorText,
  onChange,
  onSubmit,
  labelStyle
}: Props) {
  const [show, setShow] = useState(false);

  return (
    <View className="gap-y-2">
      <Text
        className="text-lg font-semibold font-[Poppins-SemiBold]"
        style={labelStyle}
      >
        {label}
      </Text>

      <View className="flex-row items-center">
        <TextInput
          defaultValue={defaultValue}
          value={value}
          mode="outlined"
          outlineStyle={{ borderRadius: 12, borderColor: COLORS.gray }}
          activeOutlineColor={COLORS.primary}
          style={{ flex: 1, paddingRight: 55 }}
          contentStyle={{ fontSize: FONT_SIZE.lg, fontFamily: 'Poppins' }}
          left={<TextInput.Icon icon="lock" color="#a3a3a3" />}
          secureTextEntry={!show}
          placeholder="Password"
          onChangeText={onChange}
          onSubmitEditing={onSubmit}
        />

        <View className="flex-row gap-x-2 absolute right-4">
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
