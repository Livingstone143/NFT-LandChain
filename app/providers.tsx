'use client';

import { WagmiConfig, createClient, configureChains } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';

const { chains, provider, webSocketProvider } = configureChains(
  [sepolia],
  [publicProvider()]
);

const client = createClient({
  autoConnect: true,
  provider,
  webSocketProvider,
  connectors: [
    new MetaMaskConnector({
      chains,
    }),
  ],
});

export function Providers({ children }: { children: React.ReactNode }) {
  return <WagmiConfig client={client}>{children}</WagmiConfig>;
} 