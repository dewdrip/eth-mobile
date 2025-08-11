import React from 'react';
import { ToastProvider as Provider } from 'react-native-toast-notifications';

type Props = {
  children: React.ReactNode;
};

export default function ToastProvider({ children }: Props) {
  return <Provider>{children}</Provider>;
}
