import { createThirdwebClient } from 'thirdweb';
import { ThirdwebProvider } from 'thirdweb/react';

const clientId = process.env.EXPO_PUBLIC_THIRDWEB_CLIENT_ID!;

if (!clientId) {
  throw new Error(
    'Missing EXPO_PUBLIC_THIRDWEB_CLIENT_ID - make sure to set it in your .env file'
  );
}

export const client = createThirdwebClient({
  clientId
});

export default function Thirdweb({ children }: { children: React.ReactNode }) {
  return <ThirdwebProvider>{children}</ThirdwebProvider>;
}
