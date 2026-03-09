import { createThirdwebClient } from 'thirdweb';
import { ThirdwebProvider } from 'thirdweb/react';

const clientId =
  process.env.EXPO_PUBLIC_THIRDWEB_CLIENT_ID ||
  'a1362670597ae044c2f45ba78f9472ae';

export const client = createThirdwebClient({
  clientId
});

export default function Thirdweb({ children }: { children: React.ReactNode }) {
  return <ThirdwebProvider>{children}</ThirdwebProvider>;
}
