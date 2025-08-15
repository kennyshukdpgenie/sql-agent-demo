import React from 'react';
import { X } from 'lucide-react';

const ThinkingSidebar = ({ isOpen, onClose, thinkingSteps }) => {
  if (!isOpen) return null;

  return (
    <div 
      className={`fixed top-0 right-0 h-full w-full max-w-2xl md:w-1/2 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-semibold">Thinking Process</h2>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200">
          <X size={20} />
        </button>
      </div>
      <div className="p-4 overflow-y-auto h-full">
        {thinkingSteps && thinkingSteps.length > 0 ? (
          <ul className="space-y-4">
            {thinkingSteps.map((step, index) => (
              <li key={index} className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mr-4">
                  {index + 1}
                </div>
                <div>
                  <h3 className="font-semibold">{step.tool}</h3>
                  <p className="text-sm text-gray-600">{step.log}</p>
                  {step.toolInput && (
                    <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                      <strong>Input:</strong>
                      <pre className="whitespace-pre-wrap break-all">
                        {JSON.stringify(step.toolInput, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No thinking steps to display.</p>
        )}
      </div>
    </div>
  );
};

export default ThinkingSidebar; 