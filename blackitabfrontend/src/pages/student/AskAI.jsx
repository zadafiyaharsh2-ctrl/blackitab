import { useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import useAskAIChat from '../../hooks/useAskAIChat';
import usePageTitle from '../../hooks/usePageTitle';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
  FaPaperPlane, FaRobot, FaUser, FaHistory,
  FaTrash, FaSpinner, FaExclamationCircle, FaLightbulb,
  FaTimes, FaComment, FaPlus
} from 'react-icons/fa';

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

  useEffect(() => { inputRef.current?.focus(); }, []);

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
    h1: ({ children }) => <h1 className="text-xl font-bold my-2 text-blue-600 dark:text-blue-400">{children}</h1>,
    h2: ({ children }) => <h2 className="text-lg font-bold my-2 text-gray-800 dark:text-gray-200">{children}</h2>,
    h3: ({ children }) => <h3 className="text-base font-bold my-1 text-gray-800 dark:text-gray-200">{children}</h3>,
    ul: ({ children }) => <ul className="list-disc list-inside my-2 space-y-1">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal list-inside my-2 space-y-1">{children}</ol>,
    p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
    a: ({ children, href }) => <a href={href} className="text-blue-600 dark:text-blue-400 hover:underline" target="_blank" rel="noreferrer">{children}</a>,
    blockquote: ({ children }) => <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 pl-3 my-2 italic">{children}</blockquote>,
    table: ({ children }) => <div className="overflow-x-auto my-2"><table className="min-w-full border border-gray-200 dark:border-gray-700">{children}</table></div>,
    th: ({ children }) => <th className="px-3 py-2 text-left font-semibold border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">{children}</th>,
    td: ({ children }) => <td className="px-3 py-2 border-b border-gray-100 dark:border-gray-800">{children}</td>,
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-3rem)] flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gray-900 dark:bg-white flex items-center justify-center">
            <FaRobot className="text-white dark:text-gray-900 text-sm" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-900 dark:text-white">Ask AI</h1>
            <p className="text-xs text-gray-400">Your study companion</p>
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
                <div className={`flex items-start gap-2.5 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                    msg.role === 'user' ? 'bg-gray-900 dark:bg-white' : msg.isError ? 'bg-red-500' : 'bg-gray-200 dark:bg-gray-700'
                  }`}>
                    {msg.role === 'user'
                      ? <FaUser className="text-white dark:text-gray-900 text-xs" />
                      : <FaRobot className="text-gray-600 dark:text-gray-300 text-xs" />
                    }
                  </div>
                  <div className={`px-4 py-3 rounded-2xl text-sm ${
                    msg.role === 'user'
                      ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-tr-sm'
                      : msg.isError
                        ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 rounded-tl-sm'
                        : 'bg-white dark:bg-white/5 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-white/10 rounded-tl-sm'
                  }`}>
                    {msg.role === 'user' ? (
                      <p className="whitespace-pre-wrap break-words leading-relaxed">{msg.content}</p>
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
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <FaRobot className="text-gray-600 dark:text-gray-300 text-xs" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center gap-2 text-sm text-gray-500">
                    <FaSpinner className="animate-spin" /> Thinking…
                  </div>
                </div>
              </div>
            )}

            {messages.length === 1 && (
              <div className="mt-6 border border-gray-200 dark:border-white/10 rounded-xl p-4 bg-white dark:bg-white/[0.02]">
                <div className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <FaLightbulb className="text-amber-400" /> Try asking…
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {sampleQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInput(q)}
                      className="p-2.5 text-left rounded-lg text-sm border border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400"
                    >
                      "{q}"
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="px-4 py-3 border-t border-gray-200 dark:border-white/10">
            {error && (
              <div className="mb-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-xs rounded-lg flex items-center gap-2 border border-red-200 dark:border-red-800">
                <FaExclamationCircle /> {error}
                <button onClick={() => setError(null)} className="ml-auto"><FaTimes /></button>
              </div>
            )}
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything about your studies…"
                disabled={isLoading}
                className="flex-1 px-3 py-2.5 text-sm border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="px-4 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-semibold rounded-lg disabled:opacity-40 flex items-center gap-1.5"
              >
                {isLoading ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
                <span className="hidden sm:inline">Send</span>
              </button>
            </div>
          </form>
        </div>

        {/* History Sidebar */}
        {showHistory && (
          <div className="w-full md:w-72 flex flex-col border-l border-gray-200 dark:border-white/10 bg-white dark:bg-black/20">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Your Chats</h3>
              <div className="flex items-center gap-2">
                {chatList.length > 0 && (
                  <button onClick={clearAllHistory} className="text-xs text-red-500 hover:underline">Clear all</button>
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
    </div>
  );
};

export default AskAI;