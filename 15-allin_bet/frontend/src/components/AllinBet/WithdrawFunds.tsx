"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { getAptosClient } from "@/utils/aptosClient";
import { cn } from "@/utils/styling";
import { ABI } from "@/utils/abi";

const aptosClient = getAptosClient();

export function WithdrawFunds() {
    const { account, signAndSubmitTransaction } = useWallet();
    const [withdrawAmount, setWithdrawAmount] = useState<string>("5");
    const [withdrawing, setWithdrawing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [poolInfo, setPoolInfo] = useState<{
        exists: boolean;
        poolBalance?: number;
    }>({ exists: false });
    const [loading, setLoading] = useState(true);

    // Check if the user has a game pool
    useEffect(() => {
        const checkGamePool = async () => {
            if (!account?.address) {
                setPoolInfo({ exists: false });
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const response = await aptosClient.view({
                    payload: {
                        function: `${ABI.address}::allin_bet::get_game_info`,
                        functionArguments: [account.address],
                    },
                });

                setPoolInfo({
                    exists: true,
                    poolBalance: Number(response[3]) / 100000000, // Convert from octas to APT
                });
            } catch (err) {
                console.log("User doesn't have a game pool or error occurred", err);
                setPoolInfo({ exists: false });
            } finally {
                setLoading(false);
            }
        };

        checkGamePool();
    }, [account?.address, success]);

    const handleWithdraw = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!account) return;

        setWithdrawing(true);
        setError(null);
        setSuccess(false);

        try {
            const response = await signAndSubmitTransaction({
                sender: account.address,
                data: {
                    function: `${ABI.address}::allin_bet::withdraw_pool`,
                    typeArguments: [],
                    functionArguments: [
                        parseFloat(withdrawAmount) * 1_00000000, // Convert to octas
                    ],
                },
            });

            await aptosClient.waitForTransaction({ transactionHash: response.hash });
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || "提取资金失败");
            console.error(err);
        } finally {
            setWithdrawing(false);
        }
    };

    if (loading) {
        return (
            <div className="nes-container is-dark with-title">
                <p className="title">你的游戏池</p>
                <p>加载中...</p>
            </div>
        );
    }

    if (!poolInfo.exists) {
        return (
            <div className="nes-container is-dark with-title">
                <p className="title">你的游戏池</p>
                <p>
                    你还没有游戏池。创建一个以开始接受投注！
                </p>
            </div>
        );
    }

    return (
        <div className="nes-container is-dark with-title">
            <p className="title">你的游戏池</p>
            <div className="mb-4">
                <p>可用资金: {poolInfo.poolBalance?.toFixed(2)} APT</p>
            </div>

            <form onSubmit={handleWithdraw} className="flex flex-col gap-4">
                <div className="nes-field">
                    <label htmlFor="withdraw-amount">提取金额 (APT)</label>
                    <input
                        id="withdraw-amount"
                        type="number"
                        className="nes-input"
                        step="0.1"
                        min="0.1"
                        max={poolInfo.poolBalance}
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        required
                    />
                </div>

                <button
                    type="submit"
                    className={cn(
                        "nes-btn is-warning",
                        withdrawing && "is-disabled cursor-not-allowed"
                    )}
                    disabled={withdrawing}
                >
                    {withdrawing ? "处理中..." : "提取资金"}
                </button>

                {error && <p className="text-red-500">{error}</p>}
                {success && (
                    <p className="text-green-500">
                        成功提取 {withdrawAmount} APT！
                    </p>
                )}
            </form>
        </div>
    );
}