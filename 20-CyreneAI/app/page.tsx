'use client'

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUp, Volume2, VolumeX, Mic, MicOff, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import VoiceManager from '@/utils/voiceUtils';
import { useAppKitAccount, useAppKitNetwork } from '@reown/appkit/react'; // Updated imports
import { Textarea } from "@/components/ui/textarea";
import StarCanvas from "@/components/StarCanvas";
import { UserAvatar } from '@/components/user-avatar';
import { ChatStorage } from '@/app/utils/chat-storage';

interface Message {
  isUser: boolean;
  text: string;
  audio?: string | null;
}

// Mock responses for testing
const mockResponses = [
  "Hello! I'm doing great, thank you for asking. I'm here to help you explore the fascinating world of AI and technology. What would you like to know?",
  "I'm a multi-talented AI assistant with expertise in cybersecurity, blockchain, and decentralized systems. I can help with technical questions, provide guidance on various topics, and even engage in natural conversations with voice responses.",
  "That's a great question! I specialize in natural language processing, voice synthesis, and understanding complex technical concepts. I can help explain difficult topics in simple terms.",
  "I'd be happy to help you with that. My knowledge spans across various domains including AI, machine learning, cybersecurity, and blockchain technology."
];

export default function Home() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const [selectedVoice, setSelectedVoice] = useState<string>('af_bella');
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => {
    // Load saved messages when component mounts
    if (typeof window !== 'undefined') {
      return ChatStorage.loadMessages();
    }
    return [];
  });
  const [isPlayingAudio, setIsPlayingAudio] = useState<{ [key: number]: boolean }>({});
  const audioRefs = useRef<{ [key: number]: HTMLAudioElement | null }>({});
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState("");
  const voiceManager = useRef(new VoiceManager());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<string>("");
  const { address, isConnected } = useAppKitAccount(); // Updated wallet logic
  const { switchNetwork } = useAppKitNetwork(); // For network switching

  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const agent = {
    name: "cyrene",
    image: "/cyrene_profile.png"
  };

  const [autoSlideIndex, setAutoSlideIndex] = useState(0);

  // Auto slide effect
  useEffect(() => {
    const timer = setInterval(() => {
      setAutoSlideIndex((prev) => (prev + 1) % 4);
    }, 3000); // Change slide every 3 seconds

    return () => clearInterval(timer);
  }, []);

  const features = [
    {
      title: "Self-Replicating AI",
      description: "Autonomous agents capable of seamless task execution and self-replication for enhanced reliability.",
      gradient: "from-blue-400 via-cyan-500 to-teal-600",
      bgGradient: "from-blue-500/20 via-cyan-500/20 to-teal-600/20",
      image: "/self-replicating-ai.jpg",
      fromLeft: true
    },
    {
      title: "Decentralized Infrastructure",
      description: "AI agents and MCP servers are hosted on Erebrus ĐVPN Nodes for secure and verifiable execution.",
      gradient: "from-teal-400 via-cyan-500 to-blue-600",
      bgGradient: "from-teal-500/20 via-cyan-500/20 to-blue-600/20",
      image: "/decentralized-infrastructure.jpg",
      fromLeft: false
    },
    {
      title: "Hyper Coherent Network",
      description: "Multi-agent coordination with real-time precision, fault tolerance and context synchronization.",
      gradient: "from-cyan-400 via-blue-500 to-indigo-600",
      bgGradient: "from-cyan-500/20 via-blue-500/20 to-indigo-600/20",
      image: "/hyper-coherent-network.jpg",
      fromLeft: true
    },
    {
      title: "Unstoppable Ecosystem",
      description: "Blockchain-backed security with ÐVPN technology ensures resilience.",
      gradient: "from-blue-400 via-indigo-500 to-cyan-600",
      bgGradient: "from-blue-500/20 via-indigo-500/20 to-cyan-600/20",
      image: "/ecosytem.jpg",
      fromLeft: false
    }
  ];

  const scrollToBottom = () => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  };

  useEffect(() => {
    const storedWalletAddress = localStorage.getItem("walletAddress");
    if (storedWalletAddress) {
      setWalletAddress(storedWalletAddress);
    }
  }, []);

  useEffect(() => {
    if (isConnected && address) {
      setWalletAddress(address);
      setUser(address);
      localStorage.setItem('walletAddress', address);
    } else {
      setWalletAddress(null);
      setUser("");
      localStorage.removeItem('walletAddress');
    }
  }, [isConnected, address]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add this effect to save messages whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      ChatStorage.saveMessages(messages);
    }
  }, [messages]);

  const handleSubmit = async (text: string, user: string, forceVoiceMode?: boolean) => {
    console.log("clicked");
    if (!text.trim() || isLoading) return;

    setIsLoading(true);
    setTranscription('');

    // Immediately show user message
    const userMessageIndex = messages.length;
    setMessages((prev) => [...prev, { isUser: true, text }]);
    setInputValue('');

    try {
      let responseText: string;
      let audioUrl: string | null = null;

      // Use forced voice mode or current state
      const useVoiceMode = forceVoiceMode || isVoiceMode;
      console.log('Voice mode status:', { forced: forceVoiceMode, current: isVoiceMode, using: useVoiceMode });

      // Get the message response
      const formData = new FormData();
      formData.append('text', text);
      formData.append('userId', user);
      formData.append('voice_mode', useVoiceMode.toString());

      if (agent.name === "cyrene") {
        const response = await fetch(`/api/chatCyrene`, {
          method: 'POST',
          body: formData
        });
        if (!response.ok) {
          console.error('Response error:', {
            status: response.status,
            statusText: response.statusText,
            url: response.url
          });
          throw new Error(`Failed to send message: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        responseText = data[0].text;

        if (useVoiceMode) {
          console.log('Voice mode active, generating voice for:', responseText);
          try {
            audioUrl = await voiceManager.current.generateVoice(responseText, selectedVoice);
            console.log('Voice generation result:', audioUrl ? 'success' : 'failed');
            if (audioUrl) {
              console.log('Playing audio...');
              if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
                audioRef.current.src = audioUrl;
                await audioRef.current.play().catch((err) => console.error('Audio playback error:', err));
              } else {
                const audio = new Audio(audioUrl);
                audioRef.current = audio;
                await audio.play().catch((err) => console.error('Audio playback error:', err));
              }
            } else {
              console.error('Voice generation returned null');
            }
          } catch (error) {
            console.error('Voice generation error:', error);
          }
        }

        // Add AI response
        if (!useVoiceMode || audioUrl) {
          setMessages((prev) => [
            ...prev,
            { isUser: false, text: responseText, audio: audioUrl }
          ]);
        }
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      setMessages((prev) => prev.filter((_, i) => i !== userMessageIndex));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = () => {
    if (isRecording) {
      voiceManager.current.stopListening();
      setIsRecording(false);
      return;
    }

    setIsRecording(true);
    voiceManager.current.startListening(
      async (text) => {
        setTranscription(text);
        // Force voice mode to be true for voice input
        const forceVoiceMode = true;
        await handleSubmit(text, user, forceVoiceMode);
      },
      () => setIsRecording(false)
    );
  };

  const exitVoiceMode = () => {
    setIsVoiceMode(false);
    setIsRecording(false);
    voiceManager.current.stopListening();
  };

  const toggleAudio = (index: number) => {
    const message = messages[index];

    if (!message.audio) return;

    if (audioRef.current) {
      // If the same audio is already playing, pause it
      if (isPlayingAudio[index]) {
        audioRef.current.pause();
        setIsPlayingAudio((prev) => ({ ...prev, [index]: false }));
      } else {
        // If a different audio is playing, stop it and play the new one
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.src = message.audio;
        audioRef.current.play().catch((err) => console.error('Audio playback error:', err));
        setIsPlayingAudio((prev) => ({ ...prev, [index]: true }));
      }
    } else {
      // Create a new audio element if it doesn't exist
      const audio = new Audio(message.audio);
      audioRef.current = audio;
      audio.play().catch((err) => console.error('Audio playback error:', err));
      setIsPlayingAudio((prev) => ({ ...prev, [index]: true }));
    }
  };

  const toggleVoiceMode = async () => {
    if (isVoiceMode) {
      exitVoiceMode();
    } else {
      // Set voice mode first
      await new Promise<void>((resolve) => {
        setIsVoiceMode(true);
        setInputValue('');
        resolve();
      });

      // Start listening after state is updated
      setIsRecording(true);
      voiceManager.current.startListening(
        async (text) => {
          setTranscription(text);
          // Force voice mode to be true for first message
          const forceVoiceMode = true;
          await handleSubmit(text, user, forceVoiceMode);
        },
        () => setIsRecording(false)
      );
    }
  };

  return (
    <>
      {/* Background wrapper */}
      <div className="relative w-full overflow-hidden">
        <StarCanvas />
        <div className="absolute inset-0 bg-transparent"></div>

        {/* Your existing content */}
        <div className="relative">
          {/* Hero Section */}
          <div className="relative w-full h-screen">
            <video
              autoPlay
              loop
              muted
              className="absolute inset-0 w-full h-full object-cover"
            >
              <source src="/Cyrene video hero for Topaz_apo8.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <div className="absolute inset-0 bg-gradient-to-b from-[#0B1220]/10 via-[#0A1A2F]/50 to-black" />
            <div className="absolute inset-0 bg-center" />

            {/* Hero Content */}
            <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-3xl md:text-4xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-cyan-300 mb-2"
              >
                Journey with
              </motion.h1>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="text-6xl md:text-11xl lg:text-[12rem] font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-blue-400 to-blue-200 pb-8"
              >
                Cyrene
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-lg md:text-xl text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-cyan-300 max-w-6xl mb-8"
              >
                Orchestrating <span className="font-bold text-2xl">multi-agent collaboration </span>with  <span className="font-bold text-2xl">self-replicating, decentralized AI agents
                </span>
                <br />Powered by a secured network layer by <span className="font-bold text-2xl">NetSepio</span>
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="flex flex-col items-center"
              >
                <motion.a
                  href="/launch-agent"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="px-8 py-4 text-lg font-medium text-white bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] transition-all duration-300"
                >
                  Launch Agent
                </motion.a>
              </motion.div>
            </div>
          </div>

          {/* Chat Section with New Layout */}
          <div className="bg-transparent my-32 py-5">
            <div className="max-w-7xl mx-auto h-[calc(100vh-200px)]">
              <div className="flex flex-col md:flex-row gap-8 items-start h-full">
                {/* Left Side - Cyrene Introduction */}
                <div className="w-full md:w-1/3 md:sticky md:top-10">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="bg-transparent backdrop-blur-xl rounded-3xl p-8 border border-white/10"
                  >
                    <div className="flex flex-col items-center md:items-start">
                      <div className="relative w-48 h-48 mb-6">
                        <div className={`absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 via-cyan-500 to-teal-600 blur-xl opacity-50`}></div>
                        <Image
                          src="/cyrene_profile.png"
                          alt="Cyrene"
                          width={192}
                          height={192}
                          className="relative rounded-full object-cover"
                          priority
                        />
                      </div>
                      <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-cyan-500 to-teal-600 bg-clip-text text-transparent"
                      >
                        Hi, I&apos;m Cyrene
                      </motion.h2>
                      <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="text-gray-300 text-center md:text-left"
                      >
                        Your guide to the realms of technology and consciousness.
                      </motion.p>
                    </div>
                  </motion.div>
                </div>

                {/* Right Side - Chat Section */}
                <div className="w-full md:w-2/3 h-full">
                  <div className="relative h-full flex flex-col">
                    {/* Chat Interface */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 1 }}
                      className="h-full flex flex-col"
                    >
                      <div className="relative flex-grow overflow-hidden">
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="backdrop-blur-xl bg-transparent border border-white/10 rounded-2xl p-6 shadow-[0_0_50px_rgba(124,58,237,0.1)] h-full flex flex-col"
                        >
                          {/* Messages Container with Scroll */}
                          <div
                            ref={messagesContainerRef}
                            className="flex-grow overflow-y-auto space-y-6 mb-6 scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-blue-100/10"
                          >
                            {/* Initial welcome message */}
                            <motion.div
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3 }}
                              className="flex justify-start"
                            >
                              <Image
                                src='/cyrene_chat.png'
                                alt='cyrene_chat'
                                className='w-14 h-14 rounded-lg object-cover mr-2'
                                width={75}
                                height={77}
                              />
                              <div className="max-w-[80%] rounded-2xl p-4 sm:p-5 backdrop-blur-sm bg-transparent border border-white/10 rounded-tl-sm">
                                <p className='text-white/90 text-sm sm:text-base'>
                                  Hello! I&apos;m Cyrene, your guide to elevating technology and consciousness. How can I assist you today?
                                </p>
                              </div>
                            </motion.div>

                            {messages.map((message, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, x: message.isUser ? 20 : -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3 }}
                                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                              >
                                {!message.isUser && (
                                  <Image
                                    src='/cyrene_chat.png'
                                    alt='cyrene_chat'
                                    className='w-14 h-14 rounded-lg object-cover mr-2'
                                    width={75}
                                    height={77}
                                  />
                                )}
                                <div
                                  className={`
                                    max-w-[80%] rounded-2xl p-4 sm:p-5 
                                    ${message.isUser
                                      ? 'bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-white/10 rounded-tr-sm'
                                      : 'backdrop-blur-sm bg-transparent border border-white/10 rounded-tl-sm'
                                    }`
                                  }
                                >
                                  <div className="flex items-start gap-3">
                                    {!message.isUser && message.audio && (
                                      <button
                                        onClick={() => toggleAudio(index)}
                                        className={`mt-1 transition-colors ${
                                          isPlayingAudio[index]
                                            ? 'text-blue-400'
                                            : 'text-white/60 hover:text-white/90'
                                        }`}
                                      >
                                        {isPlayingAudio[index] ? (
                                          <VolumeX className='w-5 h-5' />
                                        ) : (
                                          <Volume2 className='w-5 h-5' />
                                        )}
                                      </button>
                                    )}
                                    <p className='text-white/90 text-sm sm:text-base'>
                                      {message.text}
                                    </p>
                                  </div>
                                </div>
                                {message.isUser && <UserAvatar />}
                              </motion.div>
                            ))}
                            <div ref={messagesEndRef} />
                          </div>

                          {/* Voice Mode UI */}
                          {isVoiceMode ? (
                            <div className='w-full flex flex-col items-center gap-6 mb-6'>
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className='relative w-32 h-32 flex items-center justify-center'
                              >
                                <motion.div
                                  animate={{
                                    scale: isRecording ? [1, 1.2, 1] : 1,
                                    opacity: isRecording ? [0.2, 0.5, 0.2] : 0.2
                                  }}
                                  transition={{
                                    repeat: isRecording ? Infinity : 0,
                                    duration: 1.5
                                  }}
                                  className='absolute inset-0 bg-blue-500 rounded-full'
                                />
                                <motion.div
                                  animate={{
                                    scale: isRecording ? [1, 1.1, 1] : 1,
                                    opacity: isRecording ? [0.15, 0.3, 0.15] : 0.15
                                  }}
                                  transition={{
                                    repeat: isRecording ? Infinity : 0,
                                    duration: 1.5,
                                    delay: 0.2
                                  }}
                                  className='absolute inset-2 bg-blue-500 rounded-full'
                                />
                                <button
                                  onClick={handleVoiceInput}
                                  className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all ${isRecording
                                      ? 'bg-blue-500 text-white hover:bg-blue-600 scale-110'
                                      : 'bg-white/5 text-white/60 hover:text-blue-500 hover:bg-white/10'
                                    }`}
                                >
                                  {isRecording ? (
                                    <Mic className='w-8 h-8' />
                                  ) : (
                                    <MicOff className='w-8 h-8' />
                                  )}
                                </button>
                              </motion.div>
                              {transcription && (
                                <motion.p
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className='text-white/60 text-sm text-center max-w-md'
                                >
                                  {transcription}
                                </motion.p>
                              )}
                              <button
                                onClick={exitVoiceMode}
                                className='text-white/40 hover:text-white/60 transition-colors flex items-center gap-2'
                              >
                                <X className='w-4 h-4' />
                                <span>Exit Voice Mode</span>
                              </button>
                            </div>
                          ) : null}

                          {/* Input Form with Loading Indicator */}
                          <div className="w-full sticky bottom-0 to-transparent pt-4">
                            <div className="relative">
                              <form
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  handleSubmit(inputValue, user);
                                }}
                                className="relative w-full rounded-2xl"
                              >
                                <Textarea
                                  value={inputValue}
                                  onChange={(e) => {
                                    setInputValue(e.target.value);
                                    e.target.style.height = "24px";
                                    const newHeight = Math.min(e.target.scrollHeight, 150);
                                    e.target.style.height = `${newHeight}px`;
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                      e.preventDefault();
                                      if (inputValue.trim()) {
                                        handleSubmit(inputValue, user);
                                        setInputValue("");
                                        (e.target as HTMLTextAreaElement).style.height = "24px";
                                      }
                                    }
                                  }}
                                  placeholder={isVoiceMode ? "Listening..." : `Ask ${agent.name}...`}
                                  disabled={isLoading || isRecording}
                                  className="w-full bg-white/5 backdrop-blur-sm text-white placeholder-white/40 rounded-2xl px-6 py-4 sm:py-5 pr-32 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/40 resize-none min-h-[24px] max-h-[150px] overflow-y-auto scrollbar-none"
                                  rows={1}
                                />

                                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-3">
                                  <button
                                    type='button'
                                    onClick={toggleVoiceMode}
                                    className={`p-2 rounded-full transition-colors ${isVoiceMode
                                        ? "bg-blue-500/20 text-blue-500 hover:bg-blue-500/30"
                                        : "hover:bg-white/10 text-white/40 hover:text-blue-500"
                                      }`}
                                  >
                                    {isVoiceMode ? (
                                      <X className='w-5 h-5' />
                                    ) : (
                                      <Mic className='w-5 h-5' />
                                    )}
                                  </button>
                                  <button
                                    type='submit'
                                    disabled={isLoading || !inputValue.trim()}
                                    className='p-2 rounded-full hover:bg-white/10'
                                  >
                                    <ArrowUp
                                      className={`w-5 h-5 transition-colors ${inputValue && !isLoading ? "text-blue-500" : "text-white/40"
                                        }`}
                                    />
                                  </button>
                                </div>
                              </form>

                              {/* Loading Indicator */}
                              {isLoading && (
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  className='absolute -top-8 left-1/2 -translate-x-1/2 flex gap-2 justify-center'
                                >
                                  <div className="w-2 h-2 bg-blue-500/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                  <div className="w-2 h-2 bg-blue-500/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                  <div className="w-2 h-2 bg-blue-500/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                </motion.div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Animated Feature Sections */}
          <div className="bg-transparent pt-56 lg:pt-0 md:pt-0 py-5">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: feature.fromLeft ? -100 : 100 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="min-h-[60vh] flex items-center justify-center px-4 mb-5"
              >
                <div className="max-w-7xl mx-auto w-full">
                  <div className={`relative flex flex-col md:flex-row ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                    {/* Image with gradient border */}
                    <div className="md:w-1/2 z-10">
                      <div className="max-w-[200px] md:max-w-[400px] mx-auto w-full">
                        <motion.div
                          className={`aspect-square rounded-3xl bg-gradient-to-br ${feature.gradient} p-1`}
                          animate={{
                            scale: [1, 1.02, 1],
                            rotate: [0, 1, 0],
                            y: [0, -5, 0]
                          }}
                          transition={{
                            duration: 5,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        >
                          <div className="w-full h-full bg-transparent rounded-3xl overflow-hidden">
                            <motion.div
                              animate={{
                                scale: [1, 1.1, 1],
                              }}
                              transition={{
                                duration: 10,
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                              className="w-full h-full"
                            >
                              <Image
                                src={feature.image}
                                alt={feature.title}
                                width={400}
                                height={400}
                                className="object-cover w-full h-full"
                                priority
                              />
                            </motion.div>
                          </div>
                        </motion.div>
                      </div>
                    </div>

                    {/* Content Box */}
                    <motion.div
                      className="md:w-1/2 md:absolute md:-translate-y-1/2 md:left-[45%] bg-transparent backdrop-blur-xl rounded-3xl p-8 border border-white/10"
                      style={{ left: index % 2 === 0 ? '45%' : 'auto', right: index % 2 === 0 ? 'auto' : '45%' }}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                    >
                      <div className={`w-full max-w-[500px] ${index % 2 === 0 ? 'md:ml-auto' : ''} text-center md:text-left`}>
                        <motion.h2
                          className={`text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent`}
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.3 }}
                        >
                          {feature.title}
                        </motion.h2>
                        <motion.p
                          className="text-lg md:text-xl text-gray-300 leading-relaxed"
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.4 }}
                        >
                          {feature.description}
                        </motion.p>
                        <motion.div
                          className={`mt-6 h-1 w-20 rounded-full bg-gradient-to-r ${feature.gradient}`}
                          initial={{ width: 0 }}
                          whileInView={{ width: 80 }}
                          transition={{ duration: 0.8, delay: 0.5 }}
                        />
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Features Section */}
          <div className="relative py-20 bg-transparent">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(56,189,248,0.1),transparent_50%)]"
            />

            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-16"
              >
                <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 mb-4">
                  Towards Digital, Agentic Future
                </h2>
                <p className="text-gray-400 max-w-2xl mx-auto">
                  AI agent launchpad managing a multi-agent platform and AI coordination layer on NetSepio&lsquo;s secure and decentralized network.
                </p>

                {/* Stats Section */}
                <div className="relative py-20 bg-transparent">
                  <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                      {[
                        { number: "3,500+", label: "VPN connections" },
                        { number: "2,000+", label: "Secured wallets" },
                        { number: "20+", label: "Partners" },
                        { number: "100%", label: "Decentralized" }
                      ].map((stat, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="text-center p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl"
                        >
                          <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 mb-2">
                            {stat.number}
                          </div>
                          <div className="text-gray-400">{stat.label}</div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}