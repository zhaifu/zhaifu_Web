
export interface BookmarkLink {
  id: string;
  title: string;
  url: string;
  addDate?: string;
  icon?: string; // Optional custom icon url
}

export interface BookmarkFolder {
  id: string;
  title: string;
  children: (BookmarkLink | BookmarkFolder)[];
  addDate?: string;
  lastModified?: string;
}

export type BookmarkNode = BookmarkLink | BookmarkFolder;

export interface AppSettings {
  // Wallpaper Settings
  wallpaperMode: 'custom' | 'api'; // New: Switch between local upload and API
  backgroundImage: string; // Stores the local image data/url
  wallpaperApis: string[]; // New: List of user-added APIs
  activeWallpaperApi: string; // New: The currently selected API URL
  
  backgroundBlur: number;
  backgroundOverlay: number;
  cardStyle: 'glass' | 'solid' | 'minimal';
  iconShape: 'circle' | 'square' | 'rounded';
  showSearchBar: boolean;
  searchEngine: string;
  
  // Theme Settings
  themeMode: 'light' | 'dark' | 'system';
  themeColor: 'pink' | 'violet' | 'blue' | 'sky' | 'cyan' | 'emerald' | 'lime' | 'amber' | 'orange' | 'rose';
}

export interface ThemePreset {
  id: string;
  name: string;
  settings: Partial<AppSettings>;
  thumbnailColor: string; // For the UI representation
}

export const isFolder = (node: BookmarkNode): node is BookmarkFolder => {
  return 'children' in node;
};
