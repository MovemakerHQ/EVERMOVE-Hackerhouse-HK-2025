"use client";

import { useWallet } from "@aptos-labs/wallet-adapter-react";

export function useAptosWallet() {
  const wallet = useWallet();

  return {
    address: wallet.account?.address?.toString(),
    isConnected: wallet.connected,
    connect: wallet.connect,
    disconnect: wallet.disconnect,
    account: wallet.account,
    connected: wallet.connected,
  };
}
