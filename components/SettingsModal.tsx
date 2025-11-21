import React, { useRef, useState } from 'react';
import { X, Upload, Download, Circle, Square, Image as ImageIcon, Palette, Moon, Sun, Monitor, Check, Globe, Trash2, Plus, FileText, FolderPlus } from 'lucide-react';
import { AppSettings, BookmarkFolder } from '../types';
import { parseNetscapeBookmarks, generateNetscapeBookmarks } from '../services/bookmarkService';
import { THEME_COLORS } from '../utils';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  bookmarks: BookmarkFolder[];
  onImportBookmarks: (folders: BookmarkFolder[]) => void;
  onBulkAdd: (folderName: string, links: {title: string, url: string}[]) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  bookmarks,
  onImportBookmarks,
  onBulkAdd,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const backgroundFileRef = useRef<HTMLInputElement>(null);
  const [newApiUrl, setNewApiUrl] = useState('');
  
  // Bulk Add State
  const [bulkFolderName, setBulkFolderName] = useState('常用推荐');
  const [bulkContent, setBulkContent] = useState('');

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const parsed = parseNetscapeBookmarks(content);
        if (parsed.length > 0) {
            onImportBookmarks(parsed);
            onClose();
        } else {
            alert("无法解析书签。请确保文件是有效的 Netscape HTML 格式。");
        }
      }
    };
    reader.readAsText(file);
  };

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        onUpdateSettings({ 
            ...settings, 
            backgroundImage: result,
            wallpaperMode: 'custom' // Auto switch to custom when uploading
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleExport = () => {
    const html = generateNetscapeBookmarks(bookmarks);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bookmarks.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleAddApi = () => {
      if (!newApiUrl.trim()) return;
      // Validate URL
      try {
          new URL(newApiUrl);
      } catch (e) {
          alert('请输入有效的网址 (http:// 或 https://)');
          return;
      }

      // Prevent duplicates
      if (settings.wallpaperApis.includes(newApiUrl.trim())) {
          setNewApiUrl('');
          return;
      }

      onUpdateSettings({
          ...settings,
          wallpaperApis: [...settings.wallpaperApis, newApiUrl.trim()],
          activeWallpaperApi: newApiUrl.trim(),
          wallpaperMode: 'api'
      });
      setNewApiUrl('');
  };

  const handleDeleteApi = (apiToDelete: string) => {
      const newApis = settings.wallpaperApis.filter(api => api !== apiToDelete);
      let newActive = settings.activeWallpaperApi;
      
      // If we deleted the active one, select the first one or empty
      if (apiToDelete === settings.activeWallpaperApi && newApis.length > 0) {
          newActive = newApis[0];
      }

      onUpdateSettings({
          ...settings,
          wallpaperApis: newApis,
          activeWallpaperApi: newActive
      });
  };

  const handleBulkSubmit = () => {
      if (!bulkFolderName.trim()) {
          alert('请输入目标分类名称');
          return;
      }
      if (!bulkContent.trim()) {
          alert('请输入链接内容');
          return;
      }

      const lines = bulkContent.split('\n');
      const links: {title: string, url: string}[] = [];

      for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          
          // Split by the first colon
          const firstColonIndex = trimmed.indexOf(':');
          // Also support common Chinese colon just in case
          const firstChineseColonIndex = trimmed.indexOf('：');
          
          const splitIndex = firstColonIndex !== -1 ? firstColonIndex : firstChineseColonIndex;

          if (splitIndex === -1) continue;

          const title = trimmed.substring(0, splitIndex).trim();
          let url = trimmed.substring(splitIndex + 1).trim();

          // Simple check to ensure we captured something
          if (title && url) {
              links.push({ title, url });
          }
      }

      if (links.length === 0) {
          alert('未能识别有效链接。请使用格式：名称:网址');
          return;
      }

      onBulkAdd(bulkFolderName, links);
      setBulkContent(''); // Clear content
      alert(`成功添加 ${links.length} 个链接到 "${bulkFolderName}"`);
  };

  return (
    // Mobile: p-0 (Full screen), Desktop: p-4
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/50 backdrop-blur-sm animate-fadeIn transition-all duration-300">
      {/* Mobile: h-full, rounded-none. Desktop: h-auto, rounded-3xl */}
      <div className="bg-white dark:bg-slate-900 w-full max-w-3xl h-full md:h-auto rounded-none md:rounded-3xl shadow-2xl max-h-[100dvh] md:max-h-[90vh] overflow-hidden flex flex-col transition-colors duration-500 border-0 md:border border-white/20">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-4 md:p-6 border-b border-gray-100 dark:border-gray-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-10 transition-colors duration-500">
          <h2 className="text-lg md:text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Palette size={20} className={`text-${settings.themeColor}-500`} />
            个性化
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 md:p-6 space-y-6 md:space-y-8 flex-1 overflow-y-auto custom-scrollbar">
          
          {/* Theme & Color */}
          <section>
             <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3 md:mb-4 px-1">主题与外观</h3>
             <div className="space-y-5 bg-gray-50/80 dark:bg-slate-800/50 rounded-2xl p-4 md:p-5 border border-gray-100 dark:border-gray-800/50 transition-colors duration-500">
                
                {/* Dark Mode Toggle */}
                <div>
                    <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">显示模式</span>
                    <div className="flex bg-white dark:bg-slate-900 p-1 rounded-xl border border-gray-100 dark:border-gray-700 transition-colors duration-500">
                        {[
                            { id: 'light', icon: Sun, title: '浅色' },
                            { id: 'system', icon: Monitor, title: '自动' }, // Mobile friendly text
                            { id: 'dark', icon: Moon, title: '深色' },
                        ].map((mode) => (
                            <button
                                key={mode.id}
                                onClick={() => onUpdateSettings({...settings, themeMode: mode.id as any})}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 px-2 md:px-3 rounded-lg text-xs md:text-sm font-medium transition-all duration-300 ${
                                    settings.themeMode === mode.id 
                                    ? `bg-${settings.themeColor}-500 text-white shadow-md` 
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'
                                }`}
                            >
                                {React.createElement(mode.icon, { size: 16 })}
                                {mode.title}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Accent Color */}
                <div>
                    <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">主题色</span>
                    <div className="flex flex-wrap gap-3">
                        {THEME_COLORS.map((color) => (
                            <button
                                key={color.id}
                                onClick={() => onUpdateSettings({...settings, themeColor: color.id as any})}
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${color.color} ${
                                    settings.themeColor === color.id ? 'ring-2 ring-offset-2 ring-gray-300 dark:ring-gray-600 scale-110' : 'active:scale-95'
                                }`}
                                title={color.name}
                            >
                                {settings.themeColor === color.id && <Check size={14} className="text-white" />}
                            </button>
                        ))}
                    </div>
                </div>

             </div>
          </section>

          {/* Wallpaper & Background */}
          <section>
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3 md:mb-4 px-1">背景壁纸</h3>
            
            <div className="bg-gray-50/80 dark:bg-slate-800/50 rounded-2xl p-4 md:p-5 border border-gray-100 dark:border-gray-800/50 transition-colors duration-500">
              
              {/* Wallpaper Mode Tabs */}
              <div className="flex p-1 bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-gray-700 mb-6">
                 <button
                    onClick={() => onUpdateSettings({...settings, wallpaperMode: 'custom'})}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
                        settings.wallpaperMode === 'custom'
                        ? `bg-${settings.themeColor}-50 text-${settings.themeColor}-600 dark:bg-${settings.themeColor}-900/30 dark:text-${settings.themeColor}-300`
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                    }`}
                 >
                     <ImageIcon size={16} />
                     本地
                 </button>
                 <button
                    onClick={() => onUpdateSettings({...settings, wallpaperMode: 'api'})}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
                        settings.wallpaperMode === 'api'
                        ? `bg-${settings.themeColor}-50 text-${settings.themeColor}-600 dark:bg-${settings.themeColor}-900/30 dark:text-${settings.themeColor}-300`
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                    }`}
                 >
                     <Globe size={16} />
                     API
                 </button>
              </div>

              {settings.wallpaperMode === 'custom' ? (
                  // --- CUSTOM UPLOAD AREA ---
                  <div className="space-y-4 animate-fadeIn">
                      <div 
                        onClick={() => backgroundFileRef.current?.click()}
                        className={`
                            group relative aspect-video w-full rounded-xl border-2 border-dashed 
                            border-gray-300 dark:border-gray-600 hover:border-${settings.themeColor}-400 
                            flex flex-col items-center justify-center cursor-pointer
                            transition-all overflow-hidden bg-gray-100 dark:bg-slate-800
                        `}
                      >
                         {settings.backgroundImage ? (
                             <img 
                                src={settings.backgroundImage} 
                                alt="Preview" 
                                className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-40 transition-opacity"
                             />
                         ) : null}
                         <div className="relative z-10 flex flex-col items-center text-gray-500 dark:text-gray-400 group-hover:scale-110 transition-transform">
                             <Upload size={32} className="mb-2" />
                             <span className="text-sm font-medium bg-white/50 dark:bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">点击上传图片</span>
                         </div>
                         
                         <input 
                            type="file" 
                            ref={backgroundFileRef} 
                            onChange={handleBackgroundUpload} 
                            accept="image/*" 
                            className="hidden" 
                         />
                      </div>
                      <p className="text-xs text-center text-gray-400">
                          建议尺寸: 1920x1080。图片保存在本地。
                      </p>
                  </div>
              ) : (
                  // --- API MANAGER AREA ---
                  <div className="space-y-4 animate-fadeIn">
                      <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={newApiUrl}
                            onChange={(e) => setNewApiUrl(e.target.value)}
                            placeholder="输入 API (http://...)"
                            className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-200"
                          />
                          <button 
                            onClick={handleAddApi}
                            className={`px-4 py-2 bg-${settings.themeColor}-500 hover:bg-${settings.themeColor}-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1`}
                          >
                              <Plus size={16} />
                              添加
                          </button>
                      </div>
                      
                      <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                          {settings.wallpaperApis.map((api, index) => (
                              <div 
                                key={index}
                                className={`
                                    flex items-center justify-between p-3 rounded-lg border transition-all
                                    ${settings.activeWallpaperApi === api 
                                        ? `border-${settings.themeColor}-400 bg-${settings.themeColor}-50 dark:bg-${settings.themeColor}-900/20` 
                                        : 'border-gray-100 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-slate-700/50'}
                                `}
                              >
                                  <div 
                                    className="flex items-center gap-3 flex-1 cursor-pointer overflow-hidden"
                                    onClick={() => onUpdateSettings({...settings, activeWallpaperApi: api})}
                                  >
                                      <div className={`
                                        w-4 h-4 shrink-0 rounded-full border flex items-center justify-center
                                        ${settings.activeWallpaperApi === api ? `border-${settings.themeColor}-500` : 'border-gray-400'}
                                      `}>
                                          {settings.activeWallpaperApi === api && (
                                              <div className={`w-2 h-2 rounded-full bg-${settings.themeColor}-500`} />
                                          )}
                                      </div>
                                      <span className="text-sm text-gray-700 dark:text-gray-300 truncate font-mono">{api}</span>
                                  </div>
                                  
                                  <button 
                                    onClick={() => handleDeleteApi(api)}
                                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                    title="删除"
                                  >
                                      <Trash2 size={14} />
                                  </button>
                              </div>
                          ))}
                      </div>
                  </div>
              )}

              {/* Overlay & Blur Sliders */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div>
                    <label className="flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        <span>背景模糊</span>
                        <span className="text-xs font-mono bg-white dark:bg-slate-700 px-2 py-0.5 rounded-full text-gray-500">{settings.backgroundBlur}px</span>
                    </label>
                    <input 
                        type="range" 
                        min="0" 
                        max="20" 
                        value={settings.backgroundBlur}
                        onChange={(e) => onUpdateSettings({...settings, backgroundBlur: parseInt(e.target.value)})}
                        className={`w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-${settings.themeColor}-400 touch-none`}
                    />
                  </div>
                  <div>
                    <label className="flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        <span>暗色遮罩</span>
                        <span className="text-xs font-mono bg-white dark:bg-slate-700 px-2 py-0.5 rounded-full text-gray-500">{Math.round(settings.backgroundOverlay * 100)}%</span>
                    </label>
                    <input 
                        type="range" 
                        min="0" 
                        max="0.9" 
                        step="0.1"
                        value={settings.backgroundOverlay}
                        onChange={(e) => onUpdateSettings({...settings, backgroundOverlay: parseFloat(e.target.value)})}
                        className={`w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-${settings.themeColor}-400 touch-none`}
                    />
                  </div>
              </div>
            </div>
          </section>
          
          {/* Card Style & Icon Shape */}
          <section>
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3 md:mb-4 px-1">界面风格</h3>
            <div className="bg-gray-50/80 dark:bg-slate-800/50 rounded-2xl p-4 md:p-5 border border-gray-100 dark:border-gray-800/50 transition-colors duration-500">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Card Style */}
                    <div>
                        <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">卡片风格</span>
                        <div className="flex bg-white dark:bg-slate-900 p-1 rounded-xl border border-gray-100 dark:border-gray-700 transition-colors duration-500">
                            {(['glass', 'solid', 'minimal'] as const).map((mode) => (
                                <button
                                    key={mode}
                                    onClick={() => onUpdateSettings({...settings, cardStyle: mode})}
                                    className={`flex-1 py-2 md:py-1.5 px-3 rounded-lg text-xs font-medium transition-all duration-300 ${
                                        settings.cardStyle === mode 
                                        ? `bg-${settings.themeColor}-400 text-white shadow-sm` 
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    {mode === 'glass' ? '毛玻璃' : mode === 'solid' ? '纯白' : '极简'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Icon Shape */}
                    <div>
                        <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">图标形状</span>
                        <div className="flex gap-2">
                            {[
                                { id: 'circle', icon: Circle, title: '圆形' },
                                { id: 'rounded', icon: null, title: '圆角' }, 
                                { id: 'square', icon: Square, title: '方形' }
                            ].map((shape) => (
                                <button 
                                    key={shape.id}
                                    onClick={() => onUpdateSettings({...settings, iconShape: shape.id as any})}
                                    className={`flex-1 flex justify-center items-center py-2 md:py-1.5 rounded-xl border transition-all duration-300 ${
                                        settings.iconShape === shape.id 
                                        ? `border-${settings.themeColor}-400 bg-${settings.themeColor}-50 dark:bg-${settings.themeColor}-900/20 text-${settings.themeColor}-500` 
                                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 hover:border-gray-300'
                                    }`}
                                    title={shape.title}
                                >
                                    {shape.id === 'rounded' ? (
                                        <div className="w-4 h-4 border-2 border-current rounded-[5px]" />
                                    ) : (
                                        React.createElement(shape.icon as any, { size: 16 })
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
          </section>
          
          <hr className="border-gray-100 dark:border-gray-800 transition-colors duration-500" />

          {/* Bulk Add */}
          <section>
             <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3 md:mb-4 px-1">批量添加</h3>
             <div className="bg-gray-50/80 dark:bg-slate-800/50 rounded-2xl p-4 md:p-5 border border-gray-100 dark:border-gray-800/50 transition-colors duration-500">
                 <div className="space-y-4">
                     <div>
                         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">目标分类名称</label>
                         <div className="flex gap-2 items-center">
                             <FolderPlus size={18} className={`text-${settings.themeColor}-500`} />
                             <input 
                                type="text" 
                                value={bulkFolderName}
                                onChange={(e) => setBulkFolderName(e.target.value)}
                                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 text-sm outline-none focus:border-blue-500 dark:text-white transition-colors"
                                placeholder="例如：常用推荐"
                             />
                         </div>
                     </div>
                     
                     <div>
                         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                             链接列表 <span className="text-gray-400 font-normal text-xs ml-2">(格式: 名称:网址，一行一个)</span>
                         </label>
                         <textarea 
                            value={bulkContent}
                            onChange={(e) => setBulkContent(e.target.value)}
                            rows={5}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 text-sm outline-none focus:border-blue-500 dark:text-white font-mono transition-colors resize-y"
                            placeholder={`知音漫画:https://m.zymk.cn\n海量漫画:https://m.kanman.com/sort/\n爱优漫画:https://m.kanman.com/`}
                         />
                     </div>

                     <button 
                        onClick={handleBulkSubmit}
                        className={`w-full py-3 md:py-2.5 bg-${settings.themeColor}-500 hover:bg-${settings.themeColor}-600 text-white rounded-xl font-medium shadow-md shadow-${settings.themeColor}-500/20 transition-all active:scale-95 flex items-center justify-center gap-2`}
                     >
                         <FileText size={18} />
                         解析并添加
                     </button>
                 </div>
             </div>
          </section>

          <hr className="border-gray-100 dark:border-gray-800 transition-colors duration-500" />

          {/* Data Management */}
          <section>
             <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3 md:mb-4 pl-1">数据备份</h3>
             
             <div className="flex flex-col sm:flex-row gap-4">
                 <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-800 dark:text-white rounded-2xl font-medium transition-all active:scale-95 duration-300"
                 >
                     <Upload size={18} />
                     导入书签
                 </button>
                 <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                    accept=".html" 
                    className="hidden" 
                />
                 
                 <button 
                    onClick={handleExport}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-800 dark:text-white rounded-2xl font-medium transition-all active:scale-95 duration-300"
                 >
                     <Download size={18} />
                     导出 HTML
                 </button>
             </div>
             <p className="text-center text-xs text-gray-400 mt-3 pb-6 md:pb-0">
                 支持标准 Netscape 书签格式 (Chrome, Safari, Edge 等)
             </p>
          </section>

        </div>
      </div>
    </div>
  );
};