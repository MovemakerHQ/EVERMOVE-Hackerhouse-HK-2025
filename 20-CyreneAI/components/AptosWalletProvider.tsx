"use client";

import {
  AptosWalletAdapterProvider,
  useWallet,
} from "@aptos-labs/wallet-adapter-react";
import { PropsWithChildren } from "react";
import { Network } from "@aptos-labs/ts-sdk";

export function AptosWalletProvider({ children }: PropsWithChildren) {
  return (
    <AptosWalletAdapterProvider
      optInWallets={["Petra"]}
      autoConnect={true}
      dappConfig={{ network: Network.MAINNET }}
      onError={(error) => {
        console.log("error", error);
      }}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
}

// Export the useWallet hook directly
export { useWallet };
