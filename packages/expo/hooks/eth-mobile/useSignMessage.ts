import { Account } from '@/store/reducers/Wallet';
import { getParsedError } from '@/utils/eth-mobile';
import { JsonRpcProvider, Wallet } from 'ethers';
import { useModal } from 'react-native-modalfy';
import { useSelector } from 'react-redux';
import { useAccount, useNetwork } from '.';

interface UseSignMessageConfig {
  message?: string | Uint8Array<ArrayBufferLike>;
}

interface UseSignMessageReturn {
  signMessage: (config?: UseSignMessageConfig) => Promise<string>;
}

/**
 * Hook for signing messages using the connected wallet.
 *
 * @param {UseSignMessageConfig} config - Optional configuration.
 * @param {string} [config.message] - Default message to sign (can be overridden).
 * @returns {UseSignMessageReturn} An object containing the `signMessage` function.
 */
export function useSignMessage({
  message
}: UseSignMessageConfig = {}): UseSignMessageReturn {
  const { openModal } = useModal();
  const network = useNetwork();
  const connectedAccount = useAccount();
  const wallet = useSelector((state: any) => state.wallet);

  /**
   * Signs a message using the connected wallet.
   *
   * @param {UseSignMessageConfig} [config] - Optional override for the default message.
   * @returns {Promise<string>} A promise that resolves to the signed message.
   * @throws {Error} If signing fails or is rejected.
   */
  const signMessage = async (
    config?: UseSignMessageConfig
  ): Promise<string> => {
    const messageToSign = config?.message || message;
    if (!messageToSign) {
      throw new Error('No message provided for signing.');
    }

    return new Promise((resolve, reject) => {
      openModal('SignMessageModal', {
        message: messageToSign,
        onReject,
        onConfirm
      });

      function onReject() {
        reject(new Error('Message signing was rejected.'));
      }

      async function onConfirm() {
        try {
          const provider = new JsonRpcProvider(network.provider);

          if (!wallet.accounts || !Array.isArray(wallet.accounts)) {
            throw new Error('No accounts found in secure storage.');
          }

          const activeAccount = wallet.accounts.find(
            (account: Account) =>
              account.address.toLowerCase() ===
              connectedAccount.address.toLowerCase()
          );

          if (!activeAccount) {
            throw new Error('Active account not found.');
          }

          const activeWallet = new Wallet(activeAccount.privateKey, provider);
          const signature = await activeWallet.signMessage(messageToSign!);
          resolve(signature);
        } catch (error) {
          reject(getParsedError(error));
        }
      }
    });
  };

  return { signMessage };
}
