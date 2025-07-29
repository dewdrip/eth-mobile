import Clipboard from '@react-native-clipboard/clipboard';
import { useEffect, useState } from 'react';

export function useClipboard() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
  }, [copied]);

  const copy = (text: string) => {
    Clipboard.setString(text);
    setCopied(true);
  };

  return { copy, copied };
}
