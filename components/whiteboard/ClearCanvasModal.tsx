'use client';

import React from 'react';
import { X } from 'lucide-react';

interface ClearCanvasModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ClearCanvasModal({ isOpen, onClose, onConfirm }: ClearCanvasModalProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white dark:bg-[#1C1C1C] rounded-xl shadow-2xl w-full max-w-137.5 mx-4 border border-neutral-200 dark:border-neutral-800">
     
        <div className="p-6">
          <div className="flex items-center justify-between border-b border-[#ebebeb] pb-4">
            <h2 className="text-lg font-semibold text-[#1b1b1f] dark:text-white">Clear canvas</h2>
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 pt-4">
            This will clear the whole canvas. Are you sure?
          </p>
        </div>
        <div className="flex items-center justify-end gap-2 p-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
