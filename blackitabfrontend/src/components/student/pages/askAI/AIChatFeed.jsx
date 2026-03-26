import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { FaExclamationCircle, FaSpinner } from 'react-icons/fa';
import { Sparkles, Zap } from 'lucide-react';

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

const AIChatFeed = ({ messages, isLoading, chatEndRef, sampleQuestions, setInput }) => {
  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-12 lg:px-24 py-10 scroll-smooth custom-scrollbar">
      <div className="max-w-4xl mx-auto space-y-12 pb-8">
        {messages.length === 1 ? (
          /* Welcome/Empty State */
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
                    <span className="text-sm font-bold text-gray-800 dark:text-gray-200 group-hover:text-[#0061FF] dark:group-hover:text-[#a5c3ff] transition-colors pr-6">{q}</span>
                    <div className="w-8 h-8 rounded-full border border-gray-100 dark:border-white/10 flex items-center justify-center text-gray-300 dark:text-gray-600 group-hover:bg-[#0061FF]/10 group-hover:text-[#0061FF] transition-all">
                      <Zap className="w-3 h-3" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Chat Messages */
          messages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            if (!msg.content) return null;
            return (
              <div key={idx} className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-500`}>
                <div className={`flex gap-6 max-w-[85%] md:max-w-[75%] ${isUser ? 'flex-row-reverse' : ''}`}>
                  {!isUser && (
                    <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center border border-gray-200 dark:border-white/10 bg-white dark:bg-black shadow-sm mt-1">
                      {msg.isError ? <FaExclamationCircle className="text-red-500" /> : <Sparkles className="w-4 h-4 text-[#0061FF] dark:text-[#a5c3ff]" />}
                    </div>
                  )}
                  <div className={`group relative rounded-[2rem] px-8 py-6 text-[15px] leading-relaxed shadow-sm ${
                    isUser ? 'bg-[#0061FF] text-white rounded-tr-none'
                      : msg.isError ? 'bg-red-50 dark:bg-red-500/10 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-500/20 rounded-tl-none'
                      : 'bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 text-gray-800 dark:text-gray-200 rounded-tl-none'
                  }`}>
                    {isUser ? (
                      <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                    ) : (
                      <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:my-4 prose-pre:bg-gray-50 dark:prose-pre:bg-[#05000a] prose-pre:border prose-pre:border-gray-200 dark:prose-pre:border-white/5 prose-pre:rounded-2xl">
                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>{msg.content}</ReactMarkdown>
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
  );
};

export default AIChatFeed;
