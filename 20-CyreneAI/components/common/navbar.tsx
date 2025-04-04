"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { FaBars, FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useAptosWallet } from "@/hooks/useAptosWallet";
import AptosConnectBtn from "@/components/common/AptosConnectBtn";

const Navbar = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const { account, connected } = useAptosWallet();
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [isExpanded, setIsExpanded] = useState(false);

  const handleHomeClick = () => {
    localStorage.removeItem("currentAgentId");
    localStorage.removeItem("currentAgentName");
    localStorage.removeItem("currentAgentImage");
    router.replace("/");
  };

  useEffect(() => {
    if (account?.address) {
      const address = account.address.toString();
      setWalletAddress(address);
      localStorage.setItem("walletAddress", address);
    } else {
      const savedAddress = localStorage.getItem("walletAddress") || "";
      setWalletAddress(savedAddress);
    }

    // Trigger expansion animation after a delay
    const timer = setTimeout(() => {
      setIsExpanded(true);
    }, 1000); // 1 second delay before expansion

    return () => clearTimeout(timer);
  }, [account]);

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/explore-agents", label: "Explore Agents" },
    { path: "/launch-agent", label: "Launch Agent" },
  ];

  const getNavItemClass = (path: string) => {
    const isActive = pathname === path;
    return `relative px-4 py-2 rounded-full transition-all duration-300 ${
      isActive
        ? "text-white bg-gradient-to-r from-blue-600 to-blue-400 font-bold"
        : "text-white hover:bg-white/10"
    }`;
  };

  const getMobileNavItemClass = (path: string) => {
    const isActive = pathname === path;
    return `px-4 py-2 rounded-full transition-all duration-300 ${
      isActive
        ? "text-white bg-gradient-to-r from-blue-600 to-blue-400 font-bold"
        : "text-white hover:bg-white/10"
    }`;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#030014]/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" onClick={handleHomeClick}>
              <Image
                src="/CyreneAI_logo-text.png"
                alt="CyreneAI Logo"
                width={150}
                height={40}
                className="cursor-pointer"
              />
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={getNavItemClass(item.path)}
                >
                  {item.label}
                </Link>
              ))}
              <AptosConnectBtn />
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white hover:text-gray-300 focus:outline-none"
            >
              {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={getNavItemClass(item.path)}
                >
                  {item.label}
                </Link>
              ))}
              <AptosConnectBtn />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
