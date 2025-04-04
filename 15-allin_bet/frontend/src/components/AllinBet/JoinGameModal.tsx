"use client";

import { useState, useEffect } from "react";
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

// Game state enum
type GameState = "input" | "processing" | "first-draw" | "decision" | "processing-continue" | "result";

export function JoinGameModal({ isOpen, onClose, gameAddress, minEntry }: JoinGameModalProps) {
    const { account, signAndSubmitTransaction } = useWallet();
    const [entryFee, setEntryFee] = useState<string>(minEntry.toString());
    const [joining, setJoining] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Game state control
    const [gameState, setGameState] = useState<GameState>("input");

    // First card state
    const [firstCard, setFirstCard] = useState<number | null>(null);

    // Final result state
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

    // 添加一个loading状态来控制显示
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // 添加游戏详情状态
    const [gameInfo, setGameInfo] = useState<{
        targetNum1: number;
        targetNum2: number;
        minEntry: number;
        poolValue: number;
    } | null>(null);

    // 修改useEffect - 加载时获取游戏信息
    useEffect(() => {
        if (isOpen) {
            setIsLoading(true);

            // 获取游戏信息
            fetchGameInfo().then(() => {
                // 在获取游戏信息后，检查是否有未完成的游戏
                if (account && gameState !== "input") {
                    return checkPendingGame();
                }
            }).finally(() => {
                setIsLoading(false);
            });
        }
    }, [isOpen, account]);

    // 获取游戏信息
    const fetchGameInfo = async () => {
        try {
            const response = await aptosClient.view({
                payload: {
                    function: `${ABI.address}::allin_bet::get_game_info`,
                    functionArguments: [gameAddress],
                },
            });

            console.log("游戏信息获取成功:", response);

            setGameInfo({
                targetNum1: Number(response[0]),
                targetNum2: Number(response[1]),
                minEntry: Number(response[2]) / 100000000, // 转换为 APT
                poolValue: Number(response[3]) / 100000000, // 转换为 APT
            });
        } catch (err: any) {
            console.error("获取游戏信息失败:", err);
            setError(`无法加载游戏信息: ${err.message || "未知错误"}`);
        }
    };

    // 检查是否有未完成游戏
    const checkPendingGame = async () => {
        try {
            if (!account) {
                return;
            }

            const response = await aptosClient.view({
                payload: {
                    function: `${ABI.address}::allin_bet::get_first_number`,
                    functionArguments: [account.address, gameAddress],
                },
            });

            console.log("检查游戏状态响应:", JSON.stringify(response));

            // 现在函数返回直接的u8值
            if (response && response.length > 0) {
                const cardValue = Number(response[0]);

                // 检查是否为无效值(255表示没有找到pending game)
                if (cardValue !== 255) {
                    console.log("找到玩家的第一张卡牌:", cardValue);
                    setFirstCard(cardValue);
                    setGameState("decision");
                } else {
                    console.log("没有找到玩家的pending game");
                }
            }
        } catch (error) {
            console.error("检查未完成游戏失败:", error);
        }
    };

    // Start game - draw the first card
    const handleJoinGame = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!account) return;

        setJoining(true);
        setError(null);
        setResult(null);
        setGameState("processing");

        try {
            const response = await signAndSubmitTransaction({
                sender: account.address,
                data: {
                    function: `${ABI.address}::allin_bet::join_game`,
                    typeArguments: [],
                    functionArguments: [
                        gameAddress,
                        parseFloat(entryFee) * 1_00000000, // Convert to octas
                    ],
                },
            });

            await aptosClient.waitForTransaction({
                transactionHash: response.hash,
            });

            // 等待一小段时间确保区块链数据已更新
            await new Promise(resolve => setTimeout(resolve, 1000));

            // 确保获取到第一张牌后再更改状态
            const cardValue = await fetchFirstCardValue();
            if (cardValue !== null) {
                setFirstCard(cardValue);
                setGameState("first-draw");
            } else {
                // 如果没有获取到牌值，保持在处理状态
                setError("无法获取牌值，请重试");
                setGameState("input");
            }

        } catch (err: any) {
            setError(err.message || "加入游戏失败");
            setGameState("input");
            console.error(err);
        } finally {
            setJoining(false);
        }
    };

    // 添加一个新函数专门用于获取第一张牌的值
    const fetchFirstCardValue = async (): Promise<number | null> => {
        try {
            if (!account) return null;

            const response = await aptosClient.view({
                payload: {
                    function: `${ABI.address}::allin_bet::get_first_number`,
                    functionArguments: [account.address, gameAddress],
                },
            });

            console.log("从区块链获取的原始响应:", JSON.stringify(response));

            // 简化的解析逻辑，直接获取第一个返回值
            if (response && response.length > 0) {
                const cardValue = Number(response[0]);

                // 检查是否为无效值
                if (cardValue !== 255) {
                    console.log("获取到的卡牌值:", cardValue);
                    return cardValue;
                }
            }

            console.log("未能找到有效的卡牌值");
            return null;
        } catch (error) {
            console.error("获取第一张牌值失败:", error);
            return null;
        }
    };

    // Continue game - draw the second card
    const handleContinueGame = async () => {
        if (!account) return;

        setError(null);
        setGameState("processing-continue");

        try {
            const response = await signAndSubmitTransaction({
                sender: account.address,
                data: {
                    function: `${ABI.address}::allin_bet::continue_game`,
                    typeArguments: [],
                    functionArguments: [
                        gameAddress,
                    ],
                },
            });

            await aptosClient.waitForTransaction({
                transactionHash: response.hash,
            });

            // Get transaction details and events
            const txDetails = await aptosClient.getTransactionByHash({
                transactionHash: response.hash,
            });

            // Extract events from transaction details
            const events = txDetails.events || [];

            // Find GameResult event
            let gameResultEvent = null;
            if (events) {
                for (const event of events) {
                    if (event.type?.includes("GameResult")) {
                        gameResultEvent = event;
                        break;
                    }
                }
            }

            // If event found, parse event data
            if (gameResultEvent && gameResultEvent.data) {
                const { number1, number2, player_product, target_product, is_win } = gameResultEvent.data as any;

                // Set drawn numbers and result
                setDrawnNumbers({
                    number1: parseInt(number1),
                    number2: parseInt(number2),
                    playerProduct: parseInt(player_product),
                    targetProduct: parseInt(target_product),
                    isWin: is_win
                });

                // Set game result
                setResult({
                    status: is_win ? "success" : "failure",
                    message: is_win
                        ? "恭喜你！你赢了！请检查你的钱包余额。"
                        : "很遗憾，这次你没有赢。再试一次！",
                });
            } else {
                // If event not found, use fallback information
                setResult({
                    status: "failure",
                    message: "游戏完成，但无法获取详细结果。请检查你的钱包余额。"
                });
            }

            // 清除第一张牌状态，防止显示重叠
            setFirstCard(null);
            setGameState("result");

            // 更新游戏池信息
            await fetchGameInfo();

        } catch (err: any) {
            setError(err.message || "继续游戏失败");
            setGameState("decision");
            console.error(err);
        }
    };

    // Quit game - refund 40% of the bet
    const handleQuitGame = async () => {
        if (!account) return;

        setError(null);
        setGameState("processing");

        try {
            const response = await signAndSubmitTransaction({
                sender: account.address,
                data: {
                    function: `${ABI.address}::allin_bet::quit_game`,
                    typeArguments: [],
                    functionArguments: [
                        gameAddress,
                    ],
                },
            });

            await aptosClient.waitForTransaction({
                transactionHash: response.hash,
            });

            setResult({
                status: "success",
                message: "您已成功退出游戏并收到40%的退款。",
            });

            setFirstCard(null);
            setGameState("input");

            // 更新游戏池信息
            await fetchGameInfo();

        } catch (err: any) {
            setError(err.message || "退出游戏失败");
            setGameState("decision");
            console.error(err);
        }
    };

    // Reset game
    const handleReset = () => {
        setFirstCard(null);
        setDrawnNumbers(null);
        setResult(null);
        setError(null);
        setGameState("input");
    };

    // Helper function to convert numbers to card names
    const getCardName = (value: number): string => {
        if (value === 0) return "Joker";
        if (value === 1) return "A (1)";
        if (value >= 2 && value <= 10) return value.toString();
        if (value === 11) return "J (11)";
        if (value === 12) return "Q (12)";
        if (value === 13) return "K (13)";
        return "未知";
    };

    // 在renderGameContent中处理loading状态
    const renderGameContent = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col items-center gap-4">
                    <p>加载中，请稍候...</p>
                    <div className="nes-progress is-pattern">
                        <progress className="nes-progress is-primary" value="70" max="100"></progress>
                    </div>
                </div>
            );
        }

        switch (gameState) {
            case "input":
                return (
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
                            {joining ? "加入中..." : "加入游戏"}
                        </button>
                    </form>
                );

            case "processing":
                return (
                    <div className="flex flex-col items-center gap-4">
                        <p>正在支付入场费并抽取第一张牌，请稍候...</p>
                        <div className="nes-progress is-pattern">
                            <progress className="nes-progress is-primary" value="70" max="100"></progress>
                        </div>
                    </div>
                );

            case "first-draw":
            case "decision":
                return (
                    <div className="flex flex-col gap-4">
                        <div className="nes-container is-dark">
                            <h3 className="mb-2">您的第一张卡牌</h3>
                            <div className="flex justify-center mb-4">
                                <div className="flex flex-col items-center">
                                    {firstCard !== null ? (
                                        <>
                                            <PlayingCard value={firstCard} size="large" />
                                            <span className="mt-1">
                                                {getCardName(firstCard)}
                                            </span>
                                        </>
                                    ) : (
                                        <div className="w-16 h-24 flex items-center justify-center bg-gray-700 rounded-md border-2 border-white">
                                            <span>等待...</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <p className="text-center mb-4">您现在可以选择继续游戏或退出</p>

                            <div className="flex gap-2">
                                <button
                                    className="nes-btn is-primary flex-1"
                                    onClick={handleContinueGame}
                                    disabled={firstCard === null || gameState === "processing"}
                                >
                                    继续游戏
                                </button>
                                <button
                                    className="nes-btn is-error flex-1"
                                    onClick={handleQuitGame}
                                    disabled={firstCard === null || gameState === "processing"}
                                >
                                    退出(退还40%)
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="nes-container is-error">
                                <p>{error}</p>
                            </div>
                        )}
                    </div>
                );

            case "processing-continue":
                return (
                    <div className="flex flex-col items-center gap-4">
                        <p>正在抽取第二张牌...</p>
                        <div className="nes-progress is-pattern">
                            <progress className="nes-progress is-primary" value="70" max="100"></progress>
                        </div>
                    </div>
                );

            case "result":
                return (
                    <div className="flex flex-col gap-4">
                        {result && (
                            <div
                                className={`nes-container ${result.status === "success" ? "is-success" : "is-error"}`}
                            >
                                <p>{result.message}</p>
                            </div>
                        )}

                        {drawnNumbers && (
                            <div className="nes-container is-dark">
                                <h3 className="mb-2">卡牌抽取结果</h3>
                                <div className="flex justify-center gap-4 mb-4">
                                    <div className="flex flex-col items-center">
                                        <PlayingCard value={drawnNumbers.number1} size="large" />
                                        <span className="mt-1">
                                            {getCardName(drawnNumbers.number1)}
                                        </span>
                                    </div>
                                    <div className="text-2xl flex items-center">×</div>
                                    <div className="flex flex-col items-center">
                                        <PlayingCard value={drawnNumbers.number2} size="large" />
                                        <span className="mt-1">
                                            {getCardName(drawnNumbers.number2)}
                                        </span>
                                    </div>
                                    <div className="text-2xl flex items-center">=</div>
                                    <div className="flex flex-col items-center">
                                        <span className="text-3xl font-bold">{drawnNumbers.playerProduct}</span>
                                    </div>
                                </div>

                                <div className="text-center">
                                    <p className="mb-2">
                                        您的乘积: {drawnNumbers.playerProduct} (
                                        {drawnNumbers.number1} × {drawnNumbers.number2})
                                    </p>
                                    <p>目标乘积: {drawnNumbers.targetProduct}</p>
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

                        <div className="flex gap-2">
                            <button className="nes-btn is-primary flex-1" onClick={onClose}>
                                关闭
                            </button>
                            <button
                                className="nes-btn is-primary flex-1"
                                onClick={handleReset}
                            >
                                再玩一次
                            </button>
                        </div>
                    </div>
                );
        }
    };

    return (
        <GameModal isOpen={isOpen} onClose={onClose} title="加入游戏">
            <div className="flex flex-col gap-4">
                <div className="nes-container is-dark with-title">
                    <p className="title">游戏信息</p>
                    <p className="text-sm mb-2 break-all">游戏地址: {gameAddress}</p>

                    {gameInfo ? (
                        <>
                            <div className="mb-3">
                                <p className="mb-2">游戏目标卡牌：</p>
                                <div className="flex justify-center gap-4 mb-2">
                                    <div className="flex flex-col items-center">
                                        <PlayingCard value={gameInfo.targetNum1} size="small" />
                                        <span className="mt-1">{getCardName(gameInfo.targetNum1)}</span>
                                    </div>
                                    <div className="text-xl flex items-center">×</div>
                                    <div className="flex flex-col items-center">
                                        <PlayingCard value={gameInfo.targetNum2} size="small" />
                                        <span className="mt-1">{getCardName(gameInfo.targetNum2)}</span>
                                    </div>
                                    <div className="text-xl flex items-center">=</div>
                                    <div className="flex flex-col items-center">
                                        <span className="text-2xl font-bold">{gameInfo.targetNum1 * gameInfo.targetNum2}</span>
                                    </div>
                                </div>
                                <p className="text-sm text-center mb-3">
                                    要赢得游戏，您抽取的两张牌乘积需要大于 {gameInfo.targetNum1 * gameInfo.targetNum2}
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>最低入场费:</div>
                                <div>{gameInfo.minEntry.toFixed(2)} APT</div>
                                <div>当前奖池:</div>
                                <div>{gameInfo.poolValue.toFixed(2)} APT</div>
                            </div>
                        </>
                    ) : (
                        <p>最低入场费: {minEntry} APT</p>
                    )}
                </div>

                {renderGameContent()}
            </div>
        </GameModal>
    );
}