import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, Send, Bot, User, RefreshCw, Clock, MessageSquare, Plus, Trash2, Sparkles, AlertCircle, ArrowLeft } from 'lucide-react';
import { sendToGemini, generateChatTitle, type GeminiMessage } from '../utils/geminiService';

interface BelajarAISiswaProps {
    onBack: () => void;
}

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

interface ChatSession {
    id: string;
    title: string;
    date: Date;
}

const BelajarAISiswa: React.FC<BelajarAISiswaProps> = ({ onBack }) => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: 'Halo! Saya asisten AI belajarmu. Ada yang bisa saya bantu hari ini? Kita bisa belajar matematika, sains, bahasa, atau topik seru lainnya!',
            timestamp: new Date()
        }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const [chatHistory, setChatHistory] = useState<GeminiMessage[]>([]);
    const [history, setHistory] = useState<ChatSession[]>([
        { id: '1', title: 'Belajar Rumus Pythagoras', date: new Date(Date.now() - 86400000) },
        { id: '2', title: 'Ide Cerita Pendek Hewan', date: new Date(Date.now() - 172800000) },
    ]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSend = async () => {
        if (!input.trim() || isTyping) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date()
        };

        const currentInput = input;
        setInput('');
        setIsTyping(true);

        // Jika ini pesan pertama (chatHistory kosong), buat session baru di riwayat
        if (chatHistory.length === 0) {
            const title = generateChatTitle(currentInput);
            const newSession: ChatSession = {
                id: Date.now().toString(),
                title: title,
                date: new Date()
            };
            setHistory(prev => [newSession, ...prev]);
        }

        setMessages(prev => [...prev, userMessage]);

        try {
            // Panggil Google Gemini API
            const aiResponseText = await sendToGemini(currentInput, chatHistory);

            // Update chat history untuk Gemini
            const newHistory: GeminiMessage[] = [
                ...chatHistory,
                { role: 'user', parts: currentInput },
                { role: 'model', parts: aiResponseText }
            ];
            setChatHistory(newHistory);

            const aiResponse: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: aiResponseText,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, aiResponse]);
        } catch (error) {
            console.error('Error in handleSend:', error);

            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'Maaf, terjadi kesalahan saat memproses pesan Anda. Silakan coba lagi.',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleNewChat = () => {
        setMessages([
            {
                id: Date.now().toString(),
                role: 'assistant',
                content: 'Halo! Ada yang bisa saya bantu belajar hari ini?',
                timestamp: new Date()
            }
        ]);
        setChatHistory([]); // Reset chat history untuk Gemini
    };

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-in slide-in-from-right duration-300 flex flex-col md:flex-row h-[calc(100vh-140px)] md:h-[calc(100vh-120px)]">
            {/* Sidebar History (Hidden on mobile, often implemented with drawer on smaller screens) */}
            <div className="hidden md:flex w-64 bg-slate-50 border-r border-slate-200 flex-col shrink-0">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2">
                        <Clock size={16} /> Riwayat
                    </h3>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {history.map(session => (
                        <button key={session.id} className="w-full text-left p-3 rounded-xl hover:bg-slate-200 transition-colors group">
                            <p className="font-bold text-slate-700 text-xs truncate mb-1">{session.title}</p>
                            <p className="text-[10px] text-slate-400 group-hover:text-slate-500">
                                {session.date.toLocaleDateString()}
                            </p>
                        </button>
                    ))}
                </div>
                <div className="p-4 border-t border-slate-200">
                    <button className="w-full flex items-center justify-center gap-2 text-rose-500 text-xs font-bold p-2 hover:bg-rose-50 rounded-xl transition-colors">
                        <Trash2 size={14} /> Hapus Riwayat
                    </button>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-white">
                {/* Header Chat */}
                <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors md:hidden">
                            <ChevronRight className="rotate-180" size={24} />
                        </button>
                        <button onClick={onBack} className="hidden md:block p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                            <ArrowLeft size={20} /> {/* Only icon change for desktop aesthetics */}
                        </button>

                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center shadow-md shadow-blue-200">
                                <Bot size={24} className="text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 text-sm">Teman Belajar AI</h3>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                    <span className="text-[10px] text-slate-500 font-medium">Online • Gemini Flash Thinking</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => handleNewChat()}
                        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors tooltip"
                        title="Chat Baru"
                    >
                        <Plus size={20} />
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-slate-50/50">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                        >
                            {/* Avatar */}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'assistant'
                                ? 'bg-gradient-to-tr from-cyan-500 to-blue-500 text-white shadow-blue-200 shadow-md'
                                : 'bg-slate-200 text-slate-500' // User avatar placeholder
                                }`}>
                                {msg.role === 'assistant' ? <Sparkles size={16} /> : <User size={16} />}
                            </div>

                            {/* Bubble */}
                            <div className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                <div className={`px-5 py-3.5 rounded-2xl shadow-sm text-sm leading-relaxed ${msg.role === 'user'
                                    ? 'bg-[#004AAD] text-white rounded-tr-none'
                                    : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'
                                    }`}>
                                    {msg.content}
                                </div>
                                <span className="text-[10px] text-slate-400 mt-1 px-2">
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    ))}

                    {isTyping && (
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center shrink-0 shadow-blue-200 shadow-md">
                                <Sparkles size={16} className="text-white" />
                            </div>
                            <div className="bg-white border border-slate-100 px-5 py-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1.5">
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-slate-100">
                    <div className="relative max-w-4xl mx-auto flex items-end gap-2 bg-slate-50 p-2 rounded-3xl border border-slate-200 focus-within:border-cyan-400 focus-within:ring-4 focus-within:ring-cyan-50 transition-all">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Tanya apapun ke AI..."
                            className="flex-1 bg-transparent border-none focus:ring-0 text-slate-700 placeholder:text-slate-400 py-3 px-4 max-h-32 min-h-[48px]"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || isTyping}
                            className="p-3 bg-[#004AAD] text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-[#004AAD] transition-all shadow-md shadow-blue-200 mb-0.5 mr-0.5"
                        >
                            {isTyping ? <RefreshCw size={20} className="animate-spin" /> : <Send size={20} />}
                        </button>
                    </div>
                    <p className="text-center text-[10px] text-slate-400 mt-2">
                        AI bisa salah. Cek kembali informasi penting. (Powered by Gemini & Groq)
                    </p>
                </div>
            </div>
        </div>
    );
};

export default BelajarAISiswa;
