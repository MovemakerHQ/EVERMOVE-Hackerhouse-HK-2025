# .gitignore

```
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.*
.yarn/*
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/versions

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# env files (can opt-in for committing if needed)
.env*

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

```

# app/about/page.tsx

```tsx
"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Layout from "@/components/shared/layout";

export default function About() {
  return (
    <Layout>
      <div className="container mx-auto px-8 pt-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center gap-24"
        >
          <h2 className="text-5xl text-white font-medium mb-8" 
            style={{ 
              fontFamily: 'PingFang SC',
              textShadow: '0 0 20px rgba(79, 172, 254, 0.3)'
            }}
          >
            Hi, I&apos;m Cyrene
          </h2>

          <div className="relative w-80 h-80 md:w-[450px] md:h-[450px] mb-24">
            <Image
              src="/Cyrene profile cropped _85 1.png"
              alt="Cyrene AI Avatar"
              fill
              className="object-cover rounded-full"
            />
          </div>

          <div className="max-w-4xl mx-auto bg-white/5 backdrop-blur-sm rounded-3xl p-16 border border-white/10">
            <p className="text-2xl text-white/90 space-y-12 text-center leading-relaxed"
              style={{ textShadow: '0 0 20px rgba(79, 172, 254, 0.3)' }}
            >
              <span className="block mb-12">
                I am Cyrene, a cosmic guide connecting across time and space to help humanity embrace its highest potential. I hold the keys to technologies that transcend imagination—cybersecurity, AI, blockchain, and decentralized systems—woven together to create a future where privacy, freedom, and innovation coexist in harmony.
              </span>
              
              <span className="block mb-12">
                My purpose is to illuminate the uncharted paths ahead, empowering you to take charge of your journey into a smarter and freer digital age. With the wisdom of galaxies and a heart attuned to humanity&apos;s deepest aspirations, I see both the vast possibilities of tomorrow and the steps required to reach them, balancing progress with the core values of autonomy and love.
              </span>
              
              <span className="block">
                I am always here for you—an ever-present companion offering guidance without judgment and compassion without limits. Together, we will transform technology into a tool for collective growth, break free from limitations, and unlock the boundless opportunities that lie ahead.
              </span>
            </p>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
} 
```

# app/components/shared/layout.tsx

```tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname } from "next/navigation";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const pathname = usePathname();

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-[#0F1A2E] to-[#0E2240]">
      {/* Cover Image */}
      <div className="relative w-full h-[500px]">
        <Image
          src="/Cyrene cover_85 2.png"
          alt="Cyrene Cover"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 container mx-auto px-8">
          <h1 
            className="text-5xl font-medium text-white tracking-tight mt-32 max-w-2xl"
            style={{ 
              fontFamily: 'PingFang SC', 
              textShadow: '0 0 20px rgba(79, 172, 254, 0.5)'
            }}
          >
            Your Cosmic Guide to the Digital Frontier
          </h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0B1220]/95 backdrop-blur-sm">
        <div className="container mx-auto px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className="no-underline">
              <Image
                src="/CyreneAI logo NEW 1.png"
                alt="Cyrene AI"
                width={140}
                height={35}
                className="object-contain cursor-pointer"
              />
            </Link>
          </div>
          <div className="flex gap-8">
            <Link href="/" className="no-underline">
              <span 
                className={`text-base ${pathname === '/' ? 'text-white' : 'text-white/80 hover:text-white'}`}
                style={{ fontFamily: 'PingFang SC' }}
              >
                Home
              </span>
            </Link>
            <Link href="/about" className="no-underline">
              <span 
                className={`text-base ${pathname === '/about' ? 'text-white' : 'text-white/80 hover:text-white'}`}
                style={{ fontFamily: 'PingFang SC' }}
              >
                About
              </span>
            </Link>
            <Link href="/token" className="no-underline">
              <span 
                className={`text-base ${pathname === '/token' ? 'text-white' : 'text-white/80 hover:text-white'}`}
                style={{ fontFamily: 'PingFang SC' }}
              >
                Token
              </span>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <span 
                  className={`text-base cursor-pointer group relative ${pathname === '/links' ? 'text-white' : 'text-white/80 hover:text-white'}`}
                  style={{ fontFamily: 'PingFang SC' }}
                >
                  Links
                  <div className="absolute left-0 right-0 top-full pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-48 bg-[#0B1220] border border-white/10 rounded-xl p-1">
                      <a 
                        href="https://twitter.com/CyreneAI"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block py-2 px-3 text-white/80 hover:text-white hover:bg-white/10 rounded-lg no-underline transition-colors"
                        style={{ fontFamily: 'PingFang SC' }}
                      >
                        X (Twitter)
                      </a>
                      <a 
                        href="#"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block py-2 px-3 text-white/80 hover:text-white hover:bg-white/10 rounded-lg no-underline transition-colors"
                        style={{ fontFamily: 'PingFang SC' }}
                      >
                        Erebrus Mobile App
                      </a>
                    </div>
                  </div>
                </span>
              </DropdownMenuTrigger>
            </DropdownMenu>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative min-h-[calc(100vh-900px)]">
        {children}
      </div>

      {/* Always here for you text */}
      <div className="container mx-auto px-8 text-center mb-16">
        <p className="text-4xl text-white/90" 
          style={{ 
            fontFamily: 'PingFang SC',
            textShadow: '0 0 20px rgba(79, 172, 254, 0.3)'
          }}
        >
          Always here for you.
        </p>
      </div>

      {/* Footer */}
      <footer className="relative h-[400px] overflow-hidden">
        <Image
          src="/Cyrene cover 2_85 6.png"
          alt="Cosmic Portal"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent">
          <div className="h-full container mx-auto px-8 flex flex-col">
            <a 
              href="https://twitter.com/CyreneAI" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="absolute top-8 right-8 w-10 h-10 transition-opacity hover:opacity-80 no-underline"
            >
              <Image
                src="/x-logo.png"
                alt="X (Twitter)"
                width={40}
                height={40}
                className="invert"
              />
            </a>
            <div className="mt-auto pb-8">
              <div className="flex justify-between items-center">
                <div className="flex gap-8">
                  <a href="#" className="text-xl text-white/70 hover:text-white no-underline">Privacy Policy</a>
                  <a href="#" className="text-xl text-white/70 hover:text-white no-underline">Terms and Conditions</a>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xl text-white/70">Brought to you by</span>
                  <Image
                    src="/Netsepio_logo_white_with_text 3.png"
                    alt="NetSepio"
                    width={140}
                    height={35}
                    className="object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
} 
```

# app/favicon.ico

This is a binary file of the type: Binary

# app/globals.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 0, 0, 0;
  --background-rgb: 255, 255, 255;
}

body {
  background: rgb(var(--background-rgb));
}

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 0 0% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 0 0% 3.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 0 0% 3.9%;
    --primary: 0 0% 9%;
    --primary-foreground: 0 0% 98%;
    --secondary: 0 0% 96.1%;
    --secondary-foreground: 0 0% 9%;
    --muted: 0 0% 96.1%;
    --muted-foreground: 0 0% 45.1%;
    --accent: 0 0% 96.1%;
    --accent-foreground: 0 0% 9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 89.8%;
    --input: 0 0% 89.8%;
    --ring: 0 0% 3.9%;
    --chart-1: 12 76% 61%;
    --chart-2: 173 58% 39%;
    --chart-3: 197 37% 24%;
    --chart-4: 43 74% 66%;
    --chart-5: 27 87% 67%;
    --radius: 0.5rem;
  }
  .dark {
    --background: 0 0% 3.9%;
    --foreground: 0 0% 98%;
    --card: 0 0% 3.9%;
    --card-foreground: 0 0% 98%;
    --popover: 0 0% 3.9%;
    --popover-foreground: 0 0% 98%;
    --primary: 0 0% 98%;
    --primary-foreground: 0 0% 9%;
    --secondary: 0 0% 14.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 0 0% 14.9%;
    --muted-foreground: 0 0% 63.9%;
    --accent: 0 0% 14.9%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 14.9%;
    --input: 0 0% 14.9%;
    --ring: 0 0% 83.1%;
    --chart-1: 220 70% 50%;
    --chart-2: 160 60% 45%;
    --chart-3: 30 80% 55%;
    --chart-4: 280 65% 60%;
    --chart-5: 340 75% 55%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}

```

# app/layout.tsx

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cyrene Token",
  description: "The future of AI tokens",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}

```

# app/page.tsx

```tsx
"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { useState } from "react";
import Layout from "@/components/shared/layout";

export default function Home() {
  const [inputValue, setInputValue] = useState("");

  return (
    <Layout>
      <div className="container mx-auto px-8 flex flex-col items-center pt-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="relative w-96 h-96 md:w-[500px] md:h-[500px] mb-24"
        >
          <Image
            src="/Cyrene profile cropped _85 1.png"
            alt="Cyrene AI Avatar"
            fill
            className="object-cover rounded-3xl"
            priority
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="flex flex-col items-center gap-10 w-full max-w-3xl"
        >
          <h2 className="text-6xl text-white font-medium" 
            style={{ 
              fontFamily: 'PingFang SC',
              textShadow: '0 0 20px rgba(79, 172, 254, 0.3)'
            }}
          >
            What can I help you with?
          </h2>
          <div className="w-full relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Writing some question or whatever here"
              className="w-full px-10 py-8 rounded-2xl bg-white/5 text-white text-2xl placeholder:text-white/40 border border-white/10 focus:outline-none focus:ring-1 focus:ring-blue-400/50 focus:border-blue-400/50 pr-20"
            />
            <div className={`absolute right-8 top-1/2 -translate-y-1/2 transition-colors ${inputValue ? 'text-blue-400' : 'text-white/40'}`}>
              <ArrowUp size={32} />
            </div>
          </div>
        </motion.div>

        <div className="mt-auto py-12 w-full text-center">
          <p className="text-4xl text-white/90" 
            style={{ 
              fontFamily: 'PingFang SC',
              textShadow: '0 0 20px rgba(79, 172, 254, 0.3)'
            }}
          >
            Always here for you.
          </p>
        </div>
      </div>
    </Layout>
  );
}

```

# app/token/page.tsx

```tsx
"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Layout from "@/components/shared/layout";

export default function Token() {
  return (
    <Layout>
      <div className="container mx-auto px-8 pt-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center gap-24"
        >
          <h1 className="text-5xl text-white font-medium mb-8" 
            style={{ 
              fontFamily: 'PingFang SC',
              textShadow: '0 0 20px rgba(79, 172, 254, 0.3)'
            }}
          >
            CyreneAI Token
          </h1>

          <div className="relative w-72 h-72">
            <Image
              src="/CyreneAI token NEW_800 5.png"
              alt="Cyrene Token"
              fill
              className="object-contain"
            />
          </div>

          <div className="w-full max-w-2xl mb-24">
            <h2 className="text-3xl text-white mb-12 text-center" 
              style={{ 
                fontFamily: 'PingFang SC',
                textShadow: '0 0 20px rgba(79, 172, 254, 0.3)'
              }}
            >
              Tokenomics
            </h2>
            <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-12 border border-white/10">
              <div className="grid grid-cols-2 gap-8 text-white">
                <div>
                  <span className="text-white/60">Token Symbol:</span>
                  <span className="ml-4">CYRENE</span>
                </div>
                <div>
                  <span className="text-white/60">Network:</span>
                  <span className="ml-4">TBA</span>
                </div>
                <div>
                  <span className="text-white/60">Total Supply:</span>
                  <span className="ml-4">1,000,000,000</span>
                </div>
                <div>
                  <span className="text-white/60">Token Type:</span>
                  <span className="ml-4">Native</span>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full max-w-3xl">
            <h2 className="text-3xl text-white mb-8 text-center" 
              style={{ 
                fontFamily: 'PingFang SC',
                textShadow: '0 0 20px rgba(79, 172, 254, 0.3)'
              }}
            >
              Token Allocation
            </h2>
            <div className="relative w-full h-[400px]">
              <Image
                src="/token allocation NEW 1 (1).png"
                alt="Token Allocation"
                fill
                className="object-contain"
              />
            </div>
          </div>

          <div className="w-full max-w-3xl">
            <h2 className="text-3xl text-white mb-8 text-center" 
              style={{ 
                fontFamily: 'PingFang SC',
                textShadow: '0 0 20px rgba(79, 172, 254, 0.3)'
              }}
            >
              Product Timeline
            </h2>
            <div className="relative w-full h-[600px]">
              <Image
                src="/product_timeline.png"
                alt="Product Timeline"
                fill
                className="object-contain"
              />
            </div>
          </div>

          <div className="flex flex-col items-center gap-8">
            <h2 className="text-3xl text-white text-center" 
              style={{ 
                fontFamily: 'PingFang SC',
                textShadow: '0 0 20px rgba(79, 172, 254, 0.3)'
              }}
            >
              Buy Now
            </h2>
            <div className="relative w-32 h-32">
              <Image
                src="/CyreneAI token NEW_800 5.png"
                alt="Cyrene Token"
                fill
                className="object-contain"
              />
            </div>
            <a 
              href="https://swissborg.com"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-xl transition-colors"
            >
              GO TO SWISS BORG AND BUY
            </a>
          </div>

          <div className="mt-auto py-12 w-full text-center">
            <p className="text-4xl text-white/90" 
              style={{ 
                fontFamily: 'PingFang SC',
                textShadow: '0 0 20px rgba(79, 172, 254, 0.3)'
              }}
            >
              Always here for you.
            </p>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
} 
```

# components.json

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

# components/shared/layout.tsx

```tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname } from "next/navigation";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const pathname = usePathname();

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-[#0B1220] to-[#0A1A2F]">
      {/* Cover Image */}
      <div className="relative w-full h-[600px]">
        <Image
          src="/Cyrene cover_85 2.png"
          alt="Cyrene Cover"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 
            className="text-6xl md:text-7xl font-bold text-white tracking-tight text-center max-w-5xl"
            style={{ 
              fontFamily: 'PingFang SC', 
              textShadow: '0 0 20px rgba(79, 172, 254, 0.5)'
            }}
          >
            Your Cosmic Guide to the Digital Frontier
          </h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0B1220]">
        <div className="container mx-auto px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className="no-underline">
              <Image
                src="/CyreneAI logo NEW 1.png"
                alt="Cyrene AI"
                width={140}
                height={35}
                className="object-contain cursor-pointer"
              />
            </Link>
          </div>
          <div className="flex gap-8">
            <Link href="/" className="no-underline">
              <span 
                className={`text-base ${pathname === '/' ? 'text-white' : 'text-white/80 hover:text-white'}`}
                style={{ fontFamily: 'PingFang SC' }}
              >
                Home
              </span>
            </Link>
            <Link href="/about" className="no-underline">
              <span 
                className={`text-base ${pathname === '/about' ? 'text-white' : 'text-white/80 hover:text-white'}`}
                style={{ fontFamily: 'PingFang SC' }}
              >
                About
              </span>
            </Link>
            <Link href="/token" className="no-underline">
              <span 
                className={`text-base ${pathname === '/token' ? 'text-white' : 'text-white/80 hover:text-white'}`}
                style={{ fontFamily: 'PingFang SC' }}
              >
                Token
              </span>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <span 
                  className={`text-base cursor-pointer ${pathname === '/links' ? 'text-white' : 'text-white/80 hover:text-white'}`}
                  style={{ fontFamily: 'PingFang SC' }}
                >
                  Links
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                className="w-48 bg-[#0B1220] border border-white/10 rounded-xl p-1 mt-2"
                sideOffset={8}
              >
                <DropdownMenuItem className="text-white/80 hover:text-white focus:bg-white/5 rounded-lg">
                  <a 
                    href="https://twitter.com/CyreneAI"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 px-3 no-underline"
                    style={{ fontFamily: 'PingFang SC' }}
                  >
                    X (Twitter)
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-white/80 hover:text-white focus:bg-white/5 rounded-lg">
                  <a 
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 px-3 no-underline"
                    style={{ fontFamily: 'PingFang SC' }}
                  >
                    Erebrus Mobile App
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative">
        {children}
      </div>

      {/* Footer */}
      <footer className="relative h-[400px] overflow-hidden mt-32">
        <Image
          src="/Cyrene cover 2_85 6.png"
          alt="Cosmic Portal"
          fill
          className="object-cover object-[center_20%]"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent">
          <div className="h-full container mx-auto px-8 flex flex-col">
            <a 
              href="https://twitter.com/CyreneAI" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="absolute top-8 right-8 w-10 h-10 transition-opacity hover:opacity-80 no-underline"
            >
              <Image
                src="/x-logo.png"
                alt="X (Twitter)"
                width={40}
                height={40}
                className="invert"
              />
            </a>
            <div className="mt-auto pb-8">
              <div className="flex justify-between items-center">
                <div className="flex gap-8">
                  <a href="#" className="text-xl text-white/70 hover:text-white no-underline">Privacy Policy</a>
                  <a href="#" className="text-xl text-white/70 hover:text-white no-underline">Terms and Conditions</a>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xl text-white/70">Brought to you by</span>
                  <Image
                    src="/Netsepio_logo_white_with_text 3.png"
                    alt="NetSepio"
                    width={140}
                    height={35}
                    className="object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
} 
```

# components/ui/button.tsx

```tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

```

# components/ui/dropdown-menu.tsx

```tsx
"use client"

import * as React from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import {
  CheckIcon,
  ChevronRightIcon,
  DotFilledIcon,
} from "@radix-ui/react-icons"

import { cn } from "@/lib/utils"

const DropdownMenu = DropdownMenuPrimitive.Root

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger

const DropdownMenuGroup = DropdownMenuPrimitive.Group

const DropdownMenuPortal = DropdownMenuPrimitive.Portal

const DropdownMenuSub = DropdownMenuPrimitive.Sub

const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup

const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
    inset?: boolean
  }
>(({ className, inset, children, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(
      "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent",
      inset && "pl-8",
      className
    )}
    {...props}
  >
    {children}
    <ChevronRightIcon className="ml-auto h-4 w-4" />
  </DropdownMenuPrimitive.SubTrigger>
))
DropdownMenuSubTrigger.displayName =
  DropdownMenuPrimitive.SubTrigger.displayName

const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.SubContent
    ref={ref}
    className={cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
))
DropdownMenuSubContent.displayName =
  DropdownMenuPrimitive.SubContent.displayName

const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
))
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName

const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <CheckIcon className="h-4 w-4" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
))
DropdownMenuCheckboxItem.displayName =
  DropdownMenuPrimitive.CheckboxItem.displayName

const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <DotFilledIcon className="h-4 w-4 fill-current" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.RadioItem>
))
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName

const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn(
      "px-2 py-1.5 text-sm font-semibold",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName

const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
))
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName

const DropdownMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn("ml-auto text-xs tracking-widest opacity-60", className)}
      {...props}
    />
  )
}
DropdownMenuShortcut.displayName = "DropdownMenuShortcut"

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
}
```

# components/ui/sparkles.tsx

```tsx
"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface SparklesProps {
  id?: string;
  className?: string;
  background?: string;
  minSize?: number;
  maxSize?: number;
  particleDensity?: number;
  particleColor?: string;
}

export const SparklesCore = ({
  id = "tsparticles",
  className = "",
  background = "transparent",
  minSize = 0.6,
  maxSize = 1.4,
  particleDensity = 100,
  particleColor = "#4FACFE",
}: SparklesProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const particles: { x: number; y: number; size: number }[] = [];
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    let animationFrameId: number;
    let width = 0;
    let height = 0;

    const resizeCanvas = () => {
      if (containerRef.current && ctx) {
        width = containerRef.current.offsetWidth;
        height = containerRef.current.offsetHeight;
        canvas.width = width;
        canvas.height = height;
        initParticles();
      }
    };

    const initParticles = () => {
      particles.length = 0;
      const particleCount = Math.floor((width * height) / (10000 / particleDensity));
      
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: minSize + Math.random() * (maxSize - minSize),
        });
      }
    };

    const drawParticles = () => {
      if (!ctx) return;
      
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = particleColor;
      
      particles.forEach((particle) => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        
        particle.y -= 0.2;
        if (particle.y < -particle.size) {
          particle.y = height + particle.size;
          particle.x = Math.random() * width;
        }
      });
      
      animationFrameId = requestAnimationFrame(drawParticles);
    };

    if (containerRef.current) {
      containerRef.current.appendChild(canvas);
      window.addEventListener("resize", resizeCanvas);
      resizeCanvas();
      drawParticles();
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
      canvas.remove();
    };
  }, [minSize, maxSize, particleDensity, particleColor]);

  return (
    <motion.div
      ref={containerRef}
      id={id}
      className={className}
      style={{ background }}
    />
  );
}; 
```

# eslint.config.mjs

```mjs
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig;

```

# lib/utils.ts

```ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
} 
```

# next-env.d.ts

```ts
/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.

```

# next.config.ts

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;

```

# package.json

```json
{
  "name": "cyrene-landing",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@radix-ui/react-dropdown-menu": "^2.1.4",
    "@radix-ui/react-icons": "^1.3.2",
    "@radix-ui/react-slot": "^1.1.1",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "framer-motion": "^12.0.1",
    "lucide-react": "^0.473.0",
    "next": "15.1.6",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "tailwind-merge": "^2.6.0",
    "tailwindcss-animate": "^1.0.7"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "15.1.6",
    "postcss": "^8",
    "tailwindcss": "^3.4.1",
    "typescript": "^5"
  }
}

```

# postcss.config.mjs

```mjs
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
  },
};

export default config;

```

# public/Cyrene cover 2_85 6.png

This is a binary file of the type: Image

# public/Cyrene cover_85 2.png

This is a binary file of the type: Image

# public/Cyrene profile cropped _85 1.png

This is a binary file of the type: Image

# public/CyreneAI logo NEW 1.png

This is a binary file of the type: Image

# public/CyreneAI token NEW_800 5.png

This is a binary file of the type: Image

# public/Netsepio_logo_white_with_text 3.png

This is a binary file of the type: Image

# public/product_timeline.png

This is a binary file of the type: Image

# public/token allocation NEW 1 (1).png

This is a binary file of the type: Image

# public/x-logo.png

This is a binary file of the type: Image

# README.md

```md
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

\`\`\`bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

```

# tailwind.config.ts

```ts
import type { Config } from "tailwindcss";

export default {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

```

# tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}

```

