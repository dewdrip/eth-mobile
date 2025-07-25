import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import globalStyles from '../styles/globalStyles';
import { FONT_SIZE } from '../utils/styles';
import BackButton from './buttons/BackButton';

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  return (
    <View style={styles.container}>
      <BackButton />
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: 'grey'
  },
  title: {
    fontSize: FONT_SIZE.xl,
    ...globalStyles.textBold,
    marginBottom: -5
  }
});
