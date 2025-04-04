"use client";

import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { GamesList } from "@/components/AllinBet/GamesList";

export function Connected() {
  const { account } = useWallet();

  return (
    <div className="flex flex-col gap-6 p-6 h-full overflow-auto">
      <div className="nes-container is-dark with-title">
        <p className="title">欢迎来到 AllinBet</p>
        <p>
          探索现有游戏并尝试加入! 创建和管理游戏的功能可以通过右上角的按钮使用。
        </p>
      </div>

      {/* 使用新的GamesList组件 */}
      <div className="overflow-auto">
        <GamesList />
      </div>

      <div className="mt-4 text-xs text-gray-500">
        已连接地址: {account?.address}
      </div>
    </div>
  );
}