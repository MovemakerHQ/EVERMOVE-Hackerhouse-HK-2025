"use client";

import { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { getAptosClient } from "@/utils/aptosClient";
import { cn } from "@/utils/styling";
import { ABI } from "@/utils/abi";
import { GameInfo } from "./GameInfo";
import { PlayingCard } from "@/components/Cards/PlayingCard";

const aptosClient = getAptosClient();

export function JoinGame() {
    const { account, signAndSubmitTransaction } = useWallet();
    const [gameOwner, setGameOwner] = useState<string>("");
    const [entryFee, setEntryFee] = useState<string>("5");
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

    const [validAddress, setValidAddress] = useState(false);

    // Validate the address when it changes
    const handleAddressChange = (address: string) => {
        setGameOwner(address);
        setValidAddress(address.startsWith("0x") && address.length >= 10);
    };

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
                        gameOwner,
                        parseFloat(entryFee) * 1_00000000, // Convert to octas
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

    return (
        <div className="nes-container is-dark with-title">
            <p className="title">加入游戏</p>
            <form onSubmit={handleJoinGame} className="flex flex-col gap-4">
                <div className="nes-field">
                    <label htmlFor="game-owner">游戏所有者地址</label>
                    <input
                        id="game-owner"
                        type="text"
                        className="nes-input"
                        value={gameOwner}
                        onChange={(e) => handleAddressChange(e.target.value)}
                        placeholder="0x..."
                        required
                    />
                </div>

                {validAddress && <GameInfo gameAddress={gameOwner} />}

                <div className="nes-field">
                    <label htmlFor="entry-fee">入场费 (APT)</label>
                    <input
                        id="entry-fee"
                        type="number"
                        className="nes-input"
                        step="0.1"
                        min="0.1"
                        value={entryFee}
                        onChange={(e) => setEntryFee(e.target.value)}
                        required
                    />
                </div>

                <button
                    type="submit"
                    className={cn(
                        "nes-btn is-primary",
                        joining && "is-disabled cursor-not-allowed"
                    )}
                    disabled={joining || !validAddress}
                >
                    {joining ? "处理中..." : "加入游戏"}
                </button>

                {error && <p className="text-red-500">{error}</p>}

                {/* 显示抽取的随机数 */}
                {drawnNumbers && (
                    <div className="mt-4 p-4 border-4 border-gray-700 bg-gray-900 rounded">
                        <h3 className="text-lg font-bold mb-2">您的抽取结果</h3>
                        <div className="flex justify-center gap-6 my-3">
                            <div className="flex flex-col items-center">
                                <PlayingCard value={drawnNumbers.number1} size="large" />
                            </div>
                            <div className="text-2xl flex items-center">×</div>
                            <div className="flex flex-col items-center">
                                <PlayingCard value={drawnNumbers.number2} size="large" />
                            </div>
                            <div className="text-2xl flex items-center">=</div>
                            <div className="flex flex-col items-center">
                                <span className="text-3xl font-bold">{drawnNumbers.playerProduct}</span>
                                <span className="text-sm">您的乘积</span>
                            </div>
                        </div>
                        <div className="text-center my-2">
                            <span className="text-sm">目标乘积: {drawnNumbers.targetProduct}</span>
                        </div>
                        <div className="text-center mt-3">
                            {drawnNumbers.isWin ? (
                                <p className="text-green-500 font-bold">🎉 您的乘积大于目标乘积，您赢了！</p>
                            ) : (
                                <p className="text-red-400 font-bold">💔 您的乘积小于或等于目标乘积，您输了。</p>
                            )}
                        </div>
                    </div>
                )}

                {result && (
                    <div
                        className={cn(
                            "mt-4 p-4 border-4",
                            result.status === "success"
                                ? "border-green-500 bg-green-100"
                                : "border-orange-500 bg-orange-100"
                        )}
                    >
                        <p className="text-lg font-bold">
                            {result.status === "success" ? "🎉 " : "😔 "}
                            {result.message}
                        </p>
                    </div>
                )}
            </form>
        </div>
    );
}