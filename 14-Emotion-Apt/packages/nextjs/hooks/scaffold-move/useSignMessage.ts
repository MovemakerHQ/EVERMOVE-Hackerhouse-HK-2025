import { useWallet } from "@aptos-labs/wallet-adapter-react";

export type TransactionResponseOnError = {
  transactionSubmitted: false;
  message: string;
};

const useSignMessage = (message: string) => {
  const { signMessage } = useWallet();
  const salt = crypto.getRandomValues(new Uint8Array(16)).toString();
  return signMessage({
    address: false,
    chainId: false,
    application: false,
    message: message,
    nonce: salt,
  });
};

export default useSignMessage;
