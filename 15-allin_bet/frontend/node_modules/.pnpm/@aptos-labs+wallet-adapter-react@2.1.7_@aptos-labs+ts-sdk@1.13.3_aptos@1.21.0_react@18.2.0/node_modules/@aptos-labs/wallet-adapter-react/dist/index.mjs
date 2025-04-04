// src/useWallet.tsx
import { createContext, useContext } from "react";
var DEFAULT_CONTEXT = {
  connected: false
};
var WalletContext = createContext(
  DEFAULT_CONTEXT
);
function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletContextState");
  }
  return context;
}

// src/WalletProvider.tsx
import {
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";
import { WalletCore } from "@aptos-labs/wallet-adapter-core";
import { jsx } from "react/jsx-runtime";
var initialState = {
  connected: false,
  account: null,
  network: null,
  wallet: null
};
var AptosWalletAdapterProvider = ({
  children,
  plugins,
  autoConnect = false,
  onError
}) => {
  const [{ connected, account, network, wallet }, setState] = useState(initialState);
  const [isLoading, setIsLoading] = useState(true);
  const walletCore = useMemo(() => new WalletCore(plugins), []);
  const [wallets, setWallets] = useState(
    walletCore.wallets
  );
  const connect = async (walletName) => {
    try {
      setIsLoading(true);
      await walletCore.connect(walletName);
    } catch (error) {
      console.log("connect error", error);
      if (onError)
        onError(error);
      return Promise.reject(error);
    } finally {
      setIsLoading(false);
    }
  };
  const disconnect = async () => {
    try {
      await walletCore.disconnect();
    } catch (error) {
      if (onError)
        onError(error);
      return Promise.reject(error);
    }
  };
  const signTransaction = async (transaction, asFeePayer, options) => {
    try {
      return await walletCore.signTransaction(transaction, asFeePayer, options);
    } catch (error) {
      if (onError)
        onError(error);
      return Promise.reject(error);
    }
  };
  const signMessage = async (message) => {
    try {
      return await walletCore.signMessage(message);
    } catch (error) {
      if (onError)
        onError(error);
      return Promise.reject(error);
    }
  };
  const signMessageAndVerify = async (message) => {
    try {
      return await walletCore.signMessageAndVerify(message);
    } catch (error) {
      if (onError)
        onError(error);
      return Promise.reject(error);
    }
  };
  const submitTransaction = async (transaction) => {
    try {
      return await walletCore.submitTransaction(transaction);
    } catch (error) {
      if (onError)
        onError(error);
      return Promise.reject(error);
    }
  };
  const signAndSubmitTransaction = async (transaction) => {
    try {
      return await walletCore.signAndSubmitTransaction(transaction);
    } catch (error) {
      if (onError)
        onError(error);
      return Promise.reject(error);
    }
  };
  useEffect(() => {
    if (autoConnect) {
      if (localStorage.getItem("AptosWalletName")) {
        connect(localStorage.getItem("AptosWalletName"));
      } else {
        setIsLoading(false);
      }
    }
  }, wallets);
  useEffect(() => {
    if (connected) {
      walletCore.onAccountChange();
      walletCore.onNetworkChange();
    }
  }, [...wallets, connected]);
  const handleConnect = () => {
    setState((state) => {
      return {
        ...state,
        connected: true,
        account: walletCore.account,
        network: walletCore.network,
        wallet: walletCore.wallet
      };
    });
  };
  const handleDisconnect = () => {
    if (!connected)
      return;
    setState((state) => {
      return {
        ...state,
        connected: false,
        account: walletCore.account,
        network: walletCore.network,
        wallet: null
      };
    });
  };
  const handleAccountChange = useCallback(() => {
    if (!connected)
      return;
    if (!walletCore.wallet)
      return;
    setState((state) => {
      return {
        ...state,
        account: walletCore.account
      };
    });
  }, [connected]);
  const handleNetworkChange = useCallback(() => {
    if (!connected)
      return;
    if (!walletCore.wallet)
      return;
    setState((state) => {
      return {
        ...state,
        network: walletCore.network
      };
    });
  }, [connected]);
  const handleReadyStateChange = (wallet2) => {
    setWallets((wallets2) => [...wallets2]);
  };
  useEffect(() => {
    walletCore.on("connect", handleConnect);
    walletCore.on("disconnect", handleDisconnect);
    walletCore.on("accountChange", handleAccountChange);
    walletCore.on("networkChange", handleNetworkChange);
    walletCore.on("readyStateChange", handleReadyStateChange);
    return () => {
      walletCore.off("connect", handleConnect);
      walletCore.off("disconnect", handleDisconnect);
      walletCore.off("accountChange", handleAccountChange);
      walletCore.off("networkChange", handleNetworkChange);
      walletCore.off("readyStateChange", handleReadyStateChange);
    };
  }, [...wallets, connected]);
  return /* @__PURE__ */ jsx(WalletContext.Provider, {
    value: {
      connect,
      account,
      network,
      connected,
      disconnect,
      wallet,
      wallets,
      signAndSubmitTransaction,
      signTransaction,
      signMessage,
      signMessageAndVerify,
      isLoading,
      submitTransaction
    },
    children
  });
};

// src/index.tsx
import {
  WalletReadyState,
  NetworkName,
  isInAppBrowser,
  isMobile,
  isRedirectable
} from "@aptos-labs/wallet-adapter-core";
export {
  AptosWalletAdapterProvider,
  NetworkName,
  WalletReadyState,
  isInAppBrowser,
  isMobile,
  isRedirectable,
  useWallet
};
