# 15-allin_bet

一个基于Aptos区块链的去中心化投注游戏平台，允许用户创建游戏池并参与投注活动。

项目地址：https://github.com/lysrain21/Allin_bet.git

demo视频：https://youtu.be/H2sBP64GkKI

demo网站：https://allin-bet-iota.vercel.app/

## 项目概述

Allin Bet是一个运行在Aptos区块链上的投注游戏平台，通过智能合约确保游戏的公平性和透明度。用户可以创建游戏池，设置入场费和奖励规则，其他用户可以自由加入游戏并参与投注。

## 功能特性

- **创建游戏池**: 用户可以创建自定义游戏池，设置入场费和基本参数
- **参与游戏**: 任何地址都可以参与已创建的游戏，支付入场费加入
- **抽奖机制**: 公平、透明的随机数生成用于决定游戏结果
- **提取奖金**: 获胜者可以从游戏池中提取奖金
- **查看游戏历史**: 浏览过去的游戏记录和结果

## 技术架构

### 前端 (frontend/)
- Next.js 13
- React 18
- TypeScript
- Tailwind CSS
- Aptos Web3 SDK

### 智能合约 (move/)
- Aptos Move语言
- 使用Aptos框架库

## 开始使用

### 前提条件
- Node.js 18+
- PNPM
- Aptos CLI
- Aptos钱包

### 安装

1. 克隆代码库
```bash
git clone https://github.com/yourusername/allin_bet.git
cd allin_bet
