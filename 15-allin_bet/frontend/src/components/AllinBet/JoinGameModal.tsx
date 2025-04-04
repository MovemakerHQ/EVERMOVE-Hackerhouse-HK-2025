"use client";

import { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { getAptosClient } from "@/utils/aptosClient";
import { ABI } from "@/utils/abi";
import { cn } from "@/utils/styling";
import { GameModal } from "./GameModal";
import { PlayingCard } from "@/components/Cards/PlayingCard";

const aptosClient = getAptosClient();

interface JoinGameModalProps {
    isOpen: boolean;
    onClose: () => void;
    gameAddress: string;
    minEntry: number;
}

export function JoinGameModal({ isOpen, onClose, gameAddress, minEntry }: JoinGameModalProps) {
    const { account, signAndSubmitTransaction } = useWallet();
    const [entryFee, setEntryFee] = useState<string>(minEntry.toString());
    const [joining, setJoining] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 添加随机数和结果状态
    const [drawnNumbers, setDrawnNumbers] = useState<{
        number1: number;
        number2: number;
        playerProduct: number;
        targetProduct: number;
        isWin: boolean;
    } | null>(null);

    const [result, setResult] = useState<{
        status: "success" | "failure";
        message: string;
    } | null>(null);

    const handleJoinGame = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!account) return;

        setJoining(true);
        setError(null);
        setResult(null);
        setDrawnNumbers(null);

        try {
            const response = await signAndSubmitTransaction({
                sender: account.address,
                data: {
                    function: `${ABI.address}::allin_bet::join_game`,
                    typeArguments: [],
                    functionArguments: [
                        gameAddress,
                        parseFloat(entryFee) * 1_00000000, // 转换为octas
                    ],
                },
            });

            await aptosClient.waitForTransaction({
                transactionHash: response.hash,
            });

            // 获取交易详情及事件
            const txDetails = await aptosClient.getTransactionByHash({
                transactionHash: response.hash,
            });

            // 从交易详情中获取事件
            const events = txDetails.events || [];

            // 查找GameResult事件
            let gameResultEvent = null;
            if (events) {
                for (const event of events) {
                    if (event.type?.includes("GameResult")) {
                        gameResultEvent = event;
                        break;
                    }
                }
            }

            // 如果找到了事件，解析事件数据
            if (gameResultEvent && gameResultEvent.data) {
                const { number1, number2, player_product, target_product, is_win } = gameResultEvent.data as any;

                // 设置抽取的随机数和结果
                setDrawnNumbers({
                    number1: parseInt(number1),
                    number2: parseInt(number2),
                    playerProduct: parseInt(player_product),
                    targetProduct: parseInt(target_product),
                    isWin: is_win
                });

                // 设置游戏结果
                setResult({
                    status: is_win ? "success" : "failure",
                    message: is_win
                        ? "恭喜！你赢了！请查看你的钱包余额。"
                        : "很遗憾，这次你没有赢。再试一次！",
                });
            } else {
                // 如果没有找到事件，使用替代信息
                setResult({
                    status: "failure",
                    message: "游戏完成，但无法获取详细结果。请查看你的钱包余额。"
                });
            }
        } catch (err: any) {
            setError(err.message || "加入游戏失败");
            console.error(err);
        } finally {
            setJoining(false);
        }
    };

    // 将数字转换为卡牌名称的辅助函数
    const getCardName = (value: number): string => {
        if (value === 0) return "Joker";
        if (value === 1) return "A (1)";
        if (value >= 2 && value <= 10) return value.toString();
        if (value === 11) return "J (11)";
        if (value === 12) return "Q (12)";
        if (value === 13) return "K (13)";
        return "未知";
    };

    return (
        <GameModal isOpen={isOpen} onClose={onClose} title="加入游戏">
            <div className="flex flex-col gap-4">
                <div className="nes-container is-dark with-title">
                    <p className="title">游戏信息</p>
                    <p className="text-sm mb-2 break-all">游戏地址: {gameAddress}</p>
                    <p>最低入场费: {minEntry} APT</p>
                </div>

                {!result ? (
                    <form onSubmit={handleJoinGame} className="flex flex-col gap-4">
                        <div className="nes-field">
                            <label htmlFor="entry-fee">入场费 (APT)</label>
                            <input
                                id="entry-fee"
                                type="number"
                                className="nes-input"
                                step="0.1"
                                min={minEntry}
                                value={entryFee}
                                onChange={(e) => setEntryFee(e.target.value)}
                                required
                            />
                        </div>

                        {error && (
                            <div className="nes-container is-error">
                                <p>{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            className={cn(
                                "nes-btn is-primary",
                                joining && "is-disabled cursor-not-allowed"
                            )}
                            disabled={joining}
                        >
                            {joining ? "正在加入..." : "加入游戏"}
                        </button>
                    </form>
                ) : (
                    <div className="flex flex-col gap-4">
                        <div
                            className={`nes-container ${result.status === "success" ? "is-success" : "is-error"
                                }`}
                        >
                            <p>{result.message}</p>
                        </div>

                        {drawnNumbers && (
                            <div className="nes-container is-dark">
                                <h3 className="mb-2">抽卡结果</h3>
                                <div className="flex justify-center gap-4 mb-4">
                                    <div className="flex flex-col items-center">
                                        <PlayingCard value={drawnNumbers.number1} />
                                        <span className="mt-1">
                                            {getCardName(drawnNumbers.number1)}
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <PlayingCard value={drawnNumbers.number2} />
                                        <span className="mt-1">
                                            {getCardName(drawnNumbers.number2)}
                                        </span>
                                    </div>
                                </div>

                                <div className="text-center">
                                    <p>
                                        你的乘积: {drawnNumbers.playerProduct} (
                                        {drawnNumbers.number1} × {drawnNumbers.number2})
                                    </p>
                                    <p>目标乘积: {drawnNumbers.targetProduct}</p>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-2">
                            <button className="nes-btn is-primary flex-1" onClick={onClose}>
                                关闭
                            </button>
                            <button
                                className="nes-btn is-primary flex-1"
                                onClick={() => {
                                    setResult(null);
                                    setDrawnNumbers(null);
                                    setError(null);
                                }}
                            >
                                再次游戏
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </GameModal>
    );
}