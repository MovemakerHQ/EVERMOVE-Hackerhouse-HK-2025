"use client"

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Image as LucidImage, Upload, FileUp, Sparkles } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import axios from 'axios';
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { GlowButton } from "@/components/ui/glow-button";
import StarCanvas from "@/components/StarCanvas";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect } from "react";
import VoiceManager, { Voice } from "@/utils/voiceUtils";
import { generateCharacterInfo } from "@/app/utils/openaiUtils";
import { useAppKitAccount } from '@reown/appkit/react'; // For Ethereum wallet
import { useWallet } from '@solana/wallet-adapter-react'; // For Solana wallet

interface AgentData {
  name: string;
  clients: string[];
  oneLiner: string;
  description: string;
  bio: string[];
  lore: string[];
  knowledge: string[];
  messageExamples: { user: string; content: { text: string } }[][];
  postExamples: string[];
  topics: string[];
  adjectives: string[];
  plugins: string[];
  style: {
    all: string[];
    chat: string[];
    post: string[];
  };
  wallet_address: string;
}

interface AgentConfig {
  bio: string[];
  lore: string[];
  knowledge: string[];
}

const agentApi = {
  async createAgent(agentData: AgentData) {
    try {
      const response = await axios.post('/api/createAgent', agentData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },
};

export default function LaunchAgentPage() {
  const [previewAudio, setPreviewAudio] = useState<string | null>(null);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('af_bella');
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const voiceManager = useRef(new VoiceManager());

  const [preview, setPreview] = useState<string | null>(null);
  const [domain, setDomain] = useState('');
  const [name, setName] = useState('');
  const [oneLiner, setOneLiner] = useState('');
  const [description, setDescription] = useState('');
  const [characterInfo, setCharacterInfo] = useState({
    bio: '',
    lore: '',
    knowledge: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const [openAiKey, setOpenAiKey] = useState<string>("");
  const knowledgeInputRef = useRef<HTMLInputElement>(null);
  const loreInputRef = useRef<HTMLInputElement>(null);
  const bioInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [avatarHash, setAvatarHash] = useState<string>('');
  const [coverHash, setCoverHash] = useState<string>('');

  // Wallet connection
  const { address: ethAddress, isConnected: isEthConnected } = useAppKitAccount(); // Ethereum wallet
  const { publicKey: solAddress, connected: isSolConnected } = useWallet(); // Solana wallet
  const [wallet_address, setWalletAddress] = useState<string | null>(null);

  // Handle wallet address changes
  useEffect(() => {
    if (isEthConnected && ethAddress) {
      setWalletAddress(ethAddress);
    } else if (isSolConnected && solAddress) {
      setWalletAddress(solAddress.toBase58());
    } else {
      setWalletAddress(null);
    }
  }, [isEthConnected, isSolConnected, ethAddress, solAddress]);

  // Handle AI generation
  const handleGenerateWithAI = async () => {
    if (!oneLiner || !description) {
      toast.error("Please provide a one-liner and description before generating with AI.");
      return;
    }

    setIsGenerating(true);
    try {
      const generatedInfo = await generateCharacterInfo(oneLiner, description);
      setCharacterInfo({
        bio: generatedInfo.bio,
        lore: generatedInfo.lore,
        knowledge: generatedInfo.knowledge,
      });
      toast.success("Character information generated successfully!");
    } catch (error) {
      console.error('Error generating character info:', error);
      toast.error("Failed to generate character information with AI.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle voice preview
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePreviewVoice = async (voiceId: string) => {
    console.log("Preview button clicked. Voice ID:", voiceId);
    setIsLoadingPreview(true);

    try {
      const response = await axios.post('/api/tts', {
        text: "Hello, I'm your AI assistant",
        voice: voiceId,
      }, { responseType: 'blob' });

      // Stop and clean up previous audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        URL.revokeObjectURL(audioRef.current.src);
      }

      const audioUrl = URL.createObjectURL(new Blob([response.data], { type: 'audio/mpeg' }));
      setPreviewAudio(audioUrl);

      // Create a new Audio object
      const newAudio = new Audio(audioUrl);
      audioRef.current = newAudio;

      newAudio.play()
        .then(() => {
          console.log("Audio playing successfully");
        })
        .catch((error) => {
          if (error.name === "AbortError") {
            console.warn("Audio play request was aborted");
          } else {
            console.error("Audio play error:", error);
            toast.error("Playback failed");
          }
        });

      newAudio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        setPreviewAudio(null);
      };

    } catch (error) {
      console.error('Error previewing voice:', error);
      toast.error('Failed to preview voice');
    } finally {
      setIsLoadingPreview(false);
    }
  };

  // Load available voices
  useEffect(() => {
    const loadVoices = async () => {
      const availableVoices = await voiceManager.current.fetchVoices();
      setVoices(availableVoices);
    };

    loadVoices();
  }, []);

  // Handle file upload to IPFS
  const uploadToIPFS = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/api/ipfs', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.Hash;
    } catch (error) {
      console.error('IPFS upload error:', error);
      toast.error('Failed to upload image to IPFS');
      throw error;
    }
  };

  // Handle file change for avatar and cover images
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (type === 'avatar') {
          setAvatarPreview(e.target?.result as string);
        } else {
          setCoverPreview(e.target?.result as string);
        }
      };
      reader.readAsDataURL(file);

      try {
        const hash = await uploadToIPFS(file);
        if (type === 'avatar') {
          setAvatarHash(hash);
          toast.success('Avatar image uploaded successfully');
        } else {
          setCoverHash(hash);
          toast.success('Cover image uploaded successfully');
        }
      } catch (error) {
        toast.error(`Failed to upload ${type} image`);
      }
    }
  };

  // Handle JSON file upload for character info
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json: AgentConfig = JSON.parse(e.target?.result as string);
          setCharacterInfo({
            bio: json.bio.join('\n'),
            lore: json.lore.join('\n'),
            knowledge: json.knowledge.join('\n')
          });
          toast.success("Character information loaded successfully!");
        } catch (error) {
          toast.error("Invalid JSON file format");
        }
      };
      reader.readAsText(file);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name) {
      toast.error("Agent Name is required");
      return;
    }

    if (!isValidName(name)) {
      toast.error("Invalid agent name format");
      return;
    }

    if (!wallet_address) {
      toast.error("Wallet address is required. Please connect your wallet.");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();

      

      formData.append('wallet_address', wallet_address); 
      formData.append('character_file', JSON.stringify({
        name,
        clients: [],
        oneLiner,
        description,
        bio: characterInfo.bio.split("\n"),
        lore: characterInfo.lore.split("\n"),
        knowledge: characterInfo.knowledge.split("\n"),
        messageExamples: [
          [
            {
              user: "{{user1}}",
              content: { text: "What is your role?" },
            },
            {
              user: name,
              content: { text: "I am here to help you" },
            },
          ],
        ],
        postExamples: [],
        topics: [],
        adjectives: [""],
        plugins: [],
        style: {
          all: [""],
          chat: [""],
          post: [""],
        },
        organization: "cyrene", 
      }));

      formData.append('avatar_img', avatarHash);
      formData.append('cover_img', coverHash);
      formData.append('voice_model', selectedVoice);
      formData.append('domain', domain);

      const response = await axios.post('/api/createAgent', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success("Agent Created Successfully!", {
        duration: 4000,
        action: {
          label: "Chat Now",
          onClick: () => router.push(`/explore-agents/chat/${response.data.agent.id}`),
        },
      });

      setTimeout(() => {
        router.push(`/explore-agents/chat/${response.data.agent.id}`);
      }, 2000);

    } catch (error) {
      console.error("API Error:", error);
      toast.error("Failed to create agent");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Validate agent name
  const isValidName = (name: string): boolean => {
    const nameRegex = /^[a-z0-9][a-z0-9.-]*$/;
    return nameRegex.test(name);
  };

  return (
    <div className="min-h-screen pt-32 text-white py-20">
      <StarCanvas />
      <div className="max-w-6xl mx-auto px-4">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-bold text-center bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-16"
        >
          Launch Your Agent
        </motion.h1>

        <form onSubmit={handleSubmit} className="space-y-24">
          {/* Basic Information Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-[rgba(33,37,52,0.5)] backdrop-blur-xl rounded-2xl p-10 border border-blue-500/20"
          >
            <h2 className="text-3xl font-semibold mb-10 relative">
              Basic Information
              <span className="absolute bottom-0 left-0 w-64 h-1 bg-gradient-to-r from-blue-500 to-purple-500"></span>
            </h2>

            <div className="space-y-8">
              <div>
                <Label className="text-lg mb-2 text-blue-300">Name</Label>
                <Input
                  placeholder="Agent Name"
                  className="bg-[rgba(33,37,52,0.7)] border-none ring-1 ring-blue-500/30 focus-visible:ring-2 focus-visible:ring-blue-500 transition-all"
                  value={name}
                  onChange={(e) => {
                    const newValue = e.target.value.toLowerCase();
                    if (newValue === '' || isValidName(newValue)) {
                      setName(newValue);
                    }
                  }}
                  onBlur={() => {
                    if (name && !isValidName(name)) {
                      toast.error("Name must start with a lowercase letter or number and can only contain lowercase letters, numbers, dots, and hyphens");
                    }
                  }}
                />
                <p className="text-sm text-blue-300/70 mt-2">
                  Must start with a lowercase letter or number. Can contain lowercase letters, numbers, dots, and hyphens.
                </p>
              </div>

              <div>
                <Label className="text-lg mb-2 text-blue-300">Wallet Address</Label>
                <Input
                  value={wallet_address || "Not connected"}
                  disabled
                  className="bg-[rgba(33,37,52,0.7)] border-none ring-1 ring-blue-500/30 focus-visible:ring-2 focus-visible:ring-blue-500 transition-all"
                />
                {!wallet_address && (
                  <p className="text-sm text-red-500 mt-2">
                    Please connect your wallet to proceed.
                  </p>
                )}
              </div>

              <div>
                <Label className="text-lg mb-2 text-blue-300">Upload Images</Label>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-blue-300 mb-2">Avatar Image</p>
                    <div className="grid grid-cols-2 gap-4">
                      <label className="col-span-1 border-2 border-dashed p-4 flex flex-col items-center justify-center cursor-pointer bg-[rgba(33,37,52,0.7)] border-blue-500/30 rounded-xl hover:border-blue-500 transition-all group">
                        <Upload size={24} className="text-blue-400 group-hover:scale-110 transition-transform" />
                        <p className="mt-2 text-center text-sm">Upload Avatar</p>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileChange(e, 'avatar')}
                        />
                      </label>
                      <div className="border p-4 flex flex-col items-center justify-center bg-[rgba(33,37,52,0.7)] border-blue-500/30 rounded-xl">
                        {avatarPreview ? (
                          <Image src={avatarPreview} alt="Avatar Preview" width={64} height={64} className="rounded-lg shadow-lg" />
                        ) : (
                          <>
                            <LucidImage size={24} className="text-blue-400" />
                            <p className="mt-2 text-center text-sm text-blue-300/70">Preview</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-blue-300 mb-2">Cover Image</p>
                    <div className="grid grid-cols-2 gap-4">
                      <label className="col-span-1 border-2 border-dashed p-4 flex flex-col items-center justify-center cursor-pointer bg-[rgba(33,37,52,0.7)] border-blue-500/30 rounded-xl hover:border-blue-500 transition-all group">
                        <Upload size={24} className="text-blue-400 group-hover:scale-110 transition-transform" />
                        <p className="mt-2 text-center text-sm">Upload Cover</p>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileChange(e, 'cover')}
                        />
                      </label>
                      <div className="border p-4 flex flex-col items-center justify-center bg-[rgba(33,37,52,0.7)] border-blue-500/30 rounded-xl">
                        {coverPreview ? (
                          <Image src={coverPreview} alt="Cover Preview" width={64} height={64} className="rounded-lg shadow-lg" />
                        ) : (
                          <>
                            <LucidImage size={24} className="text-blue-400" />
                            <p className="mt-2 text-center text-sm text-blue-300/70">Preview</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-lg mb-2 text-blue-300">One Liner</Label>
                <Input
                  placeholder="Write agent one liner"
                  className="bg-[rgba(33,37,52,0.7)] border-none ring-1 ring-blue-500/30 focus-visible:ring-2 focus-visible:ring-blue-500 transition-all"
                  value={oneLiner}
                  onChange={(e) => setOneLiner(e.target.value)}
                />
                <p className="text-sm text-blue-300/70 mt-2">Max 90 characters with spaces</p>
              </div>

              <div>
                <Label className="text-lg mb-2 text-blue-300">Description</Label>
                <Textarea
                  placeholder="Write agent description"
                  className="bg-[rgba(33,37,52,0.7)] border-none ring-1 ring-blue-500/30 focus-visible:ring-2 focus-visible:ring-blue-500 transition-all min-h-32"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <p className="text-sm text-blue-300/70 mt-2">Max 300 characters with spaces</p>
              </div>

              <div>
                <Label className="text-lg mb-2 text-blue-300">Voice</Label>
                <div>
                  <div className="space-y-2">
                    {/* Voice Selection Dropdown */}
                    <Select
                      value={selectedVoice}
                      onValueChange={(value) => setSelectedVoice(value)}
                    >
                      <SelectTrigger className="bg-[rgba(33,37,52,0.7)] border-none ring-1 ring-blue-500/30 focus-visible:ring-2 focus-visible:ring-blue-500 transition-all">
                        <SelectValue placeholder="Select a voice" />
                      </SelectTrigger>
                      <SelectContent className="bg-[rgba(33,37,52,0.9)] border border-blue-500/30 backdrop-blur-xl text-white">
                        {voices.map((voice) => (
                          <SelectItem
                            key={voice.id}
                            value={voice.id}
                            className="hover:bg-blue-500/10 focus:bg-blue-500/10"
                          >
                            {voice.name} ({voice.gender})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Preview Button with Loader */}
                    <div className="flex justify-end mt-4">
                      <button
                        type="button"
                        onClick={() => handlePreviewVoice(selectedVoice)}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-all flex items-center gap-2"
                        disabled={isLoadingPreview}
                      >
                        {isLoadingPreview ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        ) : (
                          "Preview Voice"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Character Information Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-[rgba(33,37,52,0.5)] backdrop-blur-xl rounded-2xl p-10 border border-purple-500/20"
          >
            <h2 className="text-3xl font-semibold mb-10 relative">
              Character Information
              <span className="absolute bottom-0 left-0 w-80 h-1 bg-gradient-to-r from-blue-500 to-purple-500"></span>
            </h2>

            <div className="flex gap-4 mb-8">
              <div className="relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="character-file"
                />
                <GlowButton
                  type="button"
                  onClick={() => document.getElementById('character-file')?.click()}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2 whitespace-nowrap"
                >
                  Upload Character File
                </GlowButton>
              </div>
              <GlowButton
                type="button"
                className="inline-flex items-center justify-center gap-2 px-6 py-2 whitespace-nowrap"
                onClick={handleGenerateWithAI}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Generating...</span>
                  </div>
                ) : (
                  <span>Generate with AI</span>
                )}
              </GlowButton>
            </div>

            {['bio', 'lore', 'knowledge'].map((field) => (
              <div key={field} className="mb-10">
                <Label className="text-lg mb-2 text-purple-300 capitalize">{field}</Label>
                <Textarea
                  placeholder={`Add agent ${field}`}
                  value={characterInfo[field as keyof typeof characterInfo]}
                  onChange={(e) => setCharacterInfo(prev => ({
                    ...prev,
                    [field]: e.target.value
                  }))}
                  className="bg-[rgba(33,37,52,0.7)] border-none ring-1 ring-purple-500/30 focus-visible:ring-2 focus-visible:ring-purple-500 transition-all min-h-32"
                />
              </div>
            ))}
          </motion.div>

          <div className="flex justify-center">
            <GlowButton
              type="submit"
              disabled={isSubmitting}
              className="px-12 py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Creating Agent...</span>
                </div>
              ) : 'Launch Agent'}
            </GlowButton>
          </div>
        </form>
      </div>
    </div>
  );
}