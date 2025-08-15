import React, { useState, useRef, useEffect } from 'react';
import { Send, Download, Copy, Trash2, Loader2, Brain, Check } from 'lucide-react';
import ApiService from '../services/api';
import ThinkingSidebar from './ThinkingSidebar';
import { generateChatPDF } from '../utils/pdfGenerator';
import PDFProgressModal from './PDFProgressModal';

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentThinkingSteps, setCurrentThinkingSteps] = useState([]);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [pdfProgress, setPdfProgress] = useState(0);
  const [pdfMessage, setPdfMessage] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await ApiService.sendMessage(inputMessage);
      
      if (response.success) {
        const assistantMessage = {
          id: Date.now() + 1,
          type: 'assistant',
          content: response.isGraph ? response.result : response.result,
          timestamp: new Date().toISOString(),
          isGraph: response.isGraph || false,
          thinkingSteps: response.steps || [] // Store thinking steps but don't auto-open
        };

        setMessages(prev => [...prev, assistantMessage]);

        // Don't automatically open thinking process - let user click button
      } else {
        const errorMessage = {
          id: Date.now() + 1,
          type: 'error',
          content: response.message || 'An error occurred while processing your request.',
          timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        type: 'error',
        content: 'Sorry, there was an error processing your request. Please try again.',
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const showThinkingProcess = (steps) => {
    setCurrentThinkingSteps(ApiService.parseThinkingSteps(steps));
    setIsSidebarOpen(true);
  };

  const handleExportPDF = async () => {
    if (messages.length === 0) return;
    
    try {
      setIsPdfGenerating(true);
      setPdfProgress(0);
      setPdfMessage('Preparing chat history...');
      
      await generateChatPDF(
        messages, 
        'N8N Chat History',
        (progress, message) => {
          setPdfProgress(progress);
          setPdfMessage(message);
        }
      );
      
      // Close progress modal after a short delay
      setTimeout(() => {
        setIsPdfGenerating(false);
        setPdfProgress(0);
        setPdfMessage('');
      }, 1000);
      
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Failed to generate PDF. Please try again.');
      setIsPdfGenerating(false);
      setPdfProgress(0);
      setPdfMessage('');
    }
  };

  const [copiedMessageId, setCopiedMessageId] = useState(null);

  const handleCopyMessage = async (content, messageId) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      // Reset the icon after 2 seconds
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (error) {
      console.error('Failed to copy message:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = content;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    }
  };

  const handleDeleteMessage = (messageId) => {
    setMessages(prev => prev.filter(message => message.id !== messageId));
  };



  return (
    <div className="flex h-screen bg-chat-bg">
      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'mr-96' : ''}`}>
        {/* Header */}
        <div className="bg-pr-blue-dark border-b border-chat-border px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <img 
              src="/logo.png" 
              alt="Pernod Ricard Logo" 
              className="h-10 w-auto"
            />
            <div>
              <h1 className="text-xl font-bold text-pr-white">Pernod Ricard Sql Agent Demo</h1>
              <p className="text-sm text-pr-blue-light">AI-powered SQL query assistant</p>
            </div>
          </div>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-pr-blue-medium rounded-lg transition-colors"
            title="Toggle thinking process"
          >
            <Brain className="w-5 h-5 text-pr-blue-light" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="text-text-primary text-lg mb-2 font-semibold">Welcome to Pernod Ricard SQL Agent</div>
              <div className="text-text-secondary text-sm">Ask me anything about your data in Chinese or English</div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`px-4 py-3 rounded-lg shadow-sm relative group ${
                  message.type === 'user'
                    ? 'bg-pr-blue-medium text-pr-white max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl'
                    : message.type === 'error'
                    ? 'bg-red-50 text-red-800 border border-red-200 max-w-3xl'
                    : 'bg-pr-white text-text-primary border border-chat-border max-w-3xl'
                }`}
              >
                {/* Action buttons - visible on hover */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <button
                    onClick={() => handleCopyMessage(message.content, message.id)}
                    className="p-1 rounded hover:bg-black hover:bg-opacity-10 transition-colors"
                    title="Copy message"
                  >
                    {copiedMessageId === message.id ? (
                      <Check className="w-3 h-3 text-green-500" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDeleteMessage(message.id)}
                    className="p-1 rounded hover:bg-red-500 hover:bg-opacity-20 transition-colors"
                    title="Delete message"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>

                {message.isGraph ? (
                  <img src={message.content} alt="Chart" className="max-w-full h-auto" />
                ) : (
                  <div className="whitespace-pre-wrap">{message.content}</div>
                )}
                
                {message.type === 'assistant' && !message.isGraph && message.thinkingSteps && message.thinkingSteps.length > 0 && (
                  <button
                    onClick={() => showThinkingProcess(message.thinkingSteps)}
                    className="mt-2 text-xs text-pr-blue-light hover:text-pr-blue-medium flex items-center gap-1 transition-colors"
                  >
                    <Brain className="w-3 h-3" />
                    View thinking process
                  </button>
                )}
                
                <div className="text-xs opacity-70 mt-1">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-pr-white border border-chat-border rounded-lg px-4 py-3 flex items-center gap-2 shadow-sm">
                <Loader2 className="w-4 h-4 animate-spin text-pr-blue-medium" />
                <span className="text-text-secondary">Thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-pr-white border-t border-chat-border px-6 py-4 shadow-sm">
          {/* Export Button */}
          {messages.length > 0 && (
            <div className="flex justify-end gap-2 mb-3">
              <button
                onClick={handleExportPDF}
                disabled={isLoading}
                className="px-3 py-2 text-sm bg-pr-blue-medium text-pr-white rounded-lg hover:bg-pr-blue-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md flex items-center gap-2"
                title="Export as PDF"
              >
                <Download className="w-4 h-4" />
                Export PDF
              </button>
            </div>
          )}
          
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about your data... (支持中文)"
                className="w-full px-4 py-3 border border-chat-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-pr-blue-light focus:border-pr-blue-light transition-all"
                rows="1"
                style={{ minHeight: '48px', maxHeight: '120px' }}
                disabled={isLoading}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="p-3 bg-pr-blue-medium text-pr-white rounded-lg hover:bg-pr-blue-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Thinking Process Sidebar */}
      <ThinkingSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        thinkingSteps={currentThinkingSteps}
      />

      {/* PDF Progress Modal */}
      <PDFProgressModal
        open={isPdfGenerating}
        progress={pdfProgress}
        message={pdfMessage}
        onClose={() => setIsPdfGenerating(false)}
      />
    </div>
  );
};

export default ChatInterface; 