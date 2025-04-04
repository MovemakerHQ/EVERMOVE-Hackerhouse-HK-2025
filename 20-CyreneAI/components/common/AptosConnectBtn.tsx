"use client";

import { useWallet } from "@aptos-labs/wallet-adapter-react";

export default function AptosConnectBtn() {
  const { connect, disconnect, account, connected } = useWallet();

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

  const formatAddress = (address: string | undefined) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div>
      {connected ? (
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            {formatAddress(account?.address?.toString())}
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
