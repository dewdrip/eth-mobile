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
 * @returns {UseSignMessageReturn} sign, signature, error, isSigning, reset
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
