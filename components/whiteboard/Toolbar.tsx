'use client';

import React from 'react';
import { Hand, MousePointer2, Square, Circle, Type, Minus, Triangle, ArrowRight, Pencil, Image as ImageIcon, Eraser, Diamond, Trash2, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/app/contexts/ThemeContext';

export type Tool = 'hand' | 'select' | 'rectangle' | 'diamond' | 'triangle' | 'circle' | 'arrow' | 'line' | 'pencil' | 'text' | 'image' | 'eraser';

interface ToolbarProps {
  activeTool: Tool;
  setActiveTool: (tool: Tool) => void;
  onClearCanvas: () => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const tools: { id: Tool; icon: React.ReactNode; label: string; isAction?: boolean }[] = [
  { id: 'hand', icon: <Hand size={18} />, label: 'Pan' },
  { id: 'select', icon: <MousePointer2 size={18} />, label: 'Select' },
  { id: 'rectangle', icon: <Square size={18} />, label: 'Rectangle' },
  { id: 'diamond', icon: <Diamond size={18} />, label: 'Diamond' },
  { id: 'triangle', icon: <Triangle size={18} />, label: 'Triangle' },
  { id: 'circle', icon: <Circle size={18} />, label: 'Circle' },
  { id: 'arrow', icon: <ArrowRight size={18} />, label: 'Arrow' },
  { id: 'line', icon: <Minus size={18} />, label: 'Line' },
  { id: 'pencil', icon: <Pencil size={18} />, label: 'Pencil' },
  { id: 'text', icon: <Type size={18} />, label: 'Text' },
  { id: 'image', icon: <ImageIcon size={18} />, label: 'Image' },
  { id: 'eraser', icon: <Eraser size={18} />, label: 'Eraser' },
];

export const Toolbar: React.FC<ToolbarProps> = ({ 
  activeTool, 
  setActiveTool, 
  onClearCanvas, 
  onImageUpload
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { resolvedTheme, setTheme } = useTheme();

  const handleThemeToggle = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  const handleClick = (toolId: Tool) => {
    if (toolId === 'image') {
      fileInputRef.current?.click();
    } else {
      setActiveTool(toolId);
    }
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-white dark:bg-[#1C1C1C] border border-gray-200 dark:border-neutral-800 rounded-lg shadow-lg p-1 flex gap-1 z-50 overflow-x-auto max-w-[95vw] items-center">
      {tools.map((tool) => (
        <button
          key={tool.id}
          onClick={() => handleClick(tool.id)}
          className={`p-2 rounded-md transition-colors flex-shrink-0 ${
            activeTool === tool.id && !tool.isAction
              ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
              : tool.isAction 
                ? 'hover:bg-red-50 dark:hover:bg-red-900/30 text-gray-600 dark:text-neutral-400 hover:text-red-500 dark:hover:text-red-400'
                : 'hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-600 dark:text-neutral-300'
          }`}
          title={tool.label}
        >
          {tool.icon}
        </button>
      ))}

      <div className="flex gap-1 border-l border-gray-200 dark:border-neutral-700 pl-1 ml-1">
        <button
          onClick={handleThemeToggle}
          className="p-2 rounded-md transition-colors text-gray-600 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800"
          title={resolvedTheme === 'dark' ? 'Light mode' : 'Dark mode'}
        >
          {resolvedTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button
          onClick={onClearCanvas}
          className="p-2 rounded-md transition-colors text-gray-600 dark:text-neutral-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-500 dark:hover:text-red-400"
          title="Clear Canvas"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={onImageUpload}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
};
