"use client";

import { useAptosWallet } from "@/hooks/useAptosWallet";
import { AccountAddress } from "@aptos-labs/ts-sdk";

export function AptosConnectBtn() {
  const { connect, disconnect, account, connected } = useAptosWallet();

  const handleConnect = async () => {
    try {
      await connect("Petra");
      console.log("Connected to wallet:", account);
    } catch (error) {
      console.error("Failed to connect to wallet:", error);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      console.log("Disconnected from wallet");
    } catch (error) {
      console.error("Failed to disconnect from wallet:", error);
    }
  };

  const formatAddress = (address: AccountAddress | undefined) => {
    if (!address) return "";
    const addressStr = address.toString();
    return `${addressStr.slice(0, 6)}...${addressStr.slice(-4)}`;
  };

  return (
    <div>
      {connected ? (
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            {formatAddress(account?.address)}
          </span>
          <button
            onClick={handleDisconnect}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={handleConnect}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Connect Petra Wallet
        </button>
      )}
    </div>
  );
}
