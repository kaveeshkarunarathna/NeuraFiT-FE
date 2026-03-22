"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { aiApi, ChatMessage } from "../lib/api";
import { 
  Bot, 
  Send, 
  ArrowLeft, 
  Loader2, 
  Dumbbell, 
  Utensils,
  Moon
} from "lucide-react";

export default function CoachPage() {
  const { user, isAuthenticated, isLoading: authLoading, accessToken: token } = useAuth();
  const router = useRouter();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push("/signin");
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (token && isAuthenticated) {
      fetchChatHistory();
    }
  }, [token, isAuthenticated]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const fetchChatHistory = async () => {
    if (!token) return;
    try {
      const response = await aiApi.getChatHistory(token);
      if (response && response.data) {
        setMessages(response.data);
      }
    } catch (error) {
      console.error("Failed to load chat history", error);
    }
  };

  const sendMessage = async (e?: React.FormEvent, overrideText?: string) => {
    if (e) e.preventDefault();
    const userText = overrideText || input.trim();
    if (!userText || isLoading || !token) return;

    if (!overrideText) setInput("");

    // Optimistically update UI
    const tempId = `temp-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      {
        id: tempId,
        userId: "local",
        role: "user",
        content: userText,
        createdAt: new Date().toISOString(),
      },
    ]);
    setIsLoading(true);

    try {
      const response = await aiApi.chat(token, userText);
      if (response && response.userMessage && response.aiMessage) {
        setMessages((prev) => [
          ...prev.filter((m) => m.id !== tempId),
          response.userMessage,
          response.aiMessage,
        ]);
      }
    } catch (error) {
      console.error("Failed to send message", error);
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    } finally {
      setIsLoading(false);
    }
  };

  const SUGGESTIONS = [
    { label: "Suggest a workout for today", icon: <Dumbbell className="w-5 h-5 text-primary-400" /> },
    { label: "Give me a high-protein breakfast idea", icon: <Utensils className="w-5 h-5 text-primary-400" /> },
    { label: "How can I improve my sleep quality?", icon: <Moon className="w-5 h-5 text-primary-400" /> },
  ];

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#000000]">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#000000] overflow-hidden">
      {/* Header */}
      <header className="border-b border-stone-800 bg-[#000000] z-10 shrink-0">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-stone-500 hover:text-stone-300 transition-colors p-2 -ml-2 rounded-lg hover:bg-stone-900">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                <Bot className="w-5 h-5 text-black" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-stone-100 flex items-center gap-2 tracking-tight">
                  AI Coach
                </h1>
                <p className="text-xs text-primary-400 font-medium">Personalized AI Assistant</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <main ref={scrollContainerRef} className="flex-1 w-full max-w-4xl mx-auto overflow-y-auto pt-6 pb-36 px-4 sm:px-6 relative scrollbar-thin scrollbar-thumb-stone-800 scrollbar-track-transparent">
        
        {messages.length === 0 && !isLoading ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="m-auto flex flex-col items-center justify-center text-center max-w-md py-12 h-full my-auto"
          >
            <div className="w-24 h-24 bg-stone-900 border border-stone-800 rounded-full flex items-center justify-center mb-6 shadow-2xl relative">
              <div className="absolute inset-0 rounded-full border border-primary-500/20 animate-ping opacity-20" style={{ animationDuration: '3s' }} />
              <Bot className="w-10 h-10 text-primary-500" />
            </div>
            <h2 className="text-2xl font-bold text-stone-100 mb-2">
              Good to see you{user?.name ? `, ${user.name}` : ''}!
            </h2>
            <p className="text-stone-400 mb-10 leading-relaxed max-w-sm">
              I am your personalized NeuraFiT AI coach. I can help you design workouts, plan meals, or analyze your progress. How can we crush your goals today?
            </p>
            
            {/* Suggestion Chips */}
            <div className="flex flex-col gap-3 w-full animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150 fill-mode-both">
              {SUGGESTIONS.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => sendMessage(undefined, s.label)}
                  className="flex items-center gap-4 bg-stone-900 border border-stone-800 hover:border-primary-500/50 hover:bg-stone-800/80 text-stone-300 p-4 rounded-xl text-sm font-medium transition-all text-left shadow-lg cursor-pointer group"
                >
                  <div className="bg-stone-800 p-2.5 rounded-lg group-hover:scale-110 transition-transform">
                    {s.icon}
                  </div>
                  <span className="group-hover:text-stone-100 transition-colors">{s.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-6">
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  key={msg.id || i}
                  layout
                  className={`flex ${msg.role === "user" ? "justify-end pl-12" : "justify-start pr-12"}`}
                >
                  <div className={`flex gap-3 max-w-full ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    {msg.role !== "user" && (
                      <div className="w-8 h-8 rounded-lg bg-stone-900 border border-stone-800 flex items-center justify-center shrink-0 mt-1 shadow-sm">
                        <Bot className="w-4 h-4 text-primary-400" />
                      </div>
                    )}
                    
                    <div
                      className={`px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed relative ${
                        msg.role === "user"
                          ? "bg-primary-500 text-black rounded-tr-sm shadow-lg shadow-primary-500/10 font-medium"
                          : "bg-stone-900 border border-stone-800 text-stone-200 rounded-tl-sm shadow-lg shadow-black/20"
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isLoading && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="flex justify-start pr-12"
              >
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-stone-900 border border-stone-800 flex items-center justify-center shrink-0 shadow-sm mt-1">
                    <Bot className="w-4 h-4 text-primary-400" />
                  </div>
                  <div className="px-5 py-3.5 bg-stone-900 border border-stone-800 rounded-2xl rounded-tl-sm shadow-lg shadow-black/20 flex items-center">
                    <div className="flex gap-1.5 py-1">
                      <div className="w-2 h-2 bg-stone-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-2 h-2 bg-stone-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-2 h-2 bg-stone-600 rounded-full animate-bounce"></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} className="h-4" />
          </div>
        )}
      </main>

      {/* Input Form Fixed at Bottom */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#000000] via-[#000000] to-transparent pt-12 pb-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <form 
            onSubmit={sendMessage} 
            className="flex items-end gap-2 bg-stone-900 shadow-[0_8px_30px_rgb(0,0,0,0.8)] border border-stone-700/50 rounded-2xl p-2 relative transition-all focus-within:border-primary-500/30"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Message your AI Coach..."
              className="flex-1 bg-transparent py-3 px-4 outline-none text-stone-100 placeholder:text-stone-500 text-[15px] resize-none max-h-32 min-h-[48px] scrollbar-thin"
              rows={1}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="mb-1 mr-1 p-3 bg-primary-500 text-black rounded-xl hover:bg-primary-600 transition-all disabled:opacity-50 disabled:hover:bg-primary-500 flex shrink-0 cursor-pointer shadow-lg shadow-primary-500/10 active:scale-95"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
          <div className="text-center mt-3 text-[11px] text-stone-500 font-medium tracking-wide opacity-80">
            NeuraFiT AI Coach can make mistakes. Consider verifying critical health information.
          </div>
        </div>
      </div>
    </div>
  );
}
