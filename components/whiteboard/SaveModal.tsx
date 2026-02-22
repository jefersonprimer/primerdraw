'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { saveToFile, generateDefaultFileName, getShareableLink } from '@/lib/fileService';
import { WhiteboardElement } from '@/lib/db';
import { ShareLinkModal } from './ShareLinkModal';

interface SaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  elements: WhiteboardElement[];
}

export function SaveModal({ isOpen, onClose, elements }: SaveModalProps) {
  const [filename, setFilename] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [shareLinkModalOpen, setShareLinkModalOpen] = useState(false);
  const [shareLink, setShareLink] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFilename(generateDefaultFileName());
    }
  }, [isOpen]);

  const handleSave = async () => {
    if (!filename.trim()) {
      alert('Please enter a file name');
      return;
    }

    setIsSaving(true);
    try {
      await saveToFile(elements, filename.trim());
      onClose();
    } catch (error) {
      alert(`Failed to save file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportToLink = () => {
    setShareLink(getShareableLink(elements));
    setShareLinkModalOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[200] flex items-center justify-center">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white dark:bg-[#1C1C1C] rounded-xl shadow-2xl w-full max-w-md mx-4 border border-neutral-200 dark:border-neutral-800 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800">
            <h2 className="text-lg font-semibold text-[#1b1b1f] dark:text-white">Save to</h2>
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6 space-y-8">
            {/* Save to disk */}
            <section className="space-y-4">
              <h3 className="text-sm font-semibold text-[#1b1b1f] dark:text-white">Save to disk</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Export the scene data to a file from which you can import later.
              </p>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#1b1b1f] dark:text-white">
                  File name:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={filename}
                    onChange={(e) => setFilename(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md text-sm text-[#1b1b1f] dark:text-white bg-white dark:bg-neutral-800 outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                    placeholder="Enter file name"
                    autoFocus
                  />
                  <span className="text-sm text-neutral-500 dark:text-neutral-400">.pwb</span>
                </div>
              </div>
              <button
                onClick={handleSave}
                disabled={isSaving || !filename.trim()}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving...' : 'Save to file'}
              </button>
            </section>

            {/* Shareable link */}
            <section className="space-y-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
              <h3 className="text-sm font-semibold text-[#1b1b1f] dark:text-white">Shareable link</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Export as a read-only link.
              </p>
              <button
                onClick={handleExportToLink}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-md transition-colors"
              >
                Export to link
              </button>
            </section>
          </div>

          <div className="flex items-center justify-end gap-2 p-4 border-t border-neutral-200 dark:border-neutral-800">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      <ShareLinkModal
        isOpen={shareLinkModalOpen}
        onClose={() => setShareLinkModalOpen(false)}
        link={shareLink}
      />
    </>
  );
}
