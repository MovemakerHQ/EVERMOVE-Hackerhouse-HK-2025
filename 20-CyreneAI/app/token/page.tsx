"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import StarCanvas from "@/components/StarCanvas";

export default function Token() {
  return (
    <>
      <StarCanvas />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 md:pt-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center gap-8 sm:gap-10 md:gap-12 mb-32 sm:mb-40 md:mb-48"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl text-white font-medium" 
            style={{ 
              fontFamily: 'PingFang SC',
              textShadow: '0 0 20px rgba(79, 172, 254, 0.3)'
            }}
          >
            CyreneAI Token
          </h1>

          <div className="relative w-72 h-72 sm:w-96 sm:h-96 md:w-[500px] md:h-[500px]">
            <Image
              src="/CyreneAI token NEW_800 5.png"
              alt="Cyrene Token"
              className="object-contain"
              width={800}
              height={500}
            />
          </div>

          <div className="w-full max-w-sm mb-16 sm:mb-20 md:mb-24">
            <h2 className="text-2xl sm:text-2xl md:text-3xl text-white mb-8 sm:mb-10 md:mb-12 text-center" 
              style={{ 
                fontFamily: 'PingFang SC',
                textShadow: '0 0 20px rgba(79, 172, 254, 0.3)'
              }}
            >
              Tokenomics
            </h2>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-white/10">
              <div className="grid grid-cols-1 gap-3 sm:gap-4 text-white text-sm sm:text-base mx-auto">
                <div className="flex justify-between gap-4">
                  <span className="text-white/60">Token Symbol:</span>
                  <span>CYRENE</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-white/60">Token Name:</span>
                  <span>CyreneAI</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-white/60">Token Type:</span>
                  <span>Utility</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-white/60">Total Token Supply:</span>
                  <span>1,000,000,000</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-white/60">Network:</span>
                  <span>Solana</span>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full max-w-5xl mx-auto">
            <h2 className="text-2xl sm:text-2xl md:text-3xl text-white mb-8 sm:mb-10 md:mb-12 text-center" 
              style={{ 
                fontFamily: 'PingFang SC',
                textShadow: '0 0 20px rgba(79, 172, 254, 0.3)'
              }}
            >
              Token Allocation
            </h2>
            <div className="relative w-full max-w-4xl mx-auto">
              <Image
                src="/FINAL token allocation graphs 1.png"
                alt="Token Allocation"
                width={1200}
                height={800}
                className="w-full h-auto"
              />
            </div>
          </div>

          <div className="w-full max-w-3xl">
            <h2 className="text-2xl sm:text-2xl md:text-3xl text-white mb-6 sm:mb-8 text-center" 
              style={{ 
                fontFamily: 'PingFang SC',
                textShadow: '0 0 20px rgba(79, 172, 254, 0.3)'
              }}
            >
              Product Timeline
            </h2>
            <div className="relative w-full h-[400px] sm:h-[500px] md:h-[600px]">
              <Image
                src="/product_timeline.png"
                alt="Product Timeline"
                className="object-contain"
                fill
              />
            </div>
          </div>

          <div className="flex flex-col items-center gap-6 sm:gap-8">
            <h2 className="text-2xl sm:text-2xl md:text-3xl text-white text-center" 
              style={{ 
                fontFamily: 'PingFang SC',
                textShadow: '0 0 20px rgba(79, 172, 254, 0.3)'
              }}
            >
              Buy Now
            </h2>
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32">
              <Image
                src="/CyreneAI token NEW_800 5.png"
                alt="Cyrene Token"
                className="object-contain"
                width={800}
                height={500}
              />
            </div>
            <p 
              className="text-blue-400/90 text-lg sm:text-xl font-medium"
              style={{ 
                fontFamily: 'PingFang SC',
                textShadow: '0 0 20px rgba(79, 172, 254, 0.3)'
              }}
            >
              Coming Soon!
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
} 