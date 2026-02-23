import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/useTheme';
import API_URL from '../config';
import usePageTitle from '../hooks/usePageTitle';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
  FaPaperPlane,
  FaRobot,
  FaUser,
  FaHistory,
  FaTrash,
  FaSpinner,
  FaExclamationCircle,
  FaLightbulb,
  FaTimes,
  FaComment
} from 'react-icons/fa';

const AskAI = () => {
  usePageTitle('Ask AI');
  const { isDark } = useTheme();

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I\'m your AI learning assistant. Ask me anything about your studies, and I\'ll help you understand concepts better. 🎓'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  const getToken = () => localStorage.getItem('token');

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Fetch conversation-thread history on mount (BlackBookEDU.ai style)
  useEffect(() => {
    fetchChatHistory();
    fetchHistory();
  }, []);

  // Fetch conversation-thread (BlackBookEDU.ai style)
  const fetchChatHistory = async () => {
    try {
      const response = await fetch(`${API_URL}/api/ai/chat-history`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.ok && data.messages && data.messages.length > 0) {
          const formattedMessages = data.messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }));
          setMessages(formattedMessages);
        }
      }
    } catch (err) {
      console.error('Failed to load chat history:', err);
    }
  };

  // Fetch individual Q&A history for sidebar
  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const response = await fetch(`${API_URL}/api/ai/history?limit=20`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setHistory(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Send message using BlackBookEDU.ai-style /query endpoint
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/ai/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          query: currentInput
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get response');
      }

      const aiResponse = {
        role: 'assistant',
        content: data.aiResponse?.content || 'No response content'
      };

      setMessages(prev => [...prev, aiResponse]);
      fetchHistory();

    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '❌ Sorry, I encountered an error. Please try again.',
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFromHistory = (item) => {
    setMessages([
      { role: 'user', content: item.question },
      { role: 'assistant', content: item.answer }
    ]);
    setShowHistory(false);
  };

  const deleteHistoryItem = async (id, e) => {
    e.stopPropagation();
    try {
      await fetch(`${API_URL}/api/ai/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });
      setHistory(prev => prev.filter(item => item._id !== id));
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const clearAllHistory = async () => {
    if (!window.confirm('Are you sure you want to clear all history?')) return;

    try {
      await fetch(`${API_URL}/api/ai/history/clear`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });
      setHistory([]);
      setMessages([
        {
          role: 'assistant',
          content: 'Hello! I\'m your AI learning assistant. Ask me anything about your studies, and I\'ll help you understand concepts better. 🎓'
        }
      ]);
    } catch (err) {
      console.error('Failed to clear history:', err);
    }
  };

  const sampleQuestions = [
    "What is a database?",
    "Explain normalization in DBMS",
    "What are SQL joins?",
    "How do indexes work?"
  ];

  // Markdown components for rendering AI responses (BlackBookEDU.ai style)
  const markdownComponents = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <SyntaxHighlighter
          style={vscDarkPlus}
          language={match[1]}
          PreTag="div"
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code className={`${className || ''} ${isDark ? 'bg-gray-700' : 'bg-gray-200'} px-1 rounded text-sm`} {...props}>
          {children}
        </code>
      );
    },
    h1: ({ children }) => <h1 className={`text-2xl font-bold my-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{children}</h1>,
    h2: ({ children }) => <h2 className={`text-xl font-bold my-2 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>{children}</h2>,
    h3: ({ children }) => <h3 className={`text-lg font-bold my-1 ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>{children}</h3>,
    ul: ({ children }) => <ul className="list-disc list-inside my-2 space-y-1">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal list-inside my-2 space-y-1">{children}</ol>,
    p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
    a: ({ children, href }) => <a href={href} className={`${isDark ? 'text-blue-400' : 'text-blue-600'} hover:underline`} target="_blank" rel="noreferrer">{children}</a>,
    blockquote: ({ children }) => <blockquote className={`border-l-4 ${isDark ? 'border-gray-500 text-gray-600 dark:text-gray-400' : 'border-gray-400 text-gray-600'} pl-3 my-2 italic`}>{children}</blockquote>,
    table: ({ children }) => <div className="overflow-x-auto my-2"><table className={`min-w-full border ${isDark ? 'border-gray-600' : 'border-gray-300'}`}>{children}</table></div>,
    th: ({ children }) => <th className={`px-3 py-2 text-left font-semibold border-b ${isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-100'}`}>{children}</th>,
    td: ({ children }) => <td className={`px-3 py-2 border-b ${isDark ? 'border-gray-300 dark:border-gray-700' : 'border-gray-200'}`}>{children}</td>,
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-white dark:bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-6xl mx-auto h-[calc(100vh-3rem)] flex flex-col">

        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-200 dark:border-gray-800' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 shadow-lg`}>
              <FaRobot className="text-2xl text-gray-900 dark:text-white" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${isDark ? 'text-gray-900 dark:text-white' : 'text-gray-900'}`}>
                Ask AI
              </h1>
              <p className={`text-sm ${isDark ? 'text-gray-600 dark:text-gray-400' : 'text-gray-600'}`}>
                Your intelligent study companion
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${showHistory
              ? 'bg-purple-600 text-gray-900 dark:text-white'
              : isDark
                ? 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            <FaHistory />
            <span className="hidden sm:inline">History</span>
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">

          {/* Chat Area */}
          <div className={`flex-1 flex flex-col ${showHistory ? 'hidden md:flex' : 'flex'}`}>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    {/* Avatar */}
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === 'user'
                      ? 'bg-blue-600'
                      : msg.isError
                        ? 'bg-red-600'
                        : 'bg-gradient-to-br from-purple-500 to-blue-600'
                      }`}>
                      {msg.role === 'user' ? (
                        <FaUser className="text-gray-900 dark:text-white text-sm" />
                      ) : (
                        <FaRobot className="text-gray-900 dark:text-white text-sm" />
                      )}
                    </div>

                    {/* Message Bubble */}
                    <div className={`p-4 rounded-2xl ${msg.role === 'user'
                      ? 'bg-blue-600 text-gray-900 dark:text-white rounded-tr-none'
                      : msg.isError
                        ? isDark
                          ? 'bg-red-900/50 text-red-200 border border-red-800 rounded-tl-none'
                          : 'bg-red-50 text-red-800 border border-red-200 rounded-tl-none'
                        : isDark
                          ? 'bg-gray-50 dark:bg-gray-800 text-gray-200 border border-gray-300 dark:border-gray-700 rounded-tl-none'
                          : 'bg-white text-gray-800 border border-gray-200 shadow-sm rounded-tl-none'
                      }`}>
                      {msg.role === 'user' ? (
                        <p className="whitespace-pre-wrap break-words leading-relaxed">
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
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                      <FaRobot className="text-gray-900 dark:text-white text-sm animate-pulse" />
                    </div>
                    <div className={`p-4 rounded-2xl rounded-tl-none ${isDark ? 'bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700' : 'bg-white border border-gray-200'}`}>
                      <div className="flex items-center gap-2">
                        <FaSpinner className={`animate-spin ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                        <span className={isDark ? 'text-gray-600 dark:text-gray-400' : 'text-gray-600'}>AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Sample questions for empty state */}
              {messages.length === 1 && (
                <div className={`mt-8 p-6 rounded-2xl ${isDark ? 'bg-gray-50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700' : 'bg-white border border-gray-200'}`}>
                  <div className="flex items-center gap-2 mb-4">
                    <FaLightbulb className={isDark ? 'text-yellow-400' : 'text-yellow-600'} />
                    <span className={`font-semibold ${isDark ? 'text-gray-900 dark:text-white' : 'text-gray-900'}`}>
                      Try asking...
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {sampleQuestions.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => setInput(q)}
                        className={`p-3 text-left rounded-lg transition-all ${isDark
                          ? 'bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                          : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                          }`}
                      >
                        "{q}"
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className={`p-4 border-t ${isDark ? 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/80' : 'border-gray-200 bg-white'}`}>
              {error && (
                <div className={`mb-3 p-3 rounded-lg flex items-center gap-2 ${isDark ? 'bg-red-900/30 text-red-300' : 'bg-red-50 text-red-700'}`}>
                  <FaExclamationCircle />
                  <span className="text-sm">{error}</span>
                  <button onClick={() => setError(null)} className="ml-auto">
                    <FaTimes />
                  </button>
                </div>
              )}

              <div className="flex gap-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything about your studies..."
                  disabled={isLoading}
                  className={`flex-1 px-4 py-3 rounded-xl border transition-all focus:ring-2 focus:ring-purple-500 focus:outline-none ${isDark
                    ? 'bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500'
                    : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
                    } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${isLoading || !input.trim()
                    ? 'bg-gray-600 cursor-not-allowed opacity-50'
                    : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-gray-900 dark:text-white shadow-lg hover:shadow-xl'
                    }`}
                >
                  {isLoading ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
                  <span className="hidden sm:inline">Send</span>
                </button>
              </div>
            </form>
          </div>

          {/* History Sidebar */}
          {showHistory && (
            <div className={`w-full md:w-80 flex flex-col border-l ${isDark ? 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900' : 'border-gray-200 bg-white'}`}>
              <div className={`p-4 border-b ${isDark ? 'border-gray-200 dark:border-gray-800' : 'border-gray-200'} flex items-center justify-between`}>
                <h3 className={`font-semibold ${isDark ? 'text-gray-900 dark:text-white' : 'text-gray-900'}`}>
                  Chat History
                </h3>
                <div className="flex items-center gap-2">
                  {history.length > 0 && (
                    <button
                      onClick={clearAllHistory}
                      className={`text-xs px-2 py-1 rounded ${isDark ? 'text-red-400 hover:bg-red-900/30' : 'text-red-600 hover:bg-red-50'}`}
                    >
                      Clear All
                    </button>
                  )}
                  <button
                    onClick={() => setShowHistory(false)}
                    className="md:hidden p-1"
                  >
                    <FaTimes className={isDark ? 'text-gray-600 dark:text-gray-400' : 'text-gray-600'} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {loadingHistory ? (
                  <div className="flex items-center justify-center py-8">
                    <FaSpinner className={`animate-spin text-2xl ${isDark ? 'text-gray-600' : 'text-gray-600 dark:text-gray-400'}`} />
                  </div>
                ) : history.length === 0 ? (
                  <div className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-600 dark:text-gray-400'}`}>
                    <FaComment className="text-3xl mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No history yet</p>
                    <p className="text-xs">Your Q&A will appear here</p>
                  </div>
                ) : (
                  history.map((item) => (
                    <div
                      key={item._id}
                      onClick={() => loadFromHistory(item)}
                      className={`p-3 rounded-lg cursor-pointer group transition-all ${isDark
                        ? 'bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700'
                        : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                        }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-medium line-clamp-2 ${isDark ? 'text-gray-900 dark:text-white' : 'text-gray-900'}`}>
                          {item.question}
                        </p>
                        <button
                          onClick={(e) => deleteHistoryItem(item._id, e)}
                          className={`opacity-0 group-hover:opacity-100 p-1 rounded transition-all ${isDark ? 'hover:bg-red-900/30 text-red-400' : 'hover:bg-red-50 text-red-500'
                            }`}
                        >
                          <FaTrash className="text-xs" />
                        </button>
                      </div>
                      <p className={`text-xs mt-1 line-clamp-1 ${isDark ? 'text-gray-500' : 'text-gray-600 dark:text-gray-400'}`}>
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AskAI;