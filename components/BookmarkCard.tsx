import React from 'react';
import { Trash2 } from 'lucide-react';
import { BookmarkLink, AppSettings } from '../types';
import { Avatar } from './Avatar';

interface BookmarkCardProps {
  bookmark: BookmarkLink;
  settings: AppSettings;
  onDelete?: (id: string) => void;
}

export const BookmarkCard: React.FC<BookmarkCardProps> = ({ bookmark, settings, onDelete }) => {
  // Determine card classes based on settings
  // Improved Logic: Solid cards now become dark gray in dark mode instead of staying white
  let cardBgClass = '';
  let textClass = '';
  let titleClass = '';

  if (settings.cardStyle === 'glass') {
    cardBgClass = 'bg-white/20 dark:bg-black/40 backdrop-blur-md border border-white/30 dark:border-white/10 text-white hover:bg-white/30 dark:hover:bg-black/50';
    textClass = 'text-gray-200 dark:text-gray-400';
    titleClass = 'text-white';
  } else if (settings.cardStyle === 'solid') {
    // In Light Mode: White bg, Gray text
    // In Dark Mode: Dark Gray bg, White text
    cardBgClass = 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:shadow-lg shadow-sm dark:shadow-none';
    textClass = 'text-gray-500 dark:text-gray-400';
    titleClass = 'text-gray-900 dark:text-gray-100';
  } else {
    // Minimal
    cardBgClass = 'bg-transparent hover:bg-white/10 dark:hover:bg-white/5 text-white border border-transparent hover:border-white/20 dark:hover:border-white/10';
    textClass = 'text-gray-200 dark:text-gray-400';
    titleClass = 'text-white';
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // No confirmation dialog as requested
    onDelete?.(bookmark.id);
  };

  return (
    <a 
      href={bookmark.url}
      target="_blank" 
      rel="noopener noreferrer"
      // Mobile: p-2.5, Desktop: p-3
      className={`group relative flex items-center p-2.5 md:p-3 transition-all duration-300 ease-out ${cardBgClass} ${settings.iconShape === 'rounded' ? 'rounded-lg md:rounded-xl' : settings.iconShape === 'circle' ? 'rounded-xl md:rounded-2xl' : 'rounded-md md:rounded-sm'}`}
    >
      {/* Mobile: mr-2.5, Desktop: mr-3 */}
      <div className="flex-shrink-0 mr-2.5 md:mr-3">
        <Avatar title={bookmark.title} url={bookmark.url} settings={settings} />
      </div>
      <div className="flex-1 min-w-0 pr-4 md:pr-8">
        <h4 className={`text-sm font-medium truncate transition-colors duration-300 ${titleClass} group-hover:translate-x-0.5 transition-transform`}>
          {bookmark.title}
        </h4>
        <p className={`text-[10px] md:text-xs truncate mt-0.5 opacity-70 transition-colors duration-300 ${textClass}`}>
          {new URL(bookmark.url).hostname.replace('www.', '')}
        </p>
      </div>

      {/* Delete Button - Vertically Centered */}
      {onDelete && (
        <button
            onClick={handleDelete}
            className="absolute right-1 md:right-2 top-1/2 -translate-y-1/2 p-1.5 md:p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-500/20 hover:text-red-500 text-gray-400 dark:text-white/60 z-10"
            title="删除"
        >
            <Trash2 size={16} />
        </button>
      )}
    </a>
  );
};