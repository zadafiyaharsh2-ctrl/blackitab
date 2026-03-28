import { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import useAskAIChat from '../../hooks/useAskAIChat';
import usePageTitle from '../../hooks/usePageTitle';
import { FaExclamationCircle, FaTimes, FaPlus, FaSpinner, FaHistory } from 'react-icons/fa';
import { Sparkles, Send } from 'lucide-react';
import SimpleConfirmationModal from '../../components/shared/SimpleConfirmationModal';
import AIChatFeed from '../../components/student/pages/askAI/AIChatFeed';
import AIHistorySidebar from '../../components/student/pages/askAI/AIHistorySidebar';

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
    isOpen: false, action: null, id: null, title: '', message: ''
  });

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleClearHistory = () => {
    setConfirmState({
      isOpen: true, action: clearAllHistory, id: 'clear',
      title: 'Clear All History', message: 'Are you sure you want to clear all chat history?'
    });
  };

  const sampleQuestions = [
    "What is a database?",
    "Explain normalization in DBMS",
    "What are SQL joins?",
    "How do indexes work?"
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-3rem)] bg-[#f8f9fa] dark:bg-[#05000a] font-sans selection:bg-[#0061FF]/20 selection:text-gray-900 transition-colors">
      <SimpleConfirmationModal 
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState({ ...confirmState, isOpen: false, id: null, action: null })}
        onConfirm={() => { if (confirmState.action) confirmState.action(); setConfirmState({ ...confirmState, isOpen: false, id: null, action: null }); }}
        title={confirmState.title} message={confirmState.message} confirmText="Confirm Action" isDanger={true}
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
            <button onClick={createNewChat} className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-gray-200 dark:border-white/10 text-[11px] font-bold uppercase tracking-widest text-[#0061FF] dark:text-[#a5c3ff] hover:bg-[#0061FF]/5 transition-all">
              <FaPlus /> New Session
            </button>
          )}
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all ${
              showHistory ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-md' : 'bg-white dark:bg-black border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:shadow-sm'
            }`}
          >
            <FaHistory className="text-[10px]" /> {showHistory ? "Hide History" : "Chats"}
          </button>
        </div>
      </header>

      {/* Layout Split */}
      <div className="flex-1 flex overflow-hidden">
        <main className={`flex-1 flex flex-col relative ${showHistory ? 'hidden md:flex' : 'flex'}`}>
          <AIChatFeed messages={messages} isLoading={isLoading} chatEndRef={chatEndRef} sampleQuestions={sampleQuestions} setInput={setInput} />

          {/* Input Area */}
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
                  <input ref={inputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Message Copilot..." disabled={isLoading} className="flex-1 px-6 py-4 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 font-medium text-[15px] outline-none disabled:opacity-50" />
                  <button type="submit" disabled={isLoading || !input.trim()} className="inline-flex items-center justify-center w-12 h-12 bg-[#0061FF] hover:bg-[#004bcc] text-white rounded-full transition-all duration-300 disabled:opacity-40 disabled:hover:bg-[#0061FF] shrink-0 hover:shadow-md hover:-translate-y-0.5">
                    {isLoading ? <FaSpinner className="animate-spin text-lg" /> : <Send className="w-5 h-5 ml-0.5" />}
                  </button>
                </div>
              </form>
              <div className="text-center mt-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">AI-generated content can contain inaccuracies. Verify critical outputs.</p>
              </div>
            </div>
          </div>
        </main>

        <AIHistorySidebar showHistory={showHistory} setShowHistory={setShowHistory} chatList={chatList} currentChatId={currentChatId} loadingHistory={loadingHistory} loadChat={loadChat} createNewChat={createNewChat} deleteChatSession={deleteChatSession} handleClearHistory={handleClearHistory} />
      </div>
    </div>
  );
};

export default AskAI;
