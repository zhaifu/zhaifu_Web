import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { AppSettings } from '../types';

interface AddBookmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (title: string, url: string) => void;
  folderName?: string;
  settings?: AppSettings; // Make it optional to maintain backward compatibility if needed, though we'll pass it
}

export const AddBookmarkModal: React.FC<AddBookmarkModalProps> = ({ isOpen, onClose, onAdd, folderName, settings }) => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  
  const themeColor = settings?.themeColor || 'blue';

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setUrl('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title && url) {
      onAdd(title, url);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-white/10 overflow-hidden transform transition-all">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-white/5">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            添加到 {folderName ? `"${folderName}"` : '书签'}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
            <X size={18} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">标题</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-${themeColor}-500 outline-none transition-all`}
              placeholder="例如：Google"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">网址</label>
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-${themeColor}-500 outline-none transition-all`}
              placeholder="https://..."
            />
          </div>
          
          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className={`px-4 py-2 text-sm font-medium text-white bg-${themeColor}-600 hover:bg-${themeColor}-700 rounded-lg shadow-lg shadow-${themeColor}-500/30 transition-all active:scale-95`}
            >
              添加
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};