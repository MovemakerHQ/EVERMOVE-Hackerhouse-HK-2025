"use client";

import { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { getAptosClient } from "@/utils/aptosClient";
import { cn } from "@/utils/styling";
import { ABI } from "@/utils/abi";
import { PlayingCard } from "@/components/Cards/PlayingCard";

const aptosClient = getAptosClient();

export function CreateGame() {
    const { account, signAndSubmitTransaction } = useWallet();
    const [initialDeposit, setInitialDeposit] = useState<string>("10");
    const [targetNumber1, setTargetNumber1] = useState<string>("7");
    const [targetNumber2, setTargetNumber2] = useState<string>("8");
    const [minEntry, setMinEntry] = useState<string>("5");
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);

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

    const handleCreateGame = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!account) return;

        setIsCreating(true);
        setError(null);
        setSuccess(false);

        try {
            const num1 = parseInt(targetNumber1);
            const num2 = parseInt(targetNumber2);

            if (num1 >= 14 || num2 >= 14 || num1 < 0 || num2 < 0) {
                throw new Error("目标数字必须在0到13之间");
            }

            const response = await signAndSubmitTransaction({
                sender: account.address,
                data: {
                    function: `${ABI.address}::allin_bet::create_game_pool`,
                    typeArguments: [],
                    functionArguments: [
                        parseFloat(initialDeposit) * 1_00000000, // Convert to octas
                        parseInt(targetNumber1),
                        parseInt(targetNumber2),
                        parseFloat(minEntry) * 1_00000000, // Convert to octas
                    ],
                },
            });

            await aptosClient.waitForTransaction({ transactionHash: response.hash });
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || "创建游戏失败");
            console.error(err);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="nes-container is-dark with-title">
            <p className="title">创建游戏池</p>
            <form onSubmit={handleCreateGame} className="flex flex-col gap-4">
                <div className="nes-field">
                    <label htmlFor="initial-deposit">初始存款 (APT)</label>
                    <input
                        id="initial-deposit"
                        type="number"
                        className="nes-input"
                        step="0.1"
                        min="0.1"
                        value={initialDeposit}
                        onChange={(e) => setInitialDeposit(e.target.value)}
                        required
                    />
                </div>

                <div className="flex flex-row gap-4">
                    {/* 替换数字输入为卡牌选择 */}
                    <div className="nes-field w-1/2">
                        <label htmlFor="target-num1">目标卡牌 1</label>
                        <div className="flex flex-col items-center gap-2">
                            <PlayingCard value={parseInt(targetNumber1)} size="medium" />
                            <select
                                id="target-num1"
                                className="nes-input mt-2"
                                value={targetNumber1}
                                onChange={(e) => setTargetNumber1(e.target.value)}
                                required
                            >
                                {Array.from({ length: 14 }, (_, i) => (
                                    <option key={i} value={i}>
                                        {getCardName(i)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="nes-field w-1/2">
                        <label htmlFor="target-num2">目标卡牌 2</label>
                        <div className="flex flex-col items-center gap-2">
                            <PlayingCard value={parseInt(targetNumber2)} size="medium" />
                            <select
                                id="target-num2"
                                className="nes-input mt-2"
                                value={targetNumber2}
                                onChange={(e) => setTargetNumber2(e.target.value)}
                                required
                            >
                                {Array.from({ length: 14 }, (_, i) => (
                                    <option key={i} value={i}>
                                        {getCardName(i)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="nes-field">
                    <label htmlFor="min-entry">最低入场费 (APT)</label>
                    <input
                        id="min-entry"
                        type="number"
                        className="nes-input"
                        step="0.1"
                        min="0.1"
                        value={minEntry}
                        onChange={(e) => setMinEntry(e.target.value)}
                        required
                    />
                </div>

                <button
                    type="submit"
                    className={cn(
                        "nes-btn is-primary",
                        isCreating && "is-disabled cursor-not-allowed"
                    )}
                    disabled={isCreating}
                >
                    {isCreating ? "创建中..." : "创建游戏池"}
                </button>

                {error && <p className="text-red-500">{error}</p>}
                {success && (
                    <p className="text-green-500">
                        游戏池创建成功！玩家现在可以加入你的游戏。
                    </p>
                )}
                <div className="mt-4">
                    <p className="text-sm">
                        目标乘积: {parseInt(targetNumber1) * parseInt(targetNumber2)}
                    </p>
                    <p className="text-sm">
                        玩家将抽取两张卡牌(Joker至K)，如果他们的乘积大于目标乘积，则赢得奖池的20%。
                    </p>
                </div>
            </form>
        </div>
    );
}