import Clipboard from '@react-native-clipboard/clipboard';
import { useEffect, useState } from 'react';

export function useClipboard() {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isCopied) {
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    }
  }, [isCopied]);

  const copy = (text: string) => {
    Clipboard.setString(text);
    setIsCopied(true);
  };

  return { copy, isCopied };
}
