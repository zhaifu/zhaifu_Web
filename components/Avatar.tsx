import React, { useState, useEffect } from 'react';
import { stringToColor, getFirstChar } from '../utils';
import { AppSettings } from '../types';

interface AvatarProps {
  title: string;
  url: string;
  settings: AppSettings;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ title, url, settings, className }) => {
  const [hasError, setHasError] = useState(false);
  
  // Extract hostname
  let hostname = '';
  try {
    hostname = new URL(url).hostname;
  } catch (e) {
    hostname = 'unknown';
  }

  // 使用 unavatar.io 并设置 fallback=false
  // 当找不到图标时，它会返回 404，从而触发 onError
  const faviconUrl = `https://unavatar.io/${hostname}?fallback=false`;
  
  const shapeClass = 
    settings.iconShape === 'circle' ? 'rounded-full' : 
    settings.iconShape === 'rounded' ? 'rounded-xl' : 
    'rounded-none';

  // 当 URL 变化时重置错误状态，重新尝试加载图片
  useEffect(() => {
    setHasError(false);
  }, [url]);

  // 1. 如果图片加载失败，显示文字头像 (Fallback)
  if (hasError) {
    const displayText = title || hostname;
    const bgColor = stringToColor(displayText);
    const char = getFirstChar(displayText);

    return (
      <div 
        className={`shrink-0 flex items-center justify-center text-white font-bold text-xl shadow-sm select-none transition-all duration-300 w-12 h-12 ${shapeClass} ${className}`}
        style={{ 
          backgroundColor: bgColor,
          textShadow: '0 1px 2px rgba(0,0,0,0.15)',
        }}
        aria-hidden="true"
      >
        {char}
      </div>
    );
  }

  // 2. 默认：显示 Favicon 图片
  // 不渲染底层的文字头像，确保加载过程中没有文字闪烁
  return (
    <div className={`relative shrink-0 w-12 h-12 bg-gray-100/10 dark:bg-white/5 ${shapeClass} ${className}`}>
      <img 
        src={faviconUrl}
        alt={title}
        onError={() => setHasError(true)}
        loading="lazy"
        className={`w-full h-full object-cover ${shapeClass}`}
      />
    </div>
  );
};