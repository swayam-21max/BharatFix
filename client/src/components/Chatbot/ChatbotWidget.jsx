import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, X, RefreshCw, MessageSquare, Sparkles, User, HelpCircle, ChevronDown } from 'lucide-react';
import api from '../../services/api';
import './ChatbotWidget.css';

const INITIAL_WELCOME = {
    id: 'welcome_1',
    sender: 'bot',
    text: "Hello! 👋 Welcome to **BharatFix Assistant**. How can I help you today?",
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    suggestions: [
        "How do I file a complaint?",
        "What are the SLA timelines?",
        "How does escalation work?",
        "What categories are supported?"
    ]
};

export default function ChatbotWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([INITIAL_WELCOME]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [hasUnread, setHasUnread] = useState(true);

    const chatBodyRef = useRef(null);
    const inputRef = useRef(null);

    // Auto-scroll to bottom whenever messages update
    useEffect(() => {
        if (isOpen && chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
    }, [messages, isOpen, isLoading]);

    // Focus input on open
    useEffect(() => {
        if (isOpen) {
            setHasUnread(false);
            setTimeout(() => inputRef.current?.focus(), 150);
        }
    }, [isOpen]);

    const toggleOpen = () => {
        setIsOpen(prev => !prev);
    };

    const handleResetChat = () => {
        setMessages([INITIAL_WELCOME]);
    };

    const handleSendMessage = async (queryText) => {
        const textToSend = queryText || inputText;
        if (!textToSend || !textToSend.trim() || isLoading) return;

        const userMsgTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const userMsg = {
            id: `user_${Date.now()}`,
            sender: 'user',
            text: textToSend.trim(),
            time: userMsgTime
        };

        setMessages(prev => [...prev, userMsg]);
        if (!queryText) setInputText('');
        setIsLoading(true);

        try {
            // Attempt to hit backend API
            const res = await api.post('/chatbot/query', { message: textToSend });
            const botData = res.data?.data;

            const botMsgTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const botReplyMsg = {
                id: `bot_${Date.now()}`,
                sender: 'bot',
                text: botData?.reply || "I'm sorry, I couldn't process that request right now.",
                time: botMsgTime,
                suggestions: botData?.relatedQuestions || []
            };

            setMessages(prev => [...prev, botReplyMsg]);
        } catch (err) {
            console.error('Chatbot API call failed, using client fallback:', err);
            
            // Client fallback response
            const botMsgTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            let fallbackReply = "I am currently operating in offline mode. Please try asking about **how to file a complaint**, **SLA timelines**, or **escalations**!";
            
            const lower = textToSend.toLowerCase();
            if (lower.includes('file') || lower.includes('lodge') || lower.includes('create')) {
                fallbackReply = "To lodge a new complaint, click **'New Complaint'** in the navigation menu, fill in the category, description, and house number!";
            } else if (lower.includes('sla') || lower.includes('time')) {
                fallbackReply = "BharatFix SLA timelines:\n• Critical: 4 Hours\n• High: 12 Hours\n• Medium: 24 Hours\n• Low: 48 Hours";
            }

            setMessages(prev => [...prev, {
                id: `bot_${Date.now()}`,
                sender: 'bot',
                text: fallbackReply,
                time: botMsgTime,
                suggestions: ["How do I file a complaint?", "What are the SLA timelines?"]
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        handleSendMessage();
    };

    const handleChipClick = (question) => {
        handleSendMessage(question);
    };

    // Simple helper to format text with bold (**text**), code (`text`), and newlines
    const renderFormattedText = (content) => {
        if (!content) return null;
        
        const lines = content.split('\n');
        return lines.map((line, lIdx) => {
            // Check for bold and inline code
            const parts = line.split(/(\*\*.*?\*\*|`.*?`)/g);
            return (
                <div key={lIdx} style={{ minHeight: '1.2em', marginBottom: lIdx < lines.length - 1 ? '4px' : 0 }}>
                    {parts.map((part, pIdx) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={pIdx}>{part.slice(2, -2)}</strong>;
                        } else if (part.startsWith('`') && part.endsWith('`')) {
                            return <code key={pIdx}>{part.slice(1, -1)}</code>;
                        }
                        return part;
                    })}
                </div>
            );
        });
    };

    return (
        <div className="chatbot-wrapper">
            {/* Chat Window */}
            {isOpen && (
                <div className="chatbot-window">
                    {/* Header */}
                    <div className="chatbot-header">
                        <div className="chatbot-header-info">
                            <div className="chatbot-avatar-container">
                                <div className="chatbot-avatar">
                                    <Bot size={22} />
                                </div>
                                <span className="chatbot-online-dot" />
                            </div>
                            <div>
                                <h3 className="chatbot-header-title">BharatFix Assistant</h3>
                                <p className="chatbot-header-subtitle">Always here to help 24/7</p>
                            </div>
                        </div>
                        <div className="chatbot-header-actions">
                            <button className="chatbot-header-btn" onClick={handleResetChat} title="Reset Chat">
                                <RefreshCw size={16} />
                            </button>
                            <button className="chatbot-header-btn" onClick={toggleOpen} title="Minimize">
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Messages Body */}
                    <div className="chatbot-body" ref={chatBodyRef}>
                        {messages.map((msg) => (
                            <div key={msg.id} className={`chatbot-msg-row ${msg.sender}`}>
                                <div className={`chatbot-msg-icon ${msg.sender}`}>
                                    {msg.sender === 'bot' ? <Bot size={16} /> : <User size={16} />}
                                </div>
                                <div className={`chatbot-msg-bubble ${msg.sender}`}>
                                    <div>{renderFormattedText(msg.text)}</div>
                                    
                                    {/* Related suggestions chips */}
                                    {msg.sender === 'bot' && msg.suggestions && msg.suggestions.length > 0 && (
                                        <div className="chatbot-suggestions">
                                            {msg.suggestions.map((sug, sIdx) => (
                                                <button 
                                                    key={sIdx} 
                                                    className="chatbot-chip"
                                                    onClick={() => handleChipClick(sug)}
                                                >
                                                    <Sparkles size={11} /> {sug}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    <div className="chatbot-msg-time">{msg.time}</div>
                                </div>
                            </div>
                        ))}

                        {/* Typing indicator */}
                        {isLoading && (
                            <div className="chatbot-msg-row bot">
                                <div className="chatbot-msg-icon bot">
                                    <Bot size={16} />
                                </div>
                                <div className="chatbot-msg-bubble bot">
                                    <div className="chatbot-typing">
                                        <span className="chatbot-dot" />
                                        <span className="chatbot-dot" />
                                        <span className="chatbot-dot" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Form */}
                    <div className="chatbot-footer">
                        <form onSubmit={handleFormSubmit} className="chatbot-input-form">
                            <input
                                ref={inputRef}
                                type="text"
                                className="chatbot-input"
                                placeholder="Ask a question or paste complaint ID..."
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                            />
                            <button
                                type="submit"
                                className="chatbot-send-btn"
                                disabled={!inputText.trim() || isLoading}
                            >
                                <Send size={16} />
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Launcher Trigger Button */}
            <button className="chatbot-trigger" onClick={toggleOpen} aria-label="Open Chatbot">
                {isOpen ? <ChevronDown size={28} /> : <MessageSquare size={26} />}
                {hasUnread && !isOpen && <span className="chatbot-badge" />}
                {!isOpen && <span className="chatbot-pulse" />}
            </button>
        </div>
    );
}
