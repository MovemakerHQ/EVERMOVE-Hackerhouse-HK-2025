"use client";

import { useState, useEffect } from "react";
import { getAptosClient } from "@/utils/aptosClient";
import { ABI } from "@/utils/abi";
import { PlayingCard } from "@/components/Cards/PlayingCard";

const aptosClient = getAptosClient();

export function GameInfo({ gameAddress }: { gameAddress: string }) {
    const [info, setInfo] = useState<{
        targetNum1: number;
        targetNum2: number;
        minEntry: number;
        poolValue: number;
    } | null>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchGameInfo = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log("尝试获取游戏信息，地址:", gameAddress);

            const response = await aptosClient.view({
                payload: {
                    function: `${ABI.address}::allin_bet::get_game_info`,
                    functionArguments: [gameAddress],
                },
            });

            console.log("游戏信息获取成功:", response);

            setInfo({
                targetNum1: Number(response[0]),
                targetNum2: Number(response[1]),
                minEntry: Number(response[2]) / 100000000, // Convert from octas to APT
                poolValue: Number(response[3]) / 100000000, // Convert from octas to APT
            });
        } catch (err: any) {
            console.error("获取游戏信息失败，详细错误:", err);
            // 显示更详细的错误消息
            setError(`无法加载游戏信息: ${err.message || "未知错误"}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (gameAddress) {
            fetchGameInfo();
        }
    }, [gameAddress]);

    const getCardName = (value: number): string => {
        if (value === 0) return "Joker";
        if (value === 1) return "A";
        if (value >= 2 && value <= 10) return value.toString();
        if (value === 11) return "J";
        if (value === 12) return "Q";
        if (value === 13) return "K";
        return "?";
    };

    if (loading) {
        return <div>加载游戏信息中...</div>;
    }

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    if (!info) {
        return <div>没有游戏信息可用</div>;
    }

    return (
        <div className="nes-container with-title p-3 mt-3 mb-3">
            <p className="title">游戏详情</p>
            <div className="flex justify-center gap-4 mb-4">
                <div className="flex flex-col items-center">
                    <PlayingCard value={info.targetNum1} size="medium" />
                    <span className="mt-1">{getCardName(info.targetNum1)}</span>
                </div>
                <div className="text-xl flex items-center">×</div>
                <div className="flex flex-col items-center">
                    <PlayingCard value={info.targetNum2} size="medium" />
                    <span className="mt-1">{getCardName(info.targetNum2)}</span>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
                <div>目标乘积:</div>
                <div>{info.targetNum1 * info.targetNum2}</div>

                <div>最低入场费:</div>
                <div>{info.minEntry.toFixed(2)} APT</div>

                <div>当前奖池:</div>
                <div>{info.poolValue.toFixed(2)} APT</div>
            </div>
            <div className="mt-3 text-sm">
                <p>
                    要赢得游戏，你需要抽取两张卡牌，使它们的乘积大于 {info.targetNum1 * info.targetNum2}。
                </p>
            </div>
        </div>
    );
}