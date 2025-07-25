import { ethers } from '../../../patches/ethers';

export interface Wallet {
  address: string;
  privateKey: string;
}

/**
 * @notice hook to read and write mnemonic
 */
export const useWallet = () => {
  function createWallet() {
    let privateSeed = ethers.randomBytes(16);

    //2048 words
    const mnemonic = ethers.Mnemonic.entropyToPhrase(privateSeed);

    const hdnode = ethers.HDNodeWallet.fromPhrase(
      mnemonic,
      undefined,
      "m/44'/60'/0'/0/0"
    );

    return {
      mnemonic,
      address: hdnode.address,
      privateKey: hdnode.privateKey
    };
  }

  function importWallet(_mnemonic: string, _index: number) {
    const hdnode = ethers.HDNodeWallet.fromPhrase(
      _mnemonic,
      undefined,
      `m/44'/60'/0'/0/${_index}`
    );

    return {
      mnemonic: _mnemonic,
      address: hdnode.address,
      privateKey: hdnode.privateKey
    };
  }

  return {
    createWallet,
    importWallet
  };
};
