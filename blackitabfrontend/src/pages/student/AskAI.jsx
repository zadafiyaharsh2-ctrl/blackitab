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
    <div className="flex flex-col h-[calc(100vh-3rem)] bg-[#f8f9fa] dark:bg-[#05000a] font-sans selection:bg-[#0061FF]/20 selection:text-gray-900 transition-colors">
      

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
        confirmText="Confirm Action"
        isDanger={true}
      />

      {/* Header */}
      <header className="flex-none bg-white/70 dark:bg-black/40 backdrop-blur-2xl border-b border-gray-200 dark:border-white/10 px-6 py-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#0061FF]/10 text-[#0061FF] dark:text-[#a5c3ff]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">Copilot Central</h1>
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Powered By Advanced Models</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {currentChatId && (
            <button
              onClick={createNewChat}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-gray-200 dark:border-white/10 text-[11px] font-bold uppercase tracking-widest text-[#0061FF] dark:text-[#a5c3ff] hover:bg-[#0061FF]/5 transition-all"
            >
              <FaPlus /> New Session
            </button>
          )}
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all ${
              showHistory
                ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-md'
                : 'bg-white dark:bg-black border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:shadow-sm'
            }`}
          >
            <FaHistory className="text-[10px]" /> {showHistory ? "Hide History" : "Chats"}
          </button>
        </div>
      </header>

      {/* Layout Split */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Main Chat Feed */}
        <main className={`flex-1 flex flex-col relative ${showHistory ? 'hidden md:flex' : 'flex'}`}>
          <div className="flex-1 overflow-y-auto px-4 md:px-12 lg:px-24 py-10 scroll-smooth custom-scrollbar">
            
            <div className="max-w-4xl mx-auto space-y-12 pb-8">
              {messages.length === 1 ? (
                // Empty State / Welcome
                <div className="h-full flex flex-col items-center justify-center py-24 px-4 text-center mt-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="w-20 h-20 mb-8 rounded-[2rem] bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/10 shadow-sm flex items-center justify-center transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                    <Sparkles className="w-8 h-8 text-[#0061FF] dark:text-[#a5c3ff]" />
                  </div>
                  <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4">
                    How can I assist you?
                  </h2>
                  <p className="text-sm font-medium text-gray-500 max-w-md mx-auto mb-16 leading-relaxed">
                    Ask a conceptual question, request a code review, or seek clarification on any academic topic. I am here to dissect the complex.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                    {sampleQuestions.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => setInput(q)}
                        className="group relative p-6 text-left rounded-[2rem] overflow-hidden border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.02] hover:border-[#0061FF]/40 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-[#0061FF]/0 to-[#0061FF]/[0.02] dark:to-[#0061FF]/[0.05] opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative flex items-center justify-between z-10">
                          <span className="text-sm font-bold text-gray-800 dark:text-gray-200 group-hover:text-[#0061FF] dark:group-hover:text-[#a5c3ff] transition-colors pr-6">
                            {q}
                          </span>
                          <div className="w-8 h-8 rounded-full border border-gray-100 dark:border-white/10 flex items-center justify-center text-gray-300 dark:text-gray-600 group-hover:bg-[#0061FF]/10 group-hover:text-[#0061FF] transition-all">
                            <Zap className="w-3 h-3" />
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                // Chat Flow
                messages.map((msg, idx) => {
                  const isUser = msg.role === 'user';
                  // Ignore initial invisible system prompt if it exists (assuming it doesn't render if role is system, but we only have user/assistant usually)
                  if (!msg.content) return null;

                  return (
                    <div key={idx} className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-500`}>
                      <div className={`flex gap-6 max-w-[85%] md:max-w-[75%] ${isUser ? 'flex-row-reverse' : ''}`}>
                        
                        {/* Avatar */}
                        {!isUser && (
                          <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center border border-gray-200 dark:border-white/10 bg-white dark:bg-black shadow-sm mt-1">
                            {msg.isError ? <FaExclamationCircle className="text-red-500" /> : <Sparkles className="w-4 h-4 text-[#0061FF] dark:text-[#a5c3ff]" />}
                          </div>
                        )}

                        {/* Message Card */}
                        <div className={`group relative rounded-[2rem] px-8 py-6 text-[15px] leading-relaxed shadow-sm ${
                          isUser
                            ? 'bg-[#0061FF] text-white rounded-tr-none'
                            : msg.isError
                              ? 'bg-red-50 dark:bg-red-500/10 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-500/20 rounded-tl-none'
                              : 'bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 text-gray-800 dark:text-gray-200 rounded-tl-none'
                        }`}>
                          {isUser ? (
                            <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                          ) : (
                            <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:my-4 prose-pre:bg-gray-50 dark:prose-pre:bg-[#05000a] prose-pre:border prose-pre:border-gray-200 dark:prose-pre:border-white/5 prose-pre:rounded-2xl">
                              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                                {msg.content}
                              </ReactMarkdown>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Typing Indicator */}
              {isLoading && (
                <div className="flex w-full justify-start animate-in fade-in">
                  <div className="flex gap-6 max-w-[75%]">
                    <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center border border-gray-200 dark:border-white/10 bg-white dark:bg-black shadow-sm mt-1">
                      <Sparkles className="w-4 h-4 text-[#0061FF] animate-pulse" />
                    </div>
                    <div className="rounded-[2rem] rounded-tl-none px-8 py-6 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 shadow-sm flex items-center gap-2">
                       <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                       <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                       <span className="w-2 h-2 rounded-full bg-[#0061FF] animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} className="h-4" />
            </div>
          </div>

          {/* Input Area (Floating) */}
          <div className="p-4 md:p-8 pt-0 relative z-20">
            <div className="max-w-4xl mx-auto">
              {error && (
                <div className="mb-4 p-4 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-sm font-medium rounded-2xl flex items-center gap-3 border border-red-200 dark:border-red-500/20 animate-in slide-in-from-bottom-2">
                  <FaExclamationCircle className="shrink-0" />
                  <span className="flex-1">{error}</span>
                  <button onClick={() => setError(null)} className="p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"><FaTimes className="text-xs" /></button>
                </div>
              )}
              
              <form onSubmit={handleSendMessage} className="relative group">
                <div className="absolute inset-0 bg-[#0061FF]/5 blur-2xl rounded-[3rem] -z-10 group-focus-within:bg-[#0061FF]/10 transition-colors duration-500" />
                <div className="relative flex items-center bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-2 pr-2.5 shadow-lg shadow-gray-200/50 dark:shadow-black/50 focus-within:ring-4 focus-within:ring-[#0061FF]/10 focus-within:border-[#0061FF]/30 transition-all duration-300">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Message Copilot..."
                    disabled={isLoading}
                    className="flex-1 px-6 py-4 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 font-medium text-[15px] outline-none disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="inline-flex items-center justify-center w-12 h-12 bg-[#0061FF] hover:bg-[#004bcc] text-white rounded-full transition-all duration-300 disabled:opacity-40 disabled:hover:bg-[#0061FF] shrink-0 hover:shadow-md hover:-translate-y-0.5"
                  >
                    {isLoading ? <FaSpinner className="animate-spin text-lg" /> : <Send className="w-5 h-5 ml-0.5" />}
                  </button>
                </div>
              </form>
              <div className="text-center mt-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  AI-generated content can contain inaccuracies. Verify critical outputs.
                </p>
              </div>
            </div>
          </div>
        </main>

        {/* Sidebar History (Collapsible) */}
        {showHistory && (
          <aside className="w-full md:w-[320px] flex-shrink-0 flex flex-col bg-white border-l border-gray-200 dark:bg-[#0a0a0a] dark:border-white/10 z-30 animate-in slide-in-from-right-4 duration-300">
            <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-900 dark:text-white">Sessions</h3>
                <p className="text-[10px] font-medium text-gray-400 mt-1">{chatList.length} Active</p>
              </div>
              <div className="flex items-center gap-3">
                {chatList.length > 0 && (
                  <button onClick={handleClearHistory} className="text-[11px] font-bold text-red-500 hover:text-red-700 transition-colors uppercase tracking-wider">Flush</button>
                )}
                <button onClick={() => setShowHistory(false)} className="md:hidden w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-white/5 text-gray-500"><FaTimes className="text-xs" /></button>
              </div>
            </div>
            
            <div className="p-4 border-b border-gray-100 dark:border-white/5">
              <button
                onClick={createNewChat}
                className="w-full py-3 px-4 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 dark:border-white/10 text-xs font-bold text-gray-600 dark:text-gray-300 hover:border-[#0061FF]/40 hover:text-[#0061FF] transition-colors"
              >
                <FaPlus className="text-[10px]" /> Initialize New Session
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
              {loadingHistory ? (
                <div className="flex justify-center py-12"><FaSpinner className="animate-spin text-2xl text-[#0061FF]/40" /></div>
              ) : chatList.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center mx-auto mb-4 border border-gray-100 dark:border-white/5">
                    <FaComment className="text-gray-300 dark:text-gray-600" />
                  </div>
                  <p className="text-xs font-medium text-gray-500">No session history retained.</p>
                </div>
              ) : (
                chatList.map((chat) => (
                  <div
                    key={chat._id}
                    onClick={() => loadChat(chat._id)}
                    className={`group relative p-4 rounded-2xl cursor-pointer transition-all border ${
                      currentChatId === chat._id
                        ? 'bg-[#f8f9fa] dark:bg-white/[0.04] border-gray-200 dark:border-white/10 shadow-sm'
                        : 'bg-transparent border-transparent hover:bg-gray-50 dark:hover:bg-white/[0.02]'
                    }`}
                  >
                    <div className="pr-8">
                      <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-2 leading-snug break-words">
                        {chat.title}
                      </p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-2">
                        {new Date(chat.updatedAt).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    
                    <button
                      onClick={(e) => deleteChatSession(chat._id, e)}
                      className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all transform scale-90 group-hover:scale-100"
                    >
                      <FaTrash className="text-[10px]" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

export default AskAI;
