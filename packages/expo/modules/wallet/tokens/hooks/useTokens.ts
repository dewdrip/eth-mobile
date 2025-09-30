import { useAccount, useNetwork } from '@/hooks/eth-mobile';
import { Token, useTokensStore } from '@/stores';
import { keccak256, toUtf8Bytes } from 'ethers';
import { useEffect, useState } from 'react';

export function useTokens() {
  const tokens = useTokensStore(state => state.tokens);
  const network = useNetwork();
  const account = useAccount();

  const [importedTokens, setImportedTokens] = useState<Token[]>();

  function setTokens() {
    if (!account?.address) {
      setImportedTokens([]);
      return;
    }

    const key = keccak256(
      toUtf8Bytes(`${network.id}${account.address.toLowerCase()}`)
    );
    setImportedTokens(tokens[key]);
  }

  useEffect(() => {
    setTokens();
  }, [network, account, tokens]);
  return {
    tokens: importedTokens
  };
}
