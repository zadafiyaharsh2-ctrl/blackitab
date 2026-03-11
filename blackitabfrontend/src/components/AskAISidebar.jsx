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
import { useTheme } from '../context/ThemeContext';
import useAskAIChat from '../hooks/useAskAIChat';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
    FaPaperPlane,
    FaRobot,
    FaUser,
    FaSpinner,
    FaExclamationCircle,
    FaTimes
} from 'react-icons/fa';
import { ChevronLeft, ChevronRight, X, MessageSquare } from 'lucide-react';

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
                    customStyle={{ fontSize: '0.75rem' }}
                    {...props}
                >
                    {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
            ) : (
                <code className={`${className || ''} ${isDark ? 'bg-gray-700' : 'bg-gray-200'} px-1 rounded text-xs`} {...props}>
                    {children}
                </code>
            );
        },
        h1: ({ children }) => <h1 className={`text-lg font-bold my-1 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{children}</h1>,
        h2: ({ children }) => <h2 className={`text-base font-bold my-1 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>{children}</h2>,
        h3: ({ children }) => <h3 className={`text-sm font-bold my-1 ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>{children}</h3>,
        ul: ({ children }) => <ul className="list-disc list-inside my-1 space-y-0.5 text-sm">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal list-inside my-1 space-y-0.5 text-sm">{children}</ol>,
        p: ({ children }) => <p className="mb-1.5 last:mb-0 leading-relaxed text-sm">{children}</p>,
        a: ({ children, href }) => <a href={href} className={`${isDark ? 'text-blue-400' : 'text-blue-600'} hover:underline text-sm`} target="_blank" rel="noreferrer">{children}</a>,
        blockquote: ({ children }) => <blockquote className={`border-l-3 ${isDark ? 'border-gray-500 text-gray-400' : 'border-gray-400 text-gray-600'} pl-2 my-1 italic text-sm`}>{children}</blockquote>,
        table: ({ children }) => <div className="overflow-x-auto my-1"><table className={`min-w-full border text-xs ${isDark ? 'border-gray-600' : 'border-gray-300'}`}>{children}</table></div>,
        th: ({ children }) => <th className={`px-2 py-1 text-left font-semibold border-b text-xs ${isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-100'}`}>{children}</th>,
        td: ({ children }) => <td className={`px-2 py-1 border-b text-xs ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>{children}</td>,
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
                <div className={`p-3 border-b border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 flex items-center justify-between ${!isOpen && 'hidden'}`}>
                    <div className="flex items-center gap-2 overflow-hidden">
                        <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex-shrink-0">
                            <FaRobot className="text-white text-sm" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="font-bold text-gray-900 dark:text-white text-sm truncate">Ask AI</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {topicName || subjectName || 'Study Assistant'}
                            </p>
                        </div>
                    </div>

                    <button onClick={onToggle} className="lg:hidden p-1.5">
                        <X className="h-4 w-4 text-gray-500" />
                    </button>
                </div>

                {/* Chat Messages */}
                <div className={`flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar ${!isOpen && 'hidden'}`}>
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`flex items-start gap-2 max-w-[90%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                {/* Avatar */}
                                <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${msg.role === 'user'
                                        ? 'bg-blue-600'
                                        : msg.isError
                                            ? 'bg-red-600'
                                            : 'bg-gradient-to-br from-purple-500 to-blue-600'
                                    }`}>
                                    {msg.role === 'user' ? (
                                        <FaUser className="text-white text-[10px]" />
                                    ) : (
                                        <FaRobot className="text-white text-[10px]" />
                                    )}
                                </div>

                                {/* Message Bubble */}
                                <div className={`px-3 py-2 rounded-xl text-sm ${msg.role === 'user'
                                        ? 'bg-blue-600 text-white rounded-tr-none'
                                        : msg.isError
                                            ? isDark
                                                ? 'bg-red-900/50 text-red-200 border border-red-800 rounded-tl-none'
                                                : 'bg-red-50 text-red-800 border border-red-200 rounded-tl-none'
                                            : isDark
                                                ? 'bg-gray-800 text-gray-200 border border-gray-700 rounded-tl-none'
                                                : 'bg-white text-gray-800 border border-gray-200 shadow-sm rounded-tl-none'
                                    }`}>
                                    {msg.role === 'user' ? (
                                        <p className="whitespace-pre-wrap break-words leading-relaxed text-sm">
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
                            <div className="flex items-start gap-2">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                                    <FaRobot className="text-white text-[10px] animate-pulse" />
                                </div>
                                <div className={`px-3 py-2 rounded-xl rounded-tl-none ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
                                    <div className="flex items-center gap-1.5">
                                        <FaSpinner className={`animate-spin text-xs ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Thinking...</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={chatEndRef} />
                </div>

                {/* Input Area */}
                <form
                    onSubmit={handleSendMessage}
                    className={`p-3 border-t border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 ${!isOpen && 'hidden'}`}
                >
                    {error && (
                        <div className={`mb-2 p-2 rounded-lg flex items-center gap-1.5 text-xs ${isDark ? 'bg-red-900/30 text-red-300' : 'bg-red-50 text-red-700'}`}>
                            <FaExclamationCircle className="text-xs" />
                            <span className="flex-1">{error}</span>
                            <button onClick={() => setError(null)}>
                                <FaTimes className="text-xs" />
                            </button>
                        </div>
                    )}

                    <div className="flex gap-2">
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about this topic..."
                            disabled={isLoading}
                            className={`flex-1 px-3 py-2 rounded-lg border text-sm transition-all focus:ring-2 focus:ring-purple-500 focus:outline-none ${isDark
                                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className={`px-3 py-2 rounded-lg transition-all flex items-center ${isLoading || !input.trim()
                                    ? 'bg-gray-600 cursor-not-allowed opacity-50'
                                    : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-md hover:shadow-lg'
                                }`}
                        >
                            {isLoading ? <FaSpinner className="animate-spin text-sm" /> : <FaPaperPlane className="text-sm" />}
                        </button>
                    </div>
                </form>
            </div>

            {/* Desktop Toggle Button */}
            <button
                onClick={onToggle}
                className={`
          hidden lg:flex absolute top-1/2 transform -translate-y-1/2 z-40
          bg-gradient-to-b from-purple-600 to-blue-600 text-white shadow-lg rounded-l-lg p-2
          hover:from-purple-700 hover:to-blue-700 transition-all duration-300
          ${isOpen ? 'right-96' : 'right-0'}
        `}
                title={isOpen ? "Close AI Assistant" : "Open AI Assistant"}
            >
                {isOpen ? (
                    <ChevronRight className="h-5 w-5" />
                ) : (
                    <div className="flex flex-col items-center gap-1">
                        <MessageSquare className="h-5 w-5" />
                        <ChevronLeft className="h-4 w-4" />
                    </div>
                )}
            </button>
        </>
    );
};

export default AskAISidebar;
