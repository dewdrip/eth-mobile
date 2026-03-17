import Clipboard from '@react-native-clipboard/clipboard';
import { useEffect, useState } from 'react';

/**
 * For copying text to clipboard and tracking copy state.
 *
 * @returns An object with:
 *   - copy (function): Copies a string to clipboard and triggers `isCopied` for 2 seconds.
 *   - isCopied (boolean): True for 2 seconds immediately after `copy` is called.
 *
 * @example
 * const { copy, isCopied } = useClipboard();
 *
 * <Button onPress={() => copy("0x123...")}>Copy</Button>
 * {isCopied && <Text>Copied!</Text>}
 */

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
