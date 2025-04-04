"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/utils/styling";

interface GameModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export function GameModal({ isOpen, onClose, title, children }: GameModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);

    // 在组件挂载后设置 mounted 为 true
    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    // 点击模态框外部关闭
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        }

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, onClose]);

    // 按ESC键关闭模态框
    useEffect(() => {
        function handleEscKey(event: KeyboardEvent) {
            if (event.key === "Escape") {
                onClose();
            }
        }

        if (isOpen) {
            document.addEventListener("keydown", handleEscKey);
        }

        return () => {
            document.removeEventListener("keydown", handleEscKey);
        };
    }, [isOpen, onClose]);

    // 如果未挂载或对话框未打开，则不渲染任何内容
    if (!mounted || !isOpen) return null;

    // 使用Portal将模态框渲染到body元素
    return createPortal(
        <div className="fixed inset-0 flex items-center justify-center z-[9999] bg-black bg-opacity-70">
            <div
                ref={modalRef}
                className="relative bg-gray-800 rounded-lg overflow-hidden max-w-lg w-full max-h-[80vh] m-4"
            >
                <div className="nes-container is-dark p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">{title}</h2>
                        <button
                            onClick={onClose}
                            className="nes-btn is-error"
                            style={{ padding: "0px 6px", lineHeight: "1" }}
                        >
                            X
                        </button>
                    </div>
                    <div className="overflow-auto max-h-[60vh]">
                        {children}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}