"use client";

import { cn } from "@/utils/styling";
import { useState, useEffect } from "react";

interface PlayingCardProps {
    value: number; // 0-13，其中0为Joker，1为Ace，11-13为J,Q,K
    className?: string;
}

export function PlayingCard({ value, className }: PlayingCardProps) {
    const [valueStr, setValueStr] = useState<string>("?");
    const [bgcolor, setBgcolor] = useState<string>("bg-gray-700");

    useEffect(() => {
        // 设置卡牌上显示的值
        if (value === 0) {
            setValueStr("🃏");
            setBgcolor("bg-purple-800");
        } else if (value === 1) {
            setValueStr("A");
            setBgcolor("bg-red-800");
        } else if (value >= 2 && value <= 10) {
            setValueStr(value.toString());
            setBgcolor("bg-blue-800");
        } else if (value === 11) {
            setValueStr("J");
            setBgcolor("bg-green-800");
        } else if (value === 12) {
            setValueStr("Q");
            setBgcolor("bg-yellow-800");
        } else if (value === 13) {
            setValueStr("K");
            setBgcolor("bg-orange-800");
        } else {
            setValueStr("?");
            setBgcolor("bg-gray-700");
        }
    }, [value]);

    return (
        <div
            className={cn(
                "w-16 h-24 rounded-md flex items-center justify-center border-2 border-white",
                bgcolor,
                className
            )}
        >
            <span className="text-2xl font-bold text-white">{valueStr}</span>
        </div>
    );
}