'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageSquare,
    X,
    Send,
    Bot,
    User,
    Loader2,
    Sparkles,
    Minimize2,
    Maximize2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { askTaxAssistant } from '@/lib/actions/chat-actions';
import { cn } from '@/lib/utils';

interface Message {
    role: 'user' | 'model';
    content: string;
}

export function TaxAssistantChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        { role: 'model', content: '안녕하세요! 사장님의 스마트 세무 비서 **TaxAI**입니다. 무엇을 도와드릴까요?' }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            // 히스토리 준비 (최근 10개만 전달하여 토큰 절약)
            const history = messages.slice(-10);
            const response = await askTaxAssistant(userMessage, history);

            setMessages(prev => [...prev, { role: 'model', content: response }]);
        } catch (error: any) {
            setMessages(prev => [...prev, {
                role: 'model',
                content: '죄송합니다. 오류가 발생했습니다: ' + error.message
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            y: 0,
                            height: isMinimized ? '64px' : '600px',
                            width: '400px'
                        }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        className="mb-4 shadow-2xl rounded-3xl overflow-hidden border border-indigo-100 bg-white flex flex-col"
                    >
                        {/* Header */}
                        <div className="bg-indigo-600 p-4 flex items-center justify-between text-white shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                                    <Bot size={18} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm">TaxAI 비서</h3>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                                        <span className="text-[10px] text-indigo-100">실시간 상담 가능</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setIsMinimized(!isMinimized)}
                                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>

                        {!isMinimized && (
                            <>
                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                                    {messages.map((msg, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: msg.role === 'user' ? 10 : -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className={cn(
                                                "flex gap-3 max-w-[85%]",
                                                msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-8 h-8 rounded-xl flex items-center justify-center shrink-0",
                                                msg.role === 'user' ? "bg-slate-200 text-slate-600" : "bg-indigo-100 text-indigo-600"
                                            )}>
                                                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                                            </div>
                                            <div className={cn(
                                                "p-3 rounded-2xl text-sm leading-relaxed",
                                                msg.role === 'user'
                                                    ? "bg-indigo-600 text-white rounded-tr-none"
                                                    : "bg-white text-slate-700 shadow-sm border border-slate-100 rounded-tl-none"
                                            )}>
                                                {msg.content.split('\n').map((line, idx) => {
                                                    // Basic bold text rendering (**text**)
                                                    const parts = line.split(/(\*\*.*?\*\*)/g);
                                                    return (
                                                        <p key={idx}>
                                                            {parts.map((part, pidx) => {
                                                                if (part.startsWith('**') && part.endsWith('**')) {
                                                                    return <strong key={pidx}>{part.slice(2, -2)}</strong>;
                                                                }
                                                                return part;
                                                            })}
                                                        </p>
                                                    );
                                                })}
                                            </div>
                                        </motion.div>
                                    ))}
                                    {isLoading && (
                                        <div className="flex gap-3 mr-auto max-w-[85%]">
                                            <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                                                <Bot size={16} />
                                            </div>
                                            <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-slate-100">
                                                <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input */}
                                <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100 shrink-0">
                                    <div className="relative flex items-center gap-2">
                                        <Input
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            placeholder="세무 궁금증을 물어보세요..."
                                            className="h-12 rounded-2xl bg-slate-50 border-none focus-visible:ring-1 focus-visible:ring-indigo-500 pr-12"
                                            disabled={isLoading}
                                        />
                                        <Button
                                            size="icon"
                                            type="submit"
                                            disabled={!input.trim() || isLoading}
                                            className="absolute right-1 w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 transition-all shadow-md"
                                        >
                                            <Send size={18} />
                                        </Button>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-2 text-center">
                                        AI 비서는 실수를 할 수 있습니다. 중요한 결정은 전문가와 상담하세요.
                                    </p>
                                </form>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Float Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300",
                    isOpen ? "bg-white text-indigo-600 rotate-90" : "bg-indigo-600 text-white"
                )}
            >
                {isOpen ? <X size={28} /> : (
                    <div className="relative">
                        <MessageSquare size={28} />
                        <motion.div
                            animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-indigo-600 flex items-center justify-center"
                        >
                            <Sparkles size={8} className="text-white" />
                        </motion.div>
                    </div>
                )}
            </motion.button>
        </div>
    );
}
