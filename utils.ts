
import { ThemePreset } from './types';

// Deterministic color generator based on string input
export const stringToColor = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Pastel / Soft Palette for "Cute" vibe
  const colors = [
    '#fca5a5', // red-300
    '#fdba74', // orange-300
    '#fcd34d', // amber-300
    '#bef264', // lime-300
    '#86efac', // green-300
    '#67e8f9', // cyan-300
    '#93c5fd', // blue-300
    '#c4b5fd', // violet-300
    '#f0abfc', // fuchsia-300
    '#fda4af', // rose-300
  ];

  const index = Math.abs(hash % colors.length);
  return colors[index];
};

export const getFirstChar = (str: string): string => {
  if (!str) return '?';
  // Trimming ensures we don't get a space as the first char
  const cleanStr = str.trim();
  // Handle Chinese characters correctly (they are just characters in JS)
  return cleanStr ? cleanStr.charAt(0).toUpperCase() : '?';
};

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const SEARCH_ENGINES: Record<string, { name: string; url: string; icon: string }> = {
  google: { 
    name: 'Google', 
    url: 'https://www.google.com/search?q=', 
    icon: 'https://www.google.com/s2/favicons?domain=google.com&sz=64' 
  },
  bing: { 
    name: 'Bing', 
    url: 'https://www.bing.com/search?q=', 
    icon: 'https://www.google.com/s2/favicons?domain=bing.com&sz=64' 
  },
  baidu: { 
    name: 'Baidu', 
    url: 'https://www.baidu.com/s?wd=', 
    icon: 'https://www.google.com/s2/favicons?domain=baidu.com&sz=64' 
  },
  sogou: { 
    name: 'Sogou', 
    url: 'https://www.sogou.com/web?query=', 
    icon: 'https://www.google.com/s2/favicons?domain=sogou.com&sz=64' 
  },
  wikipedia: { 
    name: 'Wikipedia', 
    url: 'https://zh.wikipedia.org/wiki/', 
    icon: 'https://www.google.com/s2/favicons?domain=wikipedia.org&sz=64' 
  },
  duckduckgo: { 
    name: 'DuckDuckGo', 
    url: 'https://duckduckgo.com/?q=', 
    icon: 'https://www.google.com/s2/favicons?domain=duckduckgo.com&sz=64' 
  },
  yahoo: { 
    name: 'Yahoo', 
    url: 'https://search.yahoo.com/search?p=', 
    icon: 'https://www.google.com/s2/favicons?domain=yahoo.com&sz=64' 
  },
};

// Default Random Wallpaper APIs
export const DEFAULT_WALLPAPER_APIS = [
    'https://imgapi.xl0408.top/index.php',
    'https://t.alcy.cc/fj',
    'https://t.alcy.cc/', 
    'https://www.dmoe.cc/random.php'
];

// Global Theme Colors Definition
export const THEME_COLORS = [
    { id: 'pink', name: '樱粉', color: 'bg-pink-500', text: 'text-pink-500', border: 'border-pink-500' },
    { id: 'rose', name: '蔷薇', color: 'bg-rose-500', text: 'text-rose-500', border: 'border-rose-500' },
    { id: 'violet', name: '香芋', color: 'bg-violet-500', text: 'text-violet-500', border: 'border-violet-500' },
    { id: 'blue', name: '海蓝', color: 'bg-blue-500', text: 'text-blue-500', border: 'border-blue-500' },
    { id: 'sky', name: '晴空', color: 'bg-sky-500', text: 'text-sky-500', border: 'border-sky-500' },
    { id: 'cyan', name: '薄荷', color: 'bg-cyan-400', text: 'text-cyan-400', border: 'border-cyan-400' },
    { id: 'emerald', name: '翠绿', color: 'bg-emerald-500', text: 'text-emerald-500', border: 'border-emerald-500' },
    { id: 'amber', name: '暖阳', color: 'bg-amber-400', text: 'text-amber-400', border: 'border-amber-400' },
    { id: 'orange', name: '活力', color: 'bg-orange-400', text: 'text-orange-400', border: 'border-orange-400' },
];

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'sakura',
    name: '落樱 Sakura',
    thumbnailColor: 'bg-pink-300',
    settings: {
      backgroundImage: 'https://images.unsplash.com/photo-1477346611705-65d1883cee1e?q=80&w=2070&auto=format&fit=crop',
      backgroundBlur: 6,
      backgroundOverlay: 0.15,
      cardStyle: 'glass',
      iconShape: 'circle',
      themeColor: 'pink',
      themeMode: 'light'
    }
  },
  {
    id: 'matcha',
    name: '抹茶 Matcha',
    thumbnailColor: 'bg-green-300',
    settings: {
      backgroundImage: 'https://images.unsplash.com/photo-1477346611705-65d1883cee1e?q=80&w=2070&auto=format&fit=crop',
      backgroundBlur: 0,
      backgroundOverlay: 0.1,
      cardStyle: 'minimal',
      iconShape: 'rounded',
      themeColor: 'emerald',
      themeMode: 'light'
    }
  },
  {
    id: 'cream',
    name: '奶油 Cream',
    thumbnailColor: 'bg-orange-100',
    settings: {
      backgroundImage: 'https://images.unsplash.com/photo-1507652955-f3dcef5a3be5?auto=format&fit=crop&q=80',
      backgroundBlur: 0,
      backgroundOverlay: 0,
      cardStyle: 'solid',
      iconShape: 'rounded',
      themeColor: 'amber',
      themeMode: 'light'
    }
  },
  {
    id: 'taro',
    name: '香芋 Taro',
    thumbnailColor: 'bg-purple-300',
    settings: {
      backgroundImage: 'https://images.unsplash.com/photo-1615233500570-c5f60d81dfd4?auto=format&fit=crop&q=80',
      backgroundBlur: 8,
      backgroundOverlay: 0.2,
      cardStyle: 'glass',
      iconShape: 'circle',
      themeColor: 'violet',
      themeMode: 'dark'
    }
  },
  {
    id: 'sky',
    name: '晴空 Sky',
    thumbnailColor: 'bg-sky-300',
    settings: {
      backgroundImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80',
      backgroundBlur: 4,
      backgroundOverlay: 0.1,
      cardStyle: 'minimal',
      iconShape: 'rounded',
      themeColor: 'sky',
      themeMode: 'light'
    }
  }
];
