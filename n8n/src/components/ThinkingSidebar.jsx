import React, { useState } from 'react';
import { X, Database, Search, CheckCircle, Code, Brain, Download } from 'lucide-react';
import { generateChatPDF } from '../utils/pdfGenerator';
import PDFProgressModal from './PDFProgressModal';

const ThinkingSidebar = ({ isOpen, onClose, thinkingSteps }) => {
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [pdfProgress, setPdfProgress] = useState(0);
  const [pdfMessage, setPdfMessage] = useState('');

  const getToolIcon = (toolName) => {
    switch (toolName) {
      case 'query-sql':
        return <Database className="w-4 h-4" />;
      case 'list-tables-sql':
        return <Search className="w-4 h-4" />;
      case 'info-sql':
        return <Code className="w-4 h-4" />;
      case 'query-checker':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Brain className="w-4 h-4" />;
    }
  };

  const getToolColor = (toolName) => {
    switch (toolName) {
      case 'query-sql':
        return 'bg-blue-50 text-pr-blue-medium border-pr-blue-light';
      case 'list-tables-sql':
        return 'bg-green-50 text-green-700 border-green-300';
      case 'info-sql':
        return 'bg-purple-50 text-purple-700 border-purple-300';
      case 'query-checker':
        return 'bg-orange-50 text-orange-700 border-orange-300';
      default:
        return 'bg-gray-50 text-text-secondary border-gray-300';
    }
  };

  const formatLogContent = (log) => {
    if (!log) return '';
    
    // Split by common patterns to make it more readable
    const parts = log.split(/(?=Question:|Thought:|Action:|Action Input:)/);
    
    return parts.map((part, index) => {
      if (part.startsWith('Question:')) {
        return (
          <div key={index} className="mb-2">
            <span className="font-semibold text-pr-blue-medium">Question:</span>
            <span className="ml-1">{part.replace('Question:', '').trim()}</span>
          </div>
        );
      } else if (part.startsWith('Thought:')) {
        return (
          <div key={index} className="mb-2">
            <span className="font-semibold text-green-600">Thought:</span>
            <span className="ml-1">{part.replace('Thought:', '').trim()}</span>
          </div>
        );
      } else if (part.startsWith('Action:')) {
        return (
          <div key={index} className="mb-2">
            <span className="font-semibold text-purple-600">Action:</span>
            <span className="ml-1">{part.replace('Action:', '').trim()}</span>
          </div>
        );
      } else if (part.startsWith('Action Input:')) {
        return (
          <div key={index} className="mb-2">
            <span className="font-semibold text-orange-600">Action Input:</span>
            <span className="ml-1">{part.replace('Action Input:', '').trim()}</span>
          </div>
        );
      } else if (part.trim()) {
        return (
          <div key={index} className="mb-2 text-text-secondary">
            {part.trim()}
          </div>
        );
      }
      return null;
    }).filter(Boolean);
  };

  const formatObservation = (observation) => {
    if (!observation) return 'No observation';
    
    try {
      // Try to parse as JSON for better formatting
      const parsed = JSON.parse(observation);
      return JSON.stringify(parsed, null, 2);
    } catch {
      // If not JSON, return as is
      return observation;
    }
  };

  const handleExportPDF = async () => {
    if (!thinkingSteps || thinkingSteps.length === 0) return;
    
    try {
      setIsPdfGenerating(true);
      setPdfProgress(0);
      setPdfMessage('Preparing thinking process...');
      
      // Convert thinking steps to a format suitable for PDF generation
      const messages = thinkingSteps.map((step, index) => ({
        id: index,
        type: 'assistant',
        content: `Step ${index + 1}: ${step.tool || 'Step'}\n\n${step.log}\n\n${step.toolInput ? `Input: ${JSON.stringify(step.toolInput, null, 2)}` : ''}`,
        timestamp: new Date().toISOString()
      }));
      
      await generateChatPDF(
        messages, 
        'N8N Thinking Process',
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



  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-sidebar-bg border-l border-chat-border shadow-lg z-50 animate-slide-in flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-chat-border bg-pr-blue-dark flex-shrink-0">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-pr-blue-light" />
          <h2 className="text-lg font-semibold text-pr-white">Thinking Process</h2>
        </div>
        <div className="flex items-center gap-2">
          {thinkingSteps && thinkingSteps.length > 0 && (
            <button
              onClick={handleExportPDF}
              className="px-2 py-1 text-xs bg-pr-blue-light text-pr-white rounded hover:bg-pr-blue-medium transition-colors flex items-center gap-1"
              title="Export as PDF"
            >
              <Download size={14} />
              PDF
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 hover:bg-pr-blue-medium rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-pr-blue-light" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {thinkingSteps.length === 0 ? (
          <div className="text-center py-8 text-text-secondary">
            <Brain className="w-12 h-12 mx-auto mb-3 text-pr-blue-light" />
            <p>No thinking process available</p>
            <p className="text-sm mt-1">Send a message to see the AI's reasoning</p>
          </div>
        ) : (
          thinkingSteps.map((step, index) => (
            <div key={step.id} className="bg-pr-white rounded-lg border border-chat-border p-4 shadow-sm">
              {/* Step Header */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="bg-pr-blue-light text-pr-white text-xs font-medium px-2 py-1 rounded-full">
                    Step {step.id}
                  </span>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getToolColor(step.tool)}`}>
                    {getToolIcon(step.tool)}
                    {step.tool}
                  </div>
                </div>
              </div>

              {/* Tool Input */}
              {step.toolInput && (
                <div className="mb-3">
                  <h4 className="text-sm font-medium text-text-primary mb-1">Tool Input:</h4>
                  <div className="bg-thinking-bg rounded-md p-2 text-sm font-mono text-text-secondary overflow-x-auto">
                    {step.toolInput}
                  </div>
                </div>
              )}

              {/* Log/Reasoning */}
              {step.log && (
                <div className="mb-3">
                  <h4 className="text-sm font-medium text-text-primary mb-1">Reasoning:</h4>
                  <div className="bg-thinking-bg rounded-md p-3 text-sm text-text-secondary">
                    {formatLogContent(step.log)}
                  </div>
                </div>
              )}

              {/* Observation */}
              {step.observation && (
                <div>
                  <h4 className="text-sm font-medium text-text-primary mb-1">Result:</h4>
                  <div className="bg-green-50 rounded-md p-2 text-sm text-text-secondary max-h-32 overflow-y-auto">
                    <pre className="whitespace-pre-wrap font-mono text-xs">
                      {formatObservation(step.observation)}
                    </pre>
                  </div>
                </div>
              )}

              {/* Timestamp */}
              <div className="text-xs text-text-secondary mt-2 pt-2 border-t border-chat-border">
                {new Date(step.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-chat-border bg-pr-white flex-shrink-0">
        <div className="text-xs text-text-secondary text-center">
          {thinkingSteps.length} step{thinkingSteps.length !== 1 ? 's' : ''} in reasoning process
        </div>
      </div>
      {isPdfGenerating && (
        <PDFProgressModal
          open={isPdfGenerating}
          progress={pdfProgress}
          message={pdfMessage}
          onClose={() => setIsPdfGenerating(false)}
        />
      )}
    </div>
  );
};

export default ThinkingSidebar; 