"use client"

import { Card } from "@/components/ui/card";
import Link from "next/link";
import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from 'next/navigation';
import { cn } from "@/lib/utils";
import Image from "next/image";
import { motion } from "framer-motion";
import StarCanvas from "@/components/StarCanvas";
import { Search } from 'lucide-react';
import { GlowButton } from "@/components/ui/glow-button";

interface Agent {
  id: string;
  name: string;
  domain: string;
  status: 'active' | 'paused' | 'stopped';
  clients: string[];
  port: string;
  image: string;
  description: string;
  avatar_img: string;
  cover_img: string;
  organization: string; // Add this field
}

const agentApi = {
  async getAgents(): Promise<Agent[]> {
    try {
      const response = await axios.get('/api/getAgents');
      return response.data.agents || [];
    } catch (error) {
      // console.error("Failed to fetch agents:", error);
      return [];
    }
  },
};

const GRADIENT_COLORS = 'linear-gradient(45deg, #0162FF, white, #A63FE1, #0162FF)';

const AgentCard = ({ agent, index, onChatClick }: { 
  agent: Agent; 
  index: number;
  onChatClick: () => void;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    whileHover={{ y: -5 }}
    className="flex justify-center group"
  >
    <div className="relative w-full max-w-[400px]">
      {/* Card with same glow effect as buttons */}
      <div
        style={{
          position: 'absolute',
          content: '""',
          background: GRADIENT_COLORS,
          top: '-2px',
          left: '-2px',
          backgroundSize: '400%',
          zIndex: -1,
          filter: 'blur(5px)',
          width: 'calc(100% + 4px)',
          height: 'calc(100% + 4px)',
          animation: 'glowing-button 20s linear infinite',
          transition: 'opacity 0.3s ease-in-out',
          opacity: '0.1',
        }}
        className="group-hover:opacity-100"
      />
      
      <Card className="relative w-full bg-transparent backdrop-blur-xl rounded-2xl overflow-hidden z-10 border-blue-900/50">
        <div className="relative w-full h-48">
          <Image 
            src={agent.cover_img ? `https://ipfs.erebrus.io/ipfs/${agent.cover_img}` : "/cyrene_cover_2-1-85.png"} 
            alt={`${agent.name} cover`} 
            fill
            className="object-cover opacity-80"
          />
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 top-20">
          <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-gray-900 shadow-xl">
            <Image 
              src={agent.avatar_img ? `https://ipfs.erebrus.io/ipfs/${agent.avatar_img}` : agent.image} 
              alt={agent.name} 
              fill
              className={cn(
                "object-cover transition-transform duration-300 group-hover:scale-110",
                agent.name === "cyrene" && "object-contain"
              )}
            />
          </div>
        </div>

        <div className="p-6 mt-20">
          <h2 className="text-xl font-bold text-white mb-4 text-center">{agent.name}</h2>
          
          {/* <p className="text-gray-400 mb-4 line-clamp-2 text-center">{agent.description}</p> */}
          
          <GlowButton
            onClick={onChatClick}
            style={{ width: '100%', padding: '0.8em', borderRadius: '999px', fontSize: '15px', fontWeight: '500' }}
          >
            Chat with {agent.name}
          </GlowButton>
        </div>
      </Card>
    </div>
  </motion.div>
);

export default function ExploreAgents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const setChatAgent = (id: string, name: string, avatar_img: string, cover_img: string) => {
    localStorage.setItem('currentAgentId', id);
    localStorage.setItem('currentAgentName', name);
    localStorage.setItem('currentAgentImage', avatar_img ? `https://ipfs.erebrus.io/ipfs/${avatar_img}` : '');
    localStorage.setItem('currentAgentCoverImage', cover_img ? `https://ipfs.erebrus.io/ipfs/${cover_img}` : '');
    localStorage.setItem('scrollToSection', 'target-section');
    router.push(`/explore-agents/chat/${id}`);
  };

  const mockAgents = useMemo(() => [
    {
      name: "Orion",
      image: "/orion.png",
      description: "Orion gathers and delivers essential news, keeping businesses ahead of the curve.",
      organization: "other",
    },
    {
      name: "Elixia",
      image: "/elixia.png",
      description: "Elixia posts creative content to drive engagement and build community.",
      organization: "other",
    },
    {
      name: "Solis",
      image: "/solis.png",
      description: "Solis illuminates the path to success with data-driven clarity and strategic insight.",
      organization: "other",
    },
    {
      name: "Auren",
      image: "/auren.png",
      description: "Auren is here to guide you, bringing warmth and clarity to every customer interaction.",
      organization: "other",
    },
    {
      name: "Cyrene",
      image: "/cyrene_profile.png",
      description: "Cyrene cosmic presence from the Andromeda Galaxy, here to help you navigate technology and privacy with love and wisdom.",
      organization: "cyrene",
    },
  ], []);
  
  const fetchAgents = useCallback(async () => {
    const fetchedAgents = await agentApi.getAgents();
    
    // Filter agents to only include those with organization 'cyrene'
    const filteredFetchedAgents = fetchedAgents.filter((agent) => agent.organization === 'cyrene');

    const filteredMockAgents = mockAgents.filter(
      (mock) => mock.image !== "/cyrene_profile.png" && mock.image !== "/elixia.png"
    );

    const enrichedAgents = filteredFetchedAgents.map((agent) => {
      if (agent.name === "cyrene") {
        const cyreneMock = mockAgents.find((mock) => mock.name === "Cyrene");
        return {
          ...agent,
          image: "/cyrene_profile.png",
          description: cyreneMock?.description || agent.description,
        };
      } else if (agent.name === "Elixia") {
        const elixiaMock = mockAgents.find((mock) => mock.name === "Elixia");
        return {
          ...agent,
          image: "/elixia.png",
          description: elixiaMock?.description || agent.description,
        };
      } else {
        const randomMockAgent =
          filteredMockAgents[Math.floor(Math.random() * filteredMockAgents.length)];
        return {
          ...agent,
          image: randomMockAgent.image,
          description: randomMockAgent.description,
        };
      }
    });

    setAgents((prev) => {
      if (JSON.stringify(prev) === JSON.stringify(enrichedAgents)) return prev;
      return enrichedAgents;
    });
  }, [mockAgents]);
  
  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  // Filter agents based on search query only
  const filteredAgents = useMemo(() => {
    return agents.filter(agent => {
      return agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             agent.description.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [agents, searchQuery]);

  return (
    <>
      <StarCanvas />

      <div className="relative min-h-screen py-20 px-4 overflow-hidden mt-24">
        {/* Gradient Orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#0162FF] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-[#A63FE1] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-[#3985FF] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />

        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Title Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#0162FF] via-[#3985FF] to-[#A63FE1] bg-clip-text text-transparent">
              Explore Agents
            </h1>
            <p className="mt-4 text-gray-400">
              Discover and interact with our diverse collection of AI agents
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-12"
          >
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-100" />
              <input
                type="text"
                placeholder="Search agents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-full
                         text-white placeholder-gray-400 focus:outline-none focus:border-[#3985FF]/50
                         transition-all duration-300"
              />
            </div>
          </motion.div>

          {/* Launch Agent Button with rainbow gradient effect */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex justify-end mb-8"
          >
            <Link href={'launch-agent'}>
              <GlowButton
                style={{
                  padding: '0.6em 2em',
                  borderRadius: '10px',
                  fontSize: '16px',
                  fontWeight: '500'
                }}
              >
                Launch Agent
              </GlowButton>
            </Link>
          </motion.div>

          {/* Agents Grid */}
          {filteredAgents.length > 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredAgents.map((agent, index) => (
                <AgentCard
                  key={index}
                  agent={agent}
                  index={index}
                  onChatClick={() => setChatAgent(
                    agent.id, 
                    agent.name, 
                    agent.avatar_img, 
                    agent.cover_img
                  )}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-gray-400 mt-12"
            >
              No agents found matching your search criteria
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}