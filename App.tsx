
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Settings, Search, FolderOpen, ChevronDown, Menu, Plus, X } from 'lucide-react';
import { BookmarkFolder, BookmarkNode, isFolder, AppSettings, BookmarkLink } from './types';
import { SettingsModal } from './components/SettingsModal';
import { BookmarkCard } from './components/BookmarkCard';
import { Sidebar } from './components/Sidebar';
import { AddBookmarkModal } from './components/AddBookmarkModal';
import { generateId, SEARCH_ENGINES, THEME_PRESETS, DEFAULT_WALLPAPER_APIS } from './utils';

// Default to "Sakura" (index 0)
const DEFAULT_SETTINGS: AppSettings = {
    ...THEME_PRESETS[0].settings as AppSettings,
    showSearchBar: true,
    searchEngine: 'bing',
    themeMode: 'system',
    themeColor: 'pink',
    // New wallpaper defaults
    wallpaperMode: 'custom',
    wallpaperApis: DEFAULT_WALLPAPER_APIS,
    activeWallpaperApi: DEFAULT_WALLPAPER_APIS[0],
};

const DEFAULT_BOOKMARKS: BookmarkFolder[] = [
  {
    id: '1',
    title: '常用推荐',
    children: [
        { id: generateId(), title: 'Bilibili', url: 'https://www.bilibili.com' },
        { id: generateId(), title: '小红书', url: 'https://www.xiaohongshu.com' },
        { id: generateId(), title: 'YouTube', url: 'https://www.youtube.com' },
    ]
  },
  {
    id: '2',
    title: '生活方式',
    children: [
        { id: generateId(), title: 'Instagram', url: 'https://www.instagram.com' },
        { id: generateId(), title: 'Pinterest', url: 'https://www.pinterest.com' },
        { id: generateId(), title: '豆瓣', url: 'https://www.douban.com' },
    ]
  }
];

function App() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [bookmarks, setBookmarks] = useState<BookmarkFolder[]>(DEFAULT_BOOKMARKS);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [isSearchMenuOpen, setIsSearchMenuOpen] = useState(false);
  
  // Add Bookmark State
  const [addModalFolderId, setAddModalFolderId] = useState<string | null>(null);

  const searchMenuRef = useRef<HTMLDivElement>(null);

  // Load from LocalStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('zennav_settings');
    const savedBookmarks = localStorage.getItem('zennav_bookmarks');

    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        // Merge with defaults to ensure new fields exist
        setSettings({ 
            ...DEFAULT_SETTINGS, 
            ...parsed,
            // Ensure arrays are populated if missing in old save data
            wallpaperApis: parsed.wallpaperApis || DEFAULT_WALLPAPER_APIS,
            wallpaperMode: parsed.wallpaperMode || 'custom',
            activeWallpaperApi: parsed.activeWallpaperApi || DEFAULT_WALLPAPER_APIS[0]
        });
      } catch (e) { console.error("Failed to parse settings", e); }
    }
    
    if (savedBookmarks) {
      try {
         setBookmarks(JSON.parse(savedBookmarks));
      } catch (e) { console.error("Failed to parse bookmarks", e); }
    }
    setIsMounted(true);
  }, []);

  // Save to LocalStorage on change
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('zennav_settings', JSON.stringify(settings));
    }
  }, [settings, isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('zennav_bookmarks', JSON.stringify(bookmarks));
    }
  }, [bookmarks, isMounted]);

  // Dark Mode Logic
  useEffect(() => {
    const root = window.document.documentElement;
    const applyDark = () => root.classList.add('dark');
    const removeDark = () => root.classList.remove('dark');

    if (settings.themeMode === 'dark') {
        applyDark();
    } else if (settings.themeMode === 'light') {
        removeDark();
    } else {
        // System
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            applyDark();
        } else {
            removeDark();
        }
        // Listen for system changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => {
            if (settings.themeMode === 'system') {
                e.matches ? applyDark() : removeDark();
            }
        };
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [settings.themeMode]);

  // Close search menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (searchMenuRef.current && !searchMenuRef.current.contains(event.target as Node)) {
            setIsSearchMenuOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- Bookmark Management Logic ---

  // Helper: Recursive add
  const addNodeToTree = (nodes: BookmarkNode[], parentId: string, newLink: BookmarkLink): BookmarkNode[] => {
    return nodes.map(node => {
        if (isFolder(node)) {
            if (node.id === parentId) {
                return { ...node, children: [...node.children, newLink] };
            }
            return { ...node, children: addNodeToTree(node.children, parentId, newLink) };
        }
        return node;
    });
  };

  // Helper: Recursive remove
  const removeNodeFromTree = (nodes: BookmarkNode[], id: string): BookmarkNode[] => {
    return nodes
        .filter(node => node.id !== id)
        .map(node => {
            if (isFolder(node)) {
                return { ...node, children: removeNodeFromTree(node.children, id) };
            }
            return node;
        });
  };

  const handleAddBookmark = (title: string, url: string) => {
    if (!addModalFolderId) return;
    
    const newLink: BookmarkLink = {
        id: generateId(),
        title,
        url,
        addDate: Math.floor(Date.now() / 1000).toString()
    };

    const newBookmarks = addNodeToTree(bookmarks, addModalFolderId, newLink) as BookmarkFolder[];
    setBookmarks(newBookmarks);
  };

  const handleDeleteBookmark = (id: string) => {
    const newBookmarks = removeNodeFromTree(bookmarks, id) as BookmarkFolder[];
    setBookmarks(newBookmarks);
  };

  // Bulk Add Handler
  const handleBulkAdd = (folderName: string, links: {title: string, url: string}[]) => {
    setBookmarks(prev => {
        const newBookmarks = [...prev];
        const existingFolderIndex = newBookmarks.findIndex(f => f.title === folderName);

        const newLinks: BookmarkLink[] = links.map(l => ({
            id: generateId(),
            title: l.title,
            url: l.url,
            addDate: Math.floor(Date.now() / 1000).toString()
        }));

        if (existingFolderIndex >= 0) {
            // Append to existing folder
            const folder = newBookmarks[existingFolderIndex];
            newBookmarks[existingFolderIndex] = {
                ...folder,
                children: [...folder.children, ...newLinks]
            };
        } else {
            // Create new folder
            newBookmarks.push({
                id: generateId(),
                title: folderName,
                children: newLinks
            });
        }
        return newBookmarks;
    });
  };

  // 1. Deep filter the bookmark tree based on search
  const filteredTree = useMemo(() => {
    if (!searchQuery.trim()) return bookmarks;

    const lowerQuery = searchQuery.toLowerCase();
    
    const filterFolder = (folder: BookmarkFolder): BookmarkFolder | null => {
        const filteredChildren: (BookmarkFolder | any)[] = [];
        
        folder.children.forEach(child => {
            if (isFolder(child)) {
                const result = filterFolder(child);
                if (result) filteredChildren.push(result);
            } else {
                if (child.title.toLowerCase().includes(lowerQuery) || child.url.toLowerCase().includes(lowerQuery)) {
                    filteredChildren.push(child);
                }
            }
        });

        if (filteredChildren.length > 0) {
            return { ...folder, children: filteredChildren };
        }
        return null;
    };

    return bookmarks.map(filterFolder).filter((f): f is BookmarkFolder => f !== null);
  }, [bookmarks, searchQuery]);

  // 2. Flatten the tree for display (One folder per section)
  const displayFolders = useMemo(() => {
    const result: BookmarkFolder[] = [];
    
    const traverse = (folders: BookmarkFolder[]) => {
      folders.forEach(folder => {
        // Check if this folder has direct link children
        const directLinks = folder.children.filter(c => !isFolder(c)) as BookmarkLink[];
        
        // Include it if it has links OR if it's a top-level empty folder (so we can add to it)
        if (directLinks.length > 0 || (!searchQuery && folder.children.every(c => isFolder(c)))) {
          if (directLinks.length > 0) {
            result.push({
                ...folder,
                children: directLinks
            });
          } else if (!searchQuery) {
             // Empty folder or folder with only subfolders (render empty for "Add" purpose)
             result.push({ ...folder, children: [] });
          }
        }
        
        // Continue traversing nested folders
        const subFolders = folder.children.filter(isFolder);
        traverse(subFolders);
      });
    };

    traverse(filteredTree);
    return result;
  }, [filteredTree, searchQuery]);

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      // Check if query is a URL
      if (searchQuery.match(/^(http|https):\/\/[^ "]+$/)) {
        window.open(searchQuery, '_blank');
      } else {
        const engine = SEARCH_ENGINES[settings.searchEngine] || SEARCH_ENGINES.bing;
        window.open(engine.url + encodeURIComponent(searchQuery), '_blank');
      }
      // Clear search query so bookmarks reappear
      setSearchQuery('');
    }
  };

  const currentEngine = SEARCH_ENGINES[settings.searchEngine] || SEARCH_ENGINES.bing;

  // Find current folder name for modal
  const activeFolderName = useMemo(() => {
    if (!addModalFolderId) return '';
    const findName = (nodes: BookmarkFolder[]): string | undefined => {
        for (const node of nodes) {
            if (node.id === addModalFolderId) return node.title;
            const found = findName(node.children.filter(isFolder));
            if (found) return found;
        }
    };
    return findName(bookmarks);
  }, [addModalFolderId, bookmarks]);
  
  // Determine background image
  const backgroundUrl = useMemo(() => {
      if (settings.wallpaperMode === 'api' && settings.activeWallpaperApi) {
          return settings.activeWallpaperApi;
      }
      return settings.backgroundImage;
  }, [settings.wallpaperMode, settings.activeWallpaperApi, settings.backgroundImage]);

  return (
    <div className="min-h-screen w-full relative transition-colors duration-500 ease-in-out text-slate-800 dark:text-slate-100 font-sans bg-gray-50 dark:bg-black">
      {/* Background Layer - Optimized for mobile scrolling */}
      {/* Uses 'fixed' with 100lvh (Largest Viewport Height) to prevent resizing/jumping when mobile address bar collapses */}
      <div 
        className="fixed top-0 left-0 w-full h-screen z-0 transition-colors duration-700 bg-gray-100 dark:bg-[#050505]"
        style={{ height: '100lvh' }}
      >
        {/* Background Image Container */}
        <div 
             className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700 ease-in-out"
             style={{ 
                backgroundImage: `url(${backgroundUrl})`,
                filter: `blur(${settings.backgroundBlur}px)`,
                // Use translateZ(0) to force hardware acceleration and reduce jitter on scroll
                transform: 'scale(1.02) translateZ(0)', 
             }}
        />
        {/* Overlay */}
        <div 
            className="absolute inset-0 bg-black/5 dark:bg-black/30 transition-colors duration-700 ease-in-out"
            style={{ opacity: Math.max(settings.backgroundOverlay, 0.1) }}
        />
      </div>

      <Sidebar isOpen={isSidebarOpen} bookmarks={bookmarks} settings={settings} />

      {/* Main Content */}
      <div className={`relative z-10 flex flex-col h-full min-h-screen overflow-y-auto transition-all duration-300 ease-out ${isSidebarOpen ? 'md:pl-64' : ''}`}>
        
        {/* Hamburger Button */}
        <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`
                hidden md:flex items-center justify-center
                absolute top-6 z-50
                p-3 rounded-full 
                bg-white/10 backdrop-blur-md 
                border border-white/20
                text-white shadow-none
                transition-all duration-300 ease-out
                hover:scale-110 active:scale-95
                focus:outline-none focus:ring-0
                group
                ${isSidebarOpen ? 'left-72' : 'left-6'}
            `}
            title={isSidebarOpen ? "收起目录" : "展开目录"}
        >
            <Menu size={20} className={`transition-colors ${isSidebarOpen ? `text-${settings.themeColor}-300` : 'text-white'}`} />
        </button>

        {/* Settings Button */}
        <button 
            onClick={() => setIsSettingsOpen(true)}
            className={`
                absolute top-6 right-6 z-50
                flex items-center justify-center
                p-3 rounded-full 
                bg-white/10 backdrop-blur-md 
                border border-white/20
                text-white shadow-none
                transition-all duration-300 ease-out
                hover:scale-110 active:scale-95
                focus:outline-none focus:ring-0
                group
            `}
            title="设置"
        >
            <Settings size={20} className="group-hover:rotate-90 transition-transform duration-500" />
        </button>

        {/* Header / Search Area */}
        <header className="w-full max-w-7xl mx-auto px-6 pt-12 pb-8 flex flex-col items-center justify-center gap-6 relative">
            {/* Time and Date */}
            <div className="text-white/90 text-center mb-2 mt-4 select-none">
                 <h1 className="text-4xl md:text-6xl font-bold tracking-tight drop-shadow-lg font-sans">
                    {new Date().toLocaleTimeString('zh-CN', {hour: '2-digit', minute:'2-digit'})}
                 </h1>
                 <p className="text-white/80 text-lg mt-2 font-medium drop-shadow-md tracking-wide">
                    {new Date().toLocaleDateString('zh-CN', { weekday: 'long', month: 'long', day: 'numeric' })}
                 </p>
            </div>

            {settings.showSearchBar && (
                <div className="w-full max-w-2xl relative group z-20">
                    {/* Search Engine Selector */}
                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center z-30" ref={searchMenuRef}>
                        <button 
                            onClick={() => setIsSearchMenuOpen(!isSearchMenuOpen)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-white/70 transition-colors hover:text-white focus:outline-none bg-transparent hover:bg-transparent active:bg-transparent"
                        >
                            <span className="text-sm font-medium">{currentEngine.name}</span>
                            <ChevronDown size={14} className={`opacity-60 transition-transform duration-300 ${isSearchMenuOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isSearchMenuOpen && (
                             <div className="absolute top-full left-0 mt-2 w-40 bg-[#1a1a1a] rounded-xl border border-white/10 py-2 shadow-2xl overflow-hidden z-40">
                                {Object.entries(SEARCH_ENGINES).map(([key, engine]) => (
                                    <button 
                                        key={key}
                                        onClick={() => { 
                                            setSettings({ ...settings, searchEngine: key }); 
                                            setIsSearchMenuOpen(false); 
                                        }}
                                        className={`flex items-center gap-3 w-full px-4 py-3 text-sm transition-colors text-left focus:outline-none bg-transparent hover:bg-transparent
                                            ${settings.searchEngine === key 
                                                ? `text-${settings.themeColor}-400 font-medium` 
                                                : 'text-gray-400 hover:text-gray-200'}
                                        `}
                                    >
                                        {engine.name}
                                    </button>
                                ))}
                             </div>
                        )}
                    </div>

                    <input
                        type="text"
                        className="block w-full pl-32 pr-12 py-4 bg-white/15 dark:bg-black/20 border border-white/20 backdrop-blur-md rounded-full leading-5 text-white placeholder-white/60 focus:outline-none focus:border-white/40 focus:bg-white/25 focus:ring-0 transition-all duration-300 shadow-lg shadow-black/5"
                        placeholder={`Search with ${currentEngine.name}...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleSearch}
                    />

                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                         {searchQuery ? (
                            <button 
                                onClick={() => setSearchQuery('')}
                                className="p-1 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                                title="清除搜索"
                            >
                                <X size={18} />
                            </button>
                         ) : (
                            <Search className="h-5 w-5 text-white/60 group-focus-within:text-white transition-colors pointer-events-none" />
                         )}
                    </div>
                </div>
            )}
        </header>

        {/* Bookmarks Grid */}
        <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 pb-20 flex-1">
            {displayFolders.length === 0 ? (
                <div className="text-center py-20 text-white/60">
                    <FolderOpen size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-light">
                        {searchQuery ? '没有找到匹配的书签' : '这里空空如也'}
                    </p>
                    <p className="text-sm mt-2 opacity-70">
                         {searchQuery ? '按 Enter 键搜索网络' : '请在设置中导入书签'}
                    </p>
                </div>
            ) : (
                <div className="space-y-12">
                    {displayFolders.map(folder => (
                        <section key={folder.id} className="animate-fadeIn scroll-mt-24" id={`folder-${folder.id}`}>
                            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2 mx-1 group">
                                <div className="flex items-center gap-3">
                                    {/* Theme Color Vertical Bar */}
                                    <div className={`w-1.5 h-5 rounded-full bg-${settings.themeColor}-500 shadow-md shadow-${settings.themeColor}-500/30 transition-colors duration-300`} />
                                    
                                    <h2 className="text-lg font-medium text-white/90 tracking-wide drop-shadow-sm">
                                        {folder.title}
                                    </h2>
                                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/20 text-white/80 backdrop-blur-sm">
                                        {folder.children.length}
                                    </span>
                                </div>
                                {/* Add Button */}
                                <button 
                                    onClick={() => setAddModalFolderId(folder.id)}
                                    className={`p-1.5 rounded-full bg-white/10 hover:bg-${settings.themeColor}-500/80 text-white/70 hover:text-white opacity-0 group-hover:opacity-100 transition-all`}
                                    title="添加书签"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                            
                            {/* Grid Layout: Mobile 2 cols, Desktop 4 cols */}
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                                {folder.children.map(node => {
                                    // Double check to ensure we only render links
                                    if(isFolder(node)) return null; 
                                    return (
                                        <BookmarkCard 
                                            key={node.id} 
                                            bookmark={node} 
                                            settings={settings} 
                                            onDelete={handleDeleteBookmark}
                                        />
                                    );
                                })}
                                
                                {folder.children.length === 0 && (
                                    <button
                                        onClick={() => setAddModalFolderId(folder.id)}
                                        className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all group"
                                    >
                                        <Plus size={24} className="mb-2 opacity-50 group-hover:opacity-100" />
                                        <span className="text-sm">添加书签</span>
                                    </button>
                                )}
                            </div>
                        </section>
                    ))}
                </div>
            )}
        </main>

        {/* Footer */}
        <footer className="text-center py-6 text-white/30 text-sm relative z-10">
            <p>ZenNav &copy; {new Date().getFullYear()}</p>
        </footer>

      </div>

      {/* Modals */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={setSettings}
        bookmarks={bookmarks}
        onImportBookmarks={setBookmarks}
        onBulkAdd={handleBulkAdd}
      />

      <AddBookmarkModal
        isOpen={!!addModalFolderId}
        onClose={() => setAddModalFolderId(null)}
        onAdd={handleAddBookmark}
        folderName={activeFolderName}
        settings={settings}
      />
    </div>
  );
}

export default App;
