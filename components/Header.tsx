import React from 'react';
import { Sparkles, Image as ImageIcon } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="w-full py-6 px-4 md:px-8 border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">ClearView AI</h1>
            <p className="text-xs text-gray-500 font-medium">智能水印移除工具</p>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-4 text-sm font-medium text-gray-600">
          <div className="flex items-center gap-1">
            <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs">Gemini 2.5 Flash</span>
          </div>
        </div>
      </div>
    </header>
  );
};