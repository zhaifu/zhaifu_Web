import React, { useState } from 'react';
import { Folder, ChevronRight, ChevronDown, FolderOpen } from 'lucide-react';
import { BookmarkFolder, BookmarkNode, isFolder, AppSettings } from '../types';
import { Avatar } from './Avatar';

interface SidebarProps {
  isOpen: boolean;
  bookmarks: BookmarkFolder[];
  settings: AppSettings;
}

const SidebarItem = ({ node, settings, level = 0 }: { node: BookmarkNode, settings: AppSettings, level?: number }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = isFolder(node) && node.children.length > 0;
  const paddingLeft = level * 16 + 16; // Indentation

  if (isFolder(node)) {
    return (
      <div className="select-none">
        <div 
          className={`
            flex items-center gap-2 py-2.5 pr-3 
            hover:bg-white/10 cursor-pointer 
            text-gray-300 hover:text-white 
            transition-colors duration-200
            border-l-2 ${isExpanded ? `border-${settings.themeColor}-500 bg-white/5` : 'border-transparent'}
          `}
          style={{ paddingLeft: `${paddingLeft}px` }}
          onClick={() => setIsExpanded(!isExpanded)}
        >
            {hasChildren ? (
                isExpanded ? <ChevronDown size={14} className="opacity-70" /> : <ChevronRight size={14} className="opacity-70" />
            ) : (
                <span className="w-3.5" /> // Spacer for leaf folders
            )}
            
            <Folder size={16} className={`${isExpanded ? `text-${settings.themeColor}-400` : 'text-gray-400'} transition-colors`} />
            <span className="text-sm font-medium truncate flex-1 tracking-wide">{node.title}</span>
        </div>
        
        <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
          <div className="overflow-hidden">
            {node.children.length > 0 ? (
                node.children.map(child => (
                <SidebarItem key={child.id} node={child} settings={settings} level={level + 1} />
                ))
            ) : (
                <div className="text-xs text-gray-500 py-2 italic" style={{ paddingLeft: `${paddingLeft + 24}px` }}>
                    (空文件夹)
                </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Link Item
  return (
    <a 
      href={node.url}
      target="_blank" 
      rel="noopener noreferrer"
      className={`flex items-center gap-3 py-2 pr-3 hover:bg-${settings.themeColor}-600/20 cursor-pointer text-gray-400 hover:text-${settings.themeColor}-100 transition-all border-l-2 border-transparent hover:border-${settings.themeColor}-400 group`}
      style={{ paddingLeft: `${paddingLeft}px` }}
    >
       <div className="shrink-0 transition-transform group-hover:scale-110">
         <Avatar title={node.title} url={node.url} settings={settings} className="!w-5 !h-5 !text-[10px] !rounded-md shadow-sm" />
       </div>
       <span className="text-sm truncate flex-1 group-hover:translate-x-0.5 transition-transform">{node.title}</span>
    </a>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, bookmarks, settings }) => {
    return (
        <aside 
            className={`
                fixed top-0 left-0 z-40 h-screen w-64 
                transition-all duration-500 ease-out
                bg-slate-900/60 dark:bg-black/80 backdrop-blur-xl border-r border-white/10 dark:border-white/5
                hidden md:flex flex-col shadow-2xl
                ${isOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}
            `}
        >
            <div className="h-20 flex items-center px-6 border-b border-white/5 bg-white/5 transition-colors duration-500">
                <h2 className="font-bold text-white/90 tracking-wider flex items-center gap-2 pl-8">
                    <FolderOpen size={20} className={`text-${settings.themeColor}-500`} />
                    <span>书签目录</span>
                </h2>
            </div>
            <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
                {bookmarks.map(folder => (
                    <SidebarItem key={folder.id} node={folder} settings={settings} />
                ))}
                <div className="h-12" /> {/* Bottom spacer */}
            </div>
        </aside>
    );
}