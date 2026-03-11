"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
    MessageSquare, X, Send, Mic, MicOff, Sparkles,
    Bot, User, Loader2, Volume2, StopCircle
} from "lucide-react";

interface ChatMessage {
    role: "user" | "assistant";
    content: string;
}

export function AIChatBubble() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [streamingText, setStreamingText] = useState("");

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const recognitionRef = useRef<any>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, streamingText]);

    // Focus input when opened
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    // Initialize speech recognition
    const startListening = useCallback(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Speech recognition is not supported in your browser. Use Chrome or Edge.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
            let transcript = "";
            for (let i = 0; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
            }
            setInput(transcript);
        };

        recognition.onerror = (event: any) => {
            console.error("Speech error:", event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
        setIsListening(true);
    }, []);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    }, []);

    // Send message
    const handleSend = async () => {
        const text = input.trim();
        if (!text || isLoading) return;

        // Stop listening if active
        if (isListening) stopListening();

        const userMessage: ChatMessage = { role: "user", content: text };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput("");
        setIsLoading(true);
        setStreamingText("");

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: newMessages }),
            });

            if (!res.ok) {
                throw new Error("Failed to get response");
            }

            // Check if it's a non-streaming JSON response (e.g., API key missing)
            const contentType = res.headers.get("content-type");
            if (contentType?.includes("application/json")) {
                const data = await res.json();
                setMessages([...newMessages, { role: "assistant", content: data.reply || data.error || "Something went wrong." }]);
                setIsLoading(false);
                return;
            }

            // Handle SSE stream
            const reader = res.body?.getReader();
            const decoder = new TextDecoder();
            let fullText = "";

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    const lines = chunk.split("\n");

                    for (const line of lines) {
                        if (line.startsWith("data: ")) {
                            const data = line.slice(6);
                            if (data === "[DONE]") break;
                            try {
                                const parsed = JSON.parse(data);
                                if (parsed.text) {
                                    fullText += parsed.text;
                                    setStreamingText(fullText);
                                }
                            } catch { }
                        }
                    }
                }
            }

            setMessages([...newMessages, { role: "assistant", content: fullText || "No response." }]);
            setStreamingText("");
        } catch (error) {
            setMessages([...newMessages, { role: "assistant", content: "Sorry, something went wrong. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle key press
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Simple markdown rendering
    const renderContent = (text: string) => {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code class="bg-white/10 px-1 py-0.5 rounded text-xs">$1</code>')
            .replace(/^• /gm, '→ ')
            .replace(/^- /gm, '→ ');
    };

    return (
        <>
            {/* Floating Bubble */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-zinc-500 to-zinc-600 text-white shadow-[0_0_30px_-5px_rgba(16,185,129,0.5)] hover:shadow-[0_0_40px_-5px_rgba(16,185,129,0.7)] hover:scale-110 transition-all flex items-center justify-center group"
                >
                    <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                    {/* Ping animation */}
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full animate-ping opacity-75" />
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full" />
                </button>
            )}

            {/* Chat Panel */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 z-50 w-[420px] h-[600px] flex flex-col rounded-2xl border border-white/10 bg-[#0a0a0f]/95 backdrop-blur-xl shadow-[0_0_60px_-10px_rgba(0,0,0,0.8)] animate-in slide-in-from-bottom-6 fade-in duration-300 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-gradient-to-r from-primary/10 to-transparent">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-zinc-500 to-zinc-600 flex items-center justify-center">
                                <Bot className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-white">Marketing Co-Pilot</h3>
                                <p className="text-[10px] text-primary">Knows your product, audience & data</p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="p-2 rounded-lg text-muted-foreground hover:text-white hover:bg-white/10 transition-all">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
                        {messages.length === 0 && !streamingText && (
                            <div className="flex flex-col items-center justify-center h-full text-center px-4">
                                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                                    <Sparkles className="w-8 h-8 text-primary" />
                                </div>
                                <h4 className="text-white font-bold mb-1.5">Hey, Founder! 👋</h4>
                                <p className="text-muted-foreground text-xs mb-6 max-w-[280px]">
                                    I know your product, your audience, and your data. Ask me anything about marketing.
                                </p>
                                <div className="grid grid-cols-1 gap-2 w-full max-w-[300px]">
                                    {[
                                        "Write a viral tweet about my product",
                                        "What subreddits am I missing?",
                                        "Draft a cold DM for a creator",
                                    ].map((suggestion) => (
                                        <button
                                            key={suggestion}
                                            onClick={() => { setInput(suggestion); }}
                                            className="text-left px-3 py-2 text-xs bg-white/[0.03] border border-white/10 rounded-xl text-muted-foreground hover:text-white hover:border-primary/30 hover:bg-primary/5 transition-all"
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {messages.map((msg, i) => (
                            <div key={i} className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                {msg.role === "assistant" && (
                                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <Bot className="w-4 h-4 text-primary" />
                                    </div>
                                )}
                                <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed ${msg.role === "user"
                                    ? "bg-primary text-white rounded-br-md"
                                    : "bg-white/[0.06] text-gray-200 border border-white/5 rounded-bl-md"
                                    }`}
                                >
                                    {msg.role === "assistant" ? (
                                        <div
                                            className="prose-sm [&_strong]:text-white [&_em]:text-zinc-300 [&_code]:text-zinc-300 whitespace-pre-wrap"
                                            dangerouslySetInnerHTML={{ __html: renderContent(msg.content) }}
                                        />
                                    ) : (
                                        <span>{msg.content}</span>
                                    )}
                                </div>
                                {msg.role === "user" && (
                                    <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <User className="w-4 h-4 text-white" />
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Streaming response */}
                        {streamingText && (
                            <div className="flex gap-2.5 justify-start">
                                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Bot className="w-4 h-4 text-primary" />
                                </div>
                                <div className="max-w-[85%] px-3.5 py-2.5 rounded-2xl rounded-bl-md bg-white/[0.06] border border-white/5 text-[13px] leading-relaxed text-gray-200">
                                    <div
                                        className="prose-sm [&_strong]:text-white [&_em]:text-zinc-300 [&_code]:text-zinc-300 whitespace-pre-wrap"
                                        dangerouslySetInnerHTML={{ __html: renderContent(streamingText) }}
                                    />
                                    <span className="inline-block w-1.5 h-4 bg-zinc-400 animate-pulse ml-0.5 rounded-full" />
                                </div>
                            </div>
                        )}

                        {/* Loading indicator */}
                        {isLoading && !streamingText && (
                            <div className="flex gap-2.5 justify-start">
                                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <Bot className="w-4 h-4 text-primary" />
                                </div>
                                <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-white/[0.06] border border-white/5">
                                    <div className="flex gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-zinc-400/60 animate-bounce [animation-delay:0ms]" />
                                        <span className="w-2 h-2 rounded-full bg-zinc-400/60 animate-bounce [animation-delay:150ms]" />
                                        <span className="w-2 h-2 rounded-full bg-zinc-400/60 animate-bounce [animation-delay:300ms]" />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Voice status bar */}
                    {isListening && (
                        <div className="px-4 py-2 bg-red-500/10 border-t border-red-500/20 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                <span className="text-xs text-red-400 font-medium">Listening... speak now</span>
                            </div>
                            <button onClick={stopListening} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
                                <StopCircle className="w-3 h-3" /> Stop
                            </button>
                        </div>
                    )}

                    {/* Input */}
                    <div className="p-3 border-t border-white/10 bg-black/40">
                        <div className="flex items-end gap-2">
                            {/* Voice button */}
                            <button
                                onClick={isListening ? stopListening : startListening}
                                className={`p-2.5 rounded-xl transition-all flex-shrink-0 ${isListening
                                    ? "bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse"
                                    : "bg-white/5 text-muted-foreground hover:text-white hover:bg-white/10 border border-white/10"
                                    }`}
                                title={isListening ? "Stop listening" : "Voice input"}
                            >
                                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                            </button>

                            {/* Text input */}
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask about marketing, content, outreach..."
                                rows={1}
                                className="flex-1 bg-white/[0.05] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-muted-foreground/50 outline-none focus:border-primary/50 resize-none max-h-24 scrollbar-thin"
                                style={{ minHeight: "40px" }}
                                onInput={(e) => {
                                    const target = e.target as HTMLTextAreaElement;
                                    target.style.height = "40px";
                                    target.style.height = Math.min(target.scrollHeight, 96) + "px";
                                }}
                            />

                            {/* Send button */}
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || isLoading}
                                className="p-2.5 rounded-xl bg-primary hover:bg-zinc-200 text-white transition-all disabled:opacity-30 disabled:hover:bg-primary flex-shrink-0"
                            >
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
