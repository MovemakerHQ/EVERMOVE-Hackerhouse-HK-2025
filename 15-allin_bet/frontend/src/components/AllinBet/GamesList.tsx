"use client";

import { useState, useEffect } from "react";
import { getAptosClient } from "@/utils/aptosClient";
import { ABI } from "@/utils/abi";
import { GameInfo } from "./GameInfo";
import { JoinGameModal } from "./JoinGameModal";

const aptosClient = getAptosClient();

export function GamesList() {
    const [gameAddresses, setGameAddresses] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedGame, setSelectedGame] = useState<{
        address: string;
        minEntry: number;
    } | null>(null);

    useEffect(() => {
        const fetchAllGamePools = async () => {
            try {
                setLoading(true);
                setError(null);

                // 直接硬编码一些测试地址，在合约修复前临时使用
                // 您可以将您创建的游戏池地址添加到这个数组中
                const hardcodedAddresses: string[] = [
                    // 如果您已经创建了游戏池，请在这里添加它们的地址
                    // 例如: "0xe1f4f297aa4bacca3574574e0323b1bbafb64c89324310f9950a01a35324a3ac"
                ];

                try {
                    // 尝试调用合约方法获取地址
                    const response = await aptosClient.view({
                        payload: {
                            function: `${ABI.address}::allin_bet::get_all_game_pools`,
                            functionArguments: [],
                        },
                    });

                    // 如果成功，使用返回的地址
                    const addresses = response[0] as string[];
                    setGameAddresses(addresses);
                } catch (err: any) {
                    console.warn("无法从合约获取游戏池列表:", err);

                    // 如果合约调用失败，使用硬编码地址
                    if (hardcodedAddresses.length > 0) {
                        setGameAddresses(hardcodedAddresses);
                        setError("已使用预配置的游戏地址。要添加新游戏，请手动更新地址列表。");
                    } else {
                        setError("游戏系统尚未完全初始化。请先创建一个游戏池。");
                        setGameAddresses([]);
                    }
                }
            } finally {
                setLoading(false);
            }
        };

        fetchAllGamePools();
    }, []);

    // 打开游戏参与模态框
    const openJoinModal = async (gameAddress: string) => {
        try {
            // 获取游戏信息以确定最低入场费
            const gameInfo = await aptosClient.view({
                payload: {
                    function: `${ABI.address}::allin_bet::get_game_info`,
                    functionArguments: [gameAddress],
                },
            });

            // 设置选中的游戏
            setSelectedGame({
                address: gameAddress,
                minEntry: Number(gameInfo[2]) / 100000000, // 转换为 APT
            });
        } catch (err) {
            console.error("获取游戏信息失败:", err);
        }
    };

    // 关闭模态框
    const closeJoinModal = () => {
        setSelectedGame(null);
    };

    if (loading) {
        return <div className="nes-container is-dark">正在加载游戏列表...</div>;
    }

    if (gameAddresses.length === 0) {
        return (
            <div className="nes-container is-dark">
                {error || "当前没有可用的游戏。请先创建一个游戏池。"}
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            {error && (
                <div className="nes-container is-warning">{error}</div>
            )}
            <div className="nes-container is-dark with-title">
                <p className="title">可用游戏</p>
                <div className="flex flex-col gap-4">
                    {gameAddresses.map((address) => (
                        <div key={address} className="nes-container is-rounded">
                            <div className="mb-2">
                                <p className="text-sm break-all">游戏地址: {address}</p>
                            </div>
                            <GameInfo gameAddress={address} />
                            <div className="mt-4">
                                <button
                                    className="nes-btn is-primary"
                                    onClick={() => openJoinModal(address)}
                                >
                                    加入游戏
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 加入游戏模态框 */}
            {selectedGame && (
                <JoinGameModal
                    isOpen={!!selectedGame}
                    onClose={closeJoinModal}
                    gameAddress={selectedGame.address}
                    minEntry={selectedGame.minEntry}
                />
            )}
        </div>
    );
}