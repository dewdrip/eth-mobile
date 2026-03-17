import { useCallback, useState } from 'react';
import { signMessage as thirdwebSignMessage } from 'thirdweb/utils';
import { useAccount } from './useAccount';

export interface UseSignMessageReturn {
  sign: (message: string) => Promise<void>;
  signature: string | null;
  error: string | null;
  isSigning: boolean;
  reset: () => void;
}

/**
 * Hook for signing messages using the Thirdweb connected account.
 *
 * @returns An object with:
 * - sign: Function to sign a message
 * - signature: The signed message
 * - error: The error message
 * - isSigning: Boolean indicating if the message is being signed
 * - reset: Function to reset the signature and error
 * @example
 * const { sign } = useSignMessage();
 * await sign('Hello, world!');
 */
export function useSignMessage(): UseSignMessageReturn {
  const account = useAccount();
  const [signature, setSignature] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSigning, setIsSigning] = useState(false);

  const sign = useCallback(
    async (message: string) => {
      const trimmed = message?.trim();
      if (!account || !trimmed) return;
      setError(null);
      setSignature(null);
      setIsSigning(true);
      try {
        const sig = await thirdwebSignMessage({
          message: trimmed,
          account
        });
        setSignature(sig);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setIsSigning(false);
      }
    },
    [account]
  );

  const reset = useCallback(() => {
    setSignature(null);
    setError(null);
  }, []);

  return { sign, signature, error, isSigning, reset };
}
