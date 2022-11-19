import './App.css';
import Router from './pages';

import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { chain, configureChains, createClient, WagmiConfig } from "wagmi";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import { publicProvider } from "wagmi/providers/public";

const { chains, provider } = configureChains(
  [{
    id: 42220,
    name: 'Celo Mainnet',
    network: 'celo mainnet',
    iconUrl: process.env.REACT_APP_CELO_ICON,
    iconBackground: '#fff',
    nativeCurrency: {
      decimals: 18,
      name: 'celo',
      symbol: 'CELO',
    },
    rpcUrls: {
      default: process.env.REACT_APP_CELO_RPC,
    },
    blockExplorers: {
      default: { name: 'CeloScan', url: 'https://celoscan.io' },
      etherscan: { name: 'CeloScan', url: 'https://celoscan.io' },
    },
    testnet: false,
  }, {
    id: 44787,
    name: 'Alfajores',
    network: 'alfajores',
    iconUrl: process.env.REACT_APP_CELO_ICON,
    iconBackground: '#fff',
    nativeCurrency: {
      decimals: 18,
      name: 'celo',
      symbol: 'CELO',
    },
    rpcUrls: {
      default: process.env.REACT_APP_ALFAJORES_RPC,
    },
    blockExplorers: {
      default: { name: 'CeloScan', url: 'https://alfajores.celoscan.io' },
      etherscan: { name: 'CeloScan', url: 'https://alfajores.celoscan.io' },
    },
    testnet: true,
  },
  chain.hardhat
],
  [jsonRpcProvider({ rpc: chain => ({ http: chain.rpcUrls.default }) }), publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: "My RainbowKit App",
  chains
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider
});


function App() {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>
        <Router />
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default App;
