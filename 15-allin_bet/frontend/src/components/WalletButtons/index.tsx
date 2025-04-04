"use client";

import {
  useWallet,
  WalletReadyState,
  Wallet,
  isRedirectable,
  WalletName,
} from "@aptos-labs/wallet-adapter-react";
import { cn } from "@/utils/styling";
import { useState } from "react";
import { GameModal } from "../AllinBet/GameModal";
import { CreateGame } from "../AllinBet/CreateGame";
import { WithdrawFunds } from "../AllinBet/WithdrawFunds";

const buttonStyles = "nes-btn is-primary";

export const WalletButtons = () => {
  const { wallets, connected, disconnect, isLoading } = useWallet();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPoolModal, setShowPoolModal] = useState(false);

  if (connected) {
    return (
      <div className="flex flex-row gap-2">
        <button
          className={cn(buttonStyles, "hover:bg-blue-700 btn-small")}
          onClick={() => setShowCreateModal(true)}
        >
          创建游戏
        </button>
        <button
          className={cn(buttonStyles, "hover:bg-blue-700 btn-small")}
          onClick={() => setShowPoolModal(true)}
        >
          我的游戏池
        </button>
        <button
          className={cn("nes-btn is-error btn-small")}
          onClick={disconnect}
        >
          断开连接
        </button>

        {/* 创建游戏模态框 */}
        <GameModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="创建游戏"
        >
          <CreateGame />
        </GameModal>

        {/* 我的游戏池模态框 */}
        <GameModal
          isOpen={showPoolModal}
          onClose={() => setShowPoolModal(false)}
          title="我的游戏池"
        >
          <WithdrawFunds />
        </GameModal>
      </div>
    );
  }

  if (isLoading || !wallets || !wallets[0]) {
    return (
      <div className={cn(buttonStyles, "opacity-50 cursor-not-allowed")}>
        Loading...
      </div>
    );
  }

  return <WalletView wallet={wallets[0]} />;
};

// 保留原来的 WalletView 组件代码
const WalletView = ({ wallet }: { wallet: Wallet }) => {
  const { connect } = useWallet();
  const isWalletReady =
    wallet.readyState === WalletReadyState.Installed ||
    wallet.readyState === WalletReadyState.Loadable;
  const mobileSupport = wallet.deeplinkProvider;

  const onWalletConnectRequest = async (walletName: WalletName) => {
    try {
      await connect(walletName);
    } catch (error) {
      console.warn(error);
      window.alert("Failed to connect wallet");
    }
  };

  /**
   * If we are on a mobile browser, adapter checks whether a wallet has a `deeplinkProvider` property
   * a. If it does, on connect it should redirect the user to the app by using the wallet's deeplink url
   * b. If it does not, up to the dapp to choose on the UI, but can simply disable the button
   * c. If we are already in a in-app browser, we don't want to redirect anywhere, so connect should work as expected in the mobile app.
   *
   * !isWalletReady - ignore installed/sdk wallets that don't rely on window injection
   * isRedirectable() - are we on mobile AND not in an in-app browser
   * mobileSupport - does wallet have deeplinkProvider property? i.e does it support a mobile app
   */
  if (!isWalletReady && isRedirectable()) {
    // wallet has mobile app
    if (mobileSupport) {
      return (
        <button
          className={cn(buttonStyles, "hover:bg-blue-700")}
          disabled={false}
          key={wallet.name}
          onClick={() => onWalletConnectRequest(wallet.name)}
          style={{ maxWidth: "300px" }}
        >
          Connect Wallet
        </button>
      );
    }
    // wallet does not have mobile app
    return (
      <button
        className={cn(buttonStyles, "opacity-50 cursor-not-allowed")}
        disabled={true}
        key={wallet.name}
        style={{ maxWidth: "300px" }}
      >
        Connect Wallet - Desktop Only
      </button>
    );
  } else {
    // desktop
    return (
      <button
        className={cn(
          buttonStyles,
          isWalletReady ? "hover:bg-blue-700" : "opacity-50 cursor-not-allowed"
        )}
        disabled={!isWalletReady}
        key={wallet.name}
        onClick={() => onWalletConnectRequest(wallet.name)}
        style={{ maxWidth: "300px" }}
      >
        Connect Wallet
      </button>
    );
  }
};
