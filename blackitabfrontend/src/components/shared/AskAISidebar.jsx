/**
 * ============================================================================
 * ASK AI SIDEBAR COMPONENT
 * ============================================================================
 * 
 * A compact sidebar version of the AskAI chat, designed to be embedded 
 * in the Theory page's right panel. Uses the shared useAskAIChat hook
 * so all chat logic is shared with the full AskAI page — no duplicate API calls.
 */

import { useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import useAskAIChat from '../../hooks/useAskAIChat';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
    FaSpinner,
    FaExclamationCircle,
    FaTimes
} from 'react-icons/fa';
import { ChevronLeft, ChevronRight, X, MessageSquare, Bot, Sparkles, UserCircle2, Zap, Send } from 'lucide-react';

const AskAISidebar = ({ isOpen, onToggle, subjectName, topicName }) => {
    const { isDark } = useTheme();

    // Use the shared hook — pass subject/topic context, skip history loading for sidebar
    const {
        messages,
        input,
        setInput,
        isLoading,
        error,
        setError,
        chatEndRef,
        inputRef,
        handleSendMessage,
    } = useAskAIChat({
        subjectContext: subjectName,
        topicContext: topicName,
        loadHistory: false, // Sidebar doesn't need full history panel
    });

    // Focus input when sidebar opens
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [isOpen]);

    // Compact markdown rendering
    const markdownComponents = {
        code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
                <SyntaxHighlighter
                    style={vscDarkPlus}
                    language={match[1]}
                    PreTag="div"
                    customStyle={{ fontSize: '0.75rem', borderRadius: '0.5rem', margin: '0.5rem 0' }}
                    {...props}
                >
                    {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
            ) : (
                <code className={`${className || ''} ${isDark ? 'bg-gray-800' : 'bg-gray-100'} px-1.5 py-0.5 rounded text-xs font-mono text-indigo-600 dark:text-indigo-400`} {...props}>
                    {children}
                </code>
            );
        },
        h1: ({ children }) => <h1 className={`text-lg font-bold my-2 ${isDark ? 'text-indigo-400' : 'text-indigo-700'} tracking-tight`}>{children}</h1>,
        h2: ({ children }) => <h2 className={`text-base font-bold my-2 ${isDark ? 'text-purple-400' : 'text-purple-700'} tracking-tight`}>{children}</h2>,
        h3: ({ children }) => <h3 className={`text-sm font-bold my-1.5 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{children}</h3>,
        ul: ({ children }) => <ul className={`list-disc list-outside ml-4 my-2 space-y-1 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{children}</ul>,
        ol: ({ children }) => <ol className={`list-decimal list-outside ml-4 my-2 space-y-1 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{children}</ol>,
        p: ({ children }) => <p className={`mb-2 last:mb-0 leading-relaxed text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{children}</p>,
        a: ({ children, href }) => <a href={href} className={`${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'} underline underline-offset-2 text-sm transition-colors`} target="_blank" rel="noreferrer">{children}</a>,
        blockquote: ({ children }) => <blockquote className={`border-l-3 ${isDark ? 'border-indigo-800 bg-indigo-900/10 text-gray-400' : 'border-indigo-200 bg-indigo-50/50 text-gray-600'} pl-3 py-1 my-2 italic text-sm rounded-r-lg`}>{children}</blockquote>,
        table: ({ children }) => <div className="overflow-x-auto my-2 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"><table className={`min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-xs`}>{children}</table></div>,
        th: ({ children }) => <th className={`px-2.5 py-1.5 text-left font-semibold border-b ${isDark ? 'border-gray-700 bg-gray-800/50 text-gray-200' : 'border-gray-200 bg-gray-50 text-gray-800'}`}>{children}</th>,
        td: ({ children }) => <td className={`px-2.5 py-1.5 border-b ${isDark ? 'border-gray-800 text-gray-300' : 'border-gray-100 text-gray-700'}`}>{children}</td>,
    };

    return (
        <>
            {/* Mobile Backdrop */}
            <div
                className={`fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={onToggle}
            />

            {/* Sidebar Container */}
            <div
                className={`
          fixed lg:static inset-y-0 right-0 z-30 bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700 border-l
          transform transition-all duration-300 ease-in-out flex flex-col
          ${isOpen ? 'translate-x-0 w-80 lg:w-96' : 'translate-x-full lg:translate-x-0 lg:w-0 lg:border-l-0 lg:overflow-hidden'}
          lg:h-full mt-16 lg:mt-0
        `}
            >
                {/* Header */}
                <div className={`px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-[#0a0a0a]/50 backdrop-blur-md flex items-center justify-between ${!isOpen && 'hidden'}`}>
                    <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className="p-1.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex-shrink-0 shadow-sm shadow-indigo-500/20">
                            <Sparkles className="text-white w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="font-bold text-gray-900 dark:text-white text-sm truncate leading-tight">Ask AI</h2>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate tracking-wide uppercase font-semibold">
                                {topicName || subjectName || 'Study Assistant'}
                            </p>
                        </div>
                    </div>

                    <button onClick={onToggle} className="lg:hidden p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                        <X className="h-4 w-4 text-gray-500" />
                    </button>
                </div>

                {/* Chat Messages */}
                <div className={`flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar bg-gray-50/50 dark:bg-[#0a0a0a]/50 ${!isOpen && 'hidden'}`}>
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`flex items-start gap-2.5 max-w-[92%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                {/* Avatar */}
                                <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center shadow-sm ${msg.role === 'user'
                                        ? 'bg-gradient-to-br from-gray-700 to-gray-900 dark:from-gray-100 dark:to-gray-300'
                                        : msg.isError
                                            ? 'bg-red-500'
                                            : 'bg-gradient-to-br from-indigo-500 to-purple-600 ring-2 ring-indigo-50 dark:ring-indigo-900/30'
                                    }`}>
                                    {msg.role === 'user' ? (
                                        <UserCircle2 className="text-white dark:text-gray-900 w-4 h-4" />
                                    ) : (
                                        <Bot className="text-white w-4 h-4" />
                                    )}
                                </div>

                                {/* Message Bubble */}
                                <div className={`px-4 py-2.5 rounded-2xl text-[13px] shadow-sm ${msg.role === 'user'
                                        ? 'bg-gradient-to-br from-gray-800 to-gray-900 dark:from-gray-100 dark:to-gray-200 text-white dark:text-gray-900 rounded-tr-sm border border-gray-700 dark:border-gray-300'
                                        : msg.isError
                                            ? isDark
                                                ? 'bg-red-900/10 text-red-400 border border-red-900/30 rounded-tl-sm'
                                                : 'bg-red-50 text-red-700 border border-red-100 rounded-tl-sm'
                                            : isDark
                                                ? 'bg-gray-800/80 text-gray-200 border border-gray-700 rounded-tl-sm'
                                                : 'bg-white text-gray-800 border border-gray-100 rounded-tl-sm'
                                    }`}>
                                    {msg.role === 'user' ? (
                                        <p className="whitespace-pre-wrap break-words leading-relaxed text-[13px]">
                                            {msg.content}
                                        </p>
                                    ) : (
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            components={markdownComponents}
                                        >
                                            {msg.content}
                                        </ReactMarkdown>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Loading indicator */}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="flex items-start gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-sm ring-2 ring-indigo-50 dark:ring-indigo-900/30 flex items-center justify-center shrink-0">
                                    <Sparkles className="text-white w-3.5 h-3.5 animate-pulse" />
                                </div>
                                <div className={`px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center h-10 ${isDark ? 'bg-gray-800/80 border border-gray-700' : 'bg-white border border-gray-100'}`}>
                                    <div className="flex space-x-1">
                                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={chatEndRef} />
                </div>

                {/* Input Area */}
                <div
                    className={`p-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] ${!isOpen && 'hidden'}`}
                >
                    {error && (
                        <div className={`mb-3 p-2.5 rounded-xl flex items-center gap-2 text-xs border shadow-sm ${isDark ? 'bg-red-900/20 text-red-300 border-red-800/50' : 'bg-red-50 text-red-700 border-red-200'}`}>
                            <FaExclamationCircle className="shrink-0 text-xs" />
                            <span className="flex-1 leading-tight">{error}</span>
                            <button onClick={() => setError(null)} className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors">
                                <FaTimes className="text-xs" />
                            </button>
                        </div>
                    )}

                    <form onSubmit={handleSendMessage} className="relative flex items-center gap-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-1.5 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-400 dark:focus-within:border-indigo-500 transition-all">
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about this topic..."
                            disabled={isLoading}
                            className={`flex-1 px-3 py-2 bg-transparent text-sm focus:outline-none ${isDark
                                    ? 'text-white placeholder-gray-500'
                                    : 'text-gray-900 placeholder-gray-400'
                                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className={`p-2 rounded-xl transition-all flex items-center justify-center shrink-0 w-9 h-9 ${isLoading || !input.trim()
                                    ? 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                                }`}
                        >
                            {isLoading ? <FaSpinner className="animate-spin text-sm" /> : <Send className="w-4 h-4 ml-0.5" />}
                        </button>
                    </form>
                </div>
            </div>

            {/* Desktop Toggle Button */}
            <button
                onClick={onToggle}
                className={`
          hidden lg:flex absolute top-1/2 transform -translate-y-1/2 z-40
          bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg p-2
          hover:bg-gray-50 dark:hover:bg-gray-800 text-indigo-600 dark:text-indigo-400 transition-all duration-300
          ${isOpen ? 'right-96 rounded-l-xl border-r-0' : 'right-0 rounded-l-xl border-r-0'}
        `}
                title={isOpen ? "Close AI Assistant" : "Open AI Assistant"}
            >
                {isOpen ? (
                    <ChevronRight className="h-5 w-5" />
                ) : (
                    <div className="flex flex-col items-center gap-1.5 py-1">
                        <Sparkles className="h-5 w-5" />
                        <ChevronLeft className="h-4 w-4 mt-1 opacity-70" />
                    </div>
                )}
            </button>
        </>
    );
};

export default AskAISidebar;
