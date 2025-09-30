import React from 'react';

type Props = {
  children: React.ReactNode;
};

export default function Store({ children }: Props) {
  // With Zustand, we don't need a provider since stores are global
  // Persistence is handled automatically by the persist middleware
  return <>{children}</>;
}
