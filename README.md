# 项目提交指南

## 提交流程

1. 进入黑客松官方 [GitHub](https://github.com/MovemakerHQ/EVERMOVE-Hackerhouse-HK-2025) 仓库 —— `EVERMOVE-Hackerhouse-HK-2025`。

2. 选择 "**Fork**" 以将官方仓库复制到您的个人 GitHub 仓库；

   **注意**："Fork" 意味着创建官方仓库的个人副本。您可以在该副本上进行任何更改，并将这些更改提交到官方仓库，管理员会审核并合并您的更改。

3. 将 Fork 之后的仓库克隆到您的本地设备：

   ```
   git clone https://github.com/YOUR_USERNAME/EVERMOVE-Hackerhouse-HK-2025.git
   ```

4. 在本地整理文件：首先，创建一个项目文件夹（`ID-Name`），并将要提交的文件放入该文件夹内。**请勿修改或提交该文件夹以外的任何文件**。

   | 提交内容                                                                                    |
   | ------------------------------------------------------------------------------------------- |
   | （需提交的文件）                                                                            |
   | 演示文稿（必填）                                                                            |
   | DEMO 链接或项目介绍视频链接（选填；视频应上传至 YouTube 等视频平台，且时长不得超过 5 分钟） |
   | GitHub 项目链接                                                                             |
   | 其他任何支持性材料                                                                          |

5. 将更改后的分支推送到您的 GitHub 远程仓库：

   ```
   git add .
   git commit -m "项目名称 结果提交"
   git push
   ```

6. 通过 PR（Pull Request）提交更改到官方仓库，并填写必要的提交信息。具体流程如下：

   - 进入官方仓库。

   - 选择 [Pull requests]。

   - 点击 "New pull request"（新建 PR）。

   - 点击 “compare across forks”，然后在主仓库的下拉列表中选择您的 Fork 仓库。

   - 填写 Pull Request 的提交说明。

     > PR 命名格式应如下：**序号-团队名称-项目名称-团队成员**

# Project Submission Guidelines

## Submission Process

1. Enter the official [GitHub](https://github.com/MovemakerHQ/EVERMOVE-Hackerhouse-HK-2025) - `EVERMOVE-Hackerhouse-HK-2025` repository of the hackerhouse.

2. Select "**Fork**" to copy the official repository to your personal GitHub repository;

   Note: "Fork" means creating a personal copy of the repository. You can make any changes on the personal copy and submit those changes to the original repository, and the admin will review and merge your changes.

3. Clone the copy of the Forked repository to your device;

   ```
   git clone https://github.com/YOUR_USERNAME/EVERMOVE-Hackerhouse-HK-2025.git
   ```

4. Arrange the files on your own device: First, create a project folder (`ID-Name`) and place the files to be submitted in this folder. Do not modify or submit any files outside of this folder.

   | Type Submissions in Folder                                                                                                                                |
   | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
   | (Files to be submitted）                                                                                                                                  |
   | Presentation slides (required)                                                                                                                            |
   | DEMO link or link to the project introduction video (optional; the video should be uploaded to video platforms like YouTube and may not exceed 5 minutes) |
   | Github link                                                                                                                                               |
   | Any other support material                                                                                                                                |

5. Push the changed branch to the remote branch under your Github account;

   ```
   git add .
   git commit -m "Project Name Results Delivery"
   git push
   ```

6. Submit a copy of the changes to the official repository through PR (Pull Request) and fill in the required submission information. The specific process is as follows:

   - Enter the official repository.

   - Select [Pull requests].

   - # Allin Bet

     一个基于 Aptos 区块链的去中心化投注游戏平台，允许用户创建游戏池并参与投注活动。

     ## 项目概述

     Allin Bet 是一个运行在 Aptos 区块链上的投注游戏平台，通过智能合约确保游戏的公平性和透明度。用户可以创建游戏池，设置入场费和奖励规则，其他用户可以自由加入游戏并参与投注。

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

     - Aptos Move 语言
     - 使用 Aptos 框架库

     ## 开始使用

     ### 前提条件

     - Node.js 18+
     - PNPM
     - Aptos CLI
     - Aptos 钱包

     ### 安装

     1. 克隆代码库

     ```bash
     git clone https://github.com/yourusername/allin_bet.git
     cd allin_bet

     ```

   - Click on "New pull request".

   - Click on “compare across forks”, and select your repository on the drop-down list of the main repository.

   - Fill in your submission notes for the Pull Request.

     > Here's how you should name the PR: ID name-project name-team members

---

## 🎯 游戏概述（一句话）

庄主选出两张公开牌作为挑战目标，玩家先抽一张牌决定是否继续挑战；若继续，则抽第二张牌，与庄主牌面“**乘积**”比大小，胜者获得奖池奖励。——抽中 🃏 鬼牌直接胜利，赢得掌声与奖池！

---

## 🧱 一、玩法流程

### 🎯 Step 1：庄主设盘

- 👑 庄主（Dealer）创建一盘游戏。
- 从 13 张标准扑克牌（A~K）中**任选两张牌**作为【庄家公开牌】。
- 为该局注入 **初始资金**（如 10 枚代币）作为初始奖池。
- 游戏过程中，每当有玩家挑战成功，**庄主将从其奖金中抽取 25% 作为手续费**，由系统自动累积。
- **当庄主选择结束该盘游戏时**：
  - 可一次性提取**所有已累积的抽成奖励**；
  - 当前奖池中**未被发放的剩余资金将自动注入平台的超大奖金池**，用于后续激励机制。

### 🎮 Step 2：玩家发起挑战

### 👤 玩家（Challenger）

- 选择一盘游戏进行开局
- **抵押代币**（初始资金的 10%）参与挑战。
- 系统为玩家从牌堆中**随机抽取一张牌（第一张）**
  ### ✅ 若第一张牌为 **Joker（大小鬼）**：
  🎉 立即判定胜利！玩家可拿回入场费，并获得奖池 30% 奖励
  ### 🧠 若不是 Joker，则玩家需要做出抉择：
  | 选项         | 资金处理                     |
  | ------------ | ---------------------------- |
  | **弃局**     | 拿回 85%，剩余流进奖金池     |
  | **继续挑战** | 再抽一张随机牌，进行乘积对比 |

### 🎲 Step 3：判断胜负（玩家选择继续）

- 玩家两张牌 **点数相乘** 得到挑战值。
- 庄家牌面点数也相乘，作为庄家得分。

### 🎲 结果比较：

| 结果                | 奖励机制                                                   |
| ------------------- | ---------------------------------------------------------- |
| 玩家乘积 > 庄主得分 | 玩家胜利，返还押金，并获得奖池 × 30%，庄主抽成玩家收益 25% |
| 玩家乘积 ≤ 庄主得分 | 玩家失败，押金进入奖池                                     |
| 任意 Joker          | 直接胜利，返还押金，并获得奖池 30%                         |

---

---

## 🧩 三、胜负逻辑 & 奖励流转

---

![image.png](attachment:f1e45d5a-42a0-42c6-897b-ba3f7efbdd2e:image.png)

## 🧮 四、牌面点数规则

| **牌型** | **A** | **2-10** | **J** | **Q** | **K** | **Joker** |
| -------- | ----- | -------- | ----- | ----- | ----- | --------- |
| 点数     | 1     | 原值     | 11    | 12    | 13    | 特殊      |

## 🏆 超大奖金池玩法规则（Mega Pool）

为了进一步提升奖励刺激性与平台参与度，**每一盘游戏结束后，未被领取的奖池剩余资金**将自动注入平台的**超大奖金池（Mega Pool）**，成为全体玩家可参与抽奖的长期累积大奖。

---

### 🎮 玩法流程

- 玩家支付 **5 枚代币**作为入场费参与超大奖金池抽牌。
- 系统从牌堆中**随机发放 1 张牌**给玩家（范围：A~K）。
- 根据抽到的牌面点数判断结果：

| 抽中点数      | 奖励结果                                   |
| ------------- | ------------------------------------------ |
| > 7（即 8~K） | 🎉 获得 **2 倍入场费奖励**（即 10 枚代币） |
| ≤ 7（即 A~7） | 💸 本次入场费（5 枚）将流入超大奖金池中    |
