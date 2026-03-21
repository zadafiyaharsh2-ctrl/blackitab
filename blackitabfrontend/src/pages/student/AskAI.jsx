import { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import useAskAIChat from '../../hooks/useAskAIChat';
import usePageTitle from '../../hooks/usePageTitle';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
  FaHistory, FaTrash, FaSpinner,
  FaExclamationCircle, FaTimes, FaComment, FaPlus
} from 'react-icons/fa';
import { Bot, Sparkles, UserCircle2, Zap, Send } from 'lucide-react';
import SimpleConfirmationModal from '../../components/shared/SimpleConfirmationModal';

const AskAI = () => {
  usePageTitle('Ask AI');
  const { isDark } = useTheme();

  const {
    messages, input, setInput, isLoading, error, setError,
    chatList, currentChatId, showHistory, setShowHistory,
    loadingHistory, chatEndRef, inputRef,
    handleSendMessage, loadChat, createNewChat,
    deleteChatSession, clearAllHistory,
  } = useAskAIChat({ loadHistory: true });

  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    action: null,
    id: null,
    title: '',
    message: ''
  });

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleClearHistory = () => {
    setConfirmState({
      isOpen: true,
      action: clearAllHistory,
      id: 'clear',
      title: 'Clear All History',
      message: 'Are you sure you want to clear all chat history?'
    });
  };

  const sampleQuestions = [
    "What is a database?",
    "Explain normalization in DBMS",
    "What are SQL joins?",
    "How do indexes work?"
  ];

  const markdownComponents = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <SyntaxHighlighter style={vscDarkPlus} language={match[1]} PreTag="div" {...props}>
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code className={`${className || ''} bg-gray-100 dark:bg-gray-800 px-1 rounded text-sm`} {...props}>{children}</code>
      );
    },
    h1: ({ children }) => <h1 className="text-2xl font-bold my-4 text-indigo-700 dark:text-indigo-400 tracking-tight">{children}</h1>,
    h2: ({ children }) => <h2 className="text-xl font-bold my-3 text-purple-700 dark:text-purple-400 tracking-tight">{children}</h2>,
    h3: ({ children }) => <h3 className="text-lg font-bold my-2 text-gray-800 dark:text-gray-100">{children}</h3>,
    ul: ({ children }) => <ul className="list-disc list-outside ml-5 my-3 space-y-1.5 text-gray-700 dark:text-gray-300">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal list-outside ml-5 my-3 space-y-1.5 text-gray-700 dark:text-gray-300">{children}</ol>,
    p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed text-gray-700 dark:text-gray-300">{children}</p>,
    a: ({ children, href }) => <a href={href} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium underline underline-offset-2 transition-colors" target="_blank" rel="noreferrer">{children}</a>,
    blockquote: ({ children }) => <blockquote className="border-l-4 border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-900/10 text-gray-700 dark:text-gray-300 px-4 py-2 my-4 italic rounded-r-lg">{children}</blockquote>,
    table: ({ children }) => <div className="overflow-x-auto my-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"><table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">{children}</table></div>,
    th: ({ children }) => <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800/50">{children}</th>,
    td: ({ children }) => <td className="px-4 py-3 text-sm border-t border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-300">{children}</td>,
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-3rem)] flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-[#0a0a0a]/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
            <Sparkles className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">Ask AI</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Powered by advanced models</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {currentChatId && (
            <button
              onClick={createNewChat}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 dark:border-white/10 rounded-lg text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5"
            >
              <FaPlus className="text-[10px]" /> New Chat
            </button>
          )}
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${
              showHistory
                ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                : 'border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'
            }`}
          >
            <FaHistory /> Chats
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex overflow-hidden">

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col ${showHistory ? 'hidden md:flex' : 'flex'}`}>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex items-start gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                    msg.role === 'user' ? 'bg-gradient-to-br from-gray-700 to-gray-900 dark:from-gray-100 dark:to-gray-300' : msg.isError ? 'bg-red-500' : 'bg-gradient-to-br from-indigo-500 to-purple-600 ring-2 ring-indigo-50 dark:ring-indigo-900/30'
                  }`}>
                    {msg.role === 'user'
                      ? <UserCircle2 className="text-white dark:text-gray-900 w-5 h-5" />
                      : <Bot className="text-white w-5 h-5" />
                    }
                  </div>
                  <div className={`px-5 py-3.5 rounded-2xl text-sm shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-gray-800 to-gray-900 dark:from-gray-100 dark:to-gray-200 text-white dark:text-gray-900 rounded-tr-sm border border-gray-700 dark:border-gray-300'
                      : msg.isError
                        ? 'bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/30 rounded-tl-sm'
                        : 'bg-white dark:bg-gray-800/80 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-tl-sm'
                  }`}>
                    {msg.role === 'user' ? (
                      <p className="whitespace-pre-wrap break-words leading-relaxed text-base">{msg.content}</p>
                    ) : (
                      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                        {msg.content}
                      </ReactMarkdown>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-sm ring-2 ring-indigo-50 dark:ring-indigo-900/30 flex items-center justify-center shrink-0">
                    <Sparkles className="text-white w-4 h-4 animate-pulse" />
                  </div>
                  <div className="px-5 py-3.5 rounded-2xl rounded-tl-sm bg-white dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700 flex items-center gap-3 text-sm text-gray-500 font-medium shadow-sm h-12">
                    <div className="flex space-x-1.5">
                      <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {messages.length === 1 && (
              <div className="flex flex-col items-center justify-center h-full min-h-[50vh] px-4">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-2xl flex items-center justify-center mb-6 shadow-inner ring-1 ring-indigo-50 dark:ring-indigo-900">
                  <Sparkles className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">How can I help you today?</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 max-w-sm text-center">
                  Ask me anything about your studies, and I'll provide clear, accurate explanations.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                  {sampleQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInput(q)}
                      className="group p-4 text-left rounded-xl bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:shadow-md transition-all duration-200 flex items-center justify-between"
                    >
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {q}
                      </span>
                      <Zap className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-indigo-400 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white dark:bg-[#0a0a0a] border-t border-gray-100 dark:border-gray-800">
            <div className="max-w-4xl mx-auto">
              {error && (
                <div className="mb-3 px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm rounded-xl flex items-center gap-2 border border-red-200 dark:border-red-800/50 shadow-sm">
                  <FaExclamationCircle className="shrink-0" />
                  <span className="flex-1">{error}</span>
                  <button onClick={() => setError(null)} className="p-1 hover:bg-red-100 dark:hover:bg-red-800/50 rounded-lg transition-colors"><FaTimes /></button>
                </div>
              )}
              <form onSubmit={handleSendMessage} className="relative flex items-center gap-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-2 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-400 dark:focus-within:border-indigo-500 transition-all">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Message Ask AI..."
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none disabled:opacity-50 text-base"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl disabled:opacity-40 disabled:hover:bg-indigo-600 transition-colors flex items-center justify-center shrink-0 h-11 w-11 shadow-sm"
                >
                  {isLoading ? <FaSpinner className="animate-spin w-5 h-5" /> : <Send className="w-5 h-5 ml-1" />}
                </button>
              </form>
              <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-3">
                AI can make mistakes. Verify important information.
              </p>
            </div>
          </div>
        </div>

        {/* History Sidebar */}
        {showHistory && (
          <div className="w-full md:w-72 flex flex-col border-l border-gray-200 dark:border-white/10 bg-white dark:bg-black/20">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Your Chats</h3>
              <div className="flex items-center gap-2">
                {chatList.length > 0 && (
                  <button onClick={handleClearHistory} className="text-xs text-red-500 hover:underline">Clear all</button>
                )}
                <button onClick={() => setShowHistory(false)} className="md:hidden text-gray-400"><FaTimes /></button>
              </div>
            </div>
            <div className="px-3 py-2 border-b border-gray-100 dark:border-white/5">
              <button
                onClick={createNewChat}
                className="w-full py-2 text-sm border border-gray-200 dark:border-white/10 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5"
              >
                + New Chat
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
              {loadingHistory ? (
                <div className="flex justify-center py-8"><FaSpinner className="animate-spin text-gray-400" /></div>
              ) : chatList.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <FaComment className="text-2xl mx-auto mb-2 opacity-30" />
                  <p className="text-xs">No chats yet</p>
                </div>
              ) : (
                chatList.map((chat) => (
                  <div
                    key={chat._id}
                    onClick={() => loadChat(chat._id)}
                    className={`px-3 py-2.5 rounded-lg cursor-pointer group flex items-start justify-between gap-2 ${
                      currentChatId === chat._id
                        ? 'bg-gray-100 dark:bg-white/10'
                        : 'hover:bg-gray-50 dark:hover:bg-white/5'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">{chat.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{new Date(chat.updatedAt).toLocaleDateString()}</p>
                    </div>
                    <button
                      onClick={(e) => deleteChatSession(chat._id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded text-gray-400 hover:text-red-500"
                    >
                      <FaTrash className="text-xs" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <SimpleConfirmationModal 
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState({ ...confirmState, isOpen: false, id: null, action: null })}
        onConfirm={() => {
        if (confirmState.action) {
            confirmState.action();
        }
        setConfirmState({ ...confirmState, isOpen: false, id: null, action: null });
        }}
        title={confirmState.title}
        message={confirmState.message}
        confirmText="Confirm"
        isDanger={true}
      />
    </div>
  );
};

export default AskAI;