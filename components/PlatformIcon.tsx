
import React from 'react';
import { Twitter, Facebook, Instagram, Linkedin, Youtube, MapPin, AtSign, Share2, Layers } from 'lucide-react';
import { Platform } from '../types';

interface PlatformIconProps {
  platform: Platform | 'All' | string;
  size?: number;
  className?: string;
  white?: boolean; // Force white color for active states if needed
}

export const PlatformIcon: React.FC<PlatformIconProps> = ({ platform, size = 18, className = '', white = false }) => {
  const getColorClass = (p: string) => {
    if (white) return 'text-white';
    switch (p) {
      case Platform.Twitter: return 'text-blue-400';
      case Platform.Facebook: return 'text-blue-600';
      case Platform.Instagram: return 'text-pink-600';
      case Platform.LinkedIn: return 'text-blue-700';
      case Platform.YouTube: return 'text-red-600';
      case Platform.GoogleBusiness: return 'text-blue-600';
      case Platform.Threads: return 'text-slate-900';
      case 'All': return 'text-slate-600';
      default: return 'text-slate-400';
    }
  };

  const colorClass = getColorClass(platform as string);
  const finalClass = `${colorClass} ${className}`;

  switch (platform) {
    case Platform.Twitter:
      return <Twitter size={size} className={finalClass} />;
    case Platform.Facebook:
      return <Facebook size={size} className={finalClass} />;
    case Platform.Instagram:
      return <Instagram size={size} className={finalClass} />;
    case Platform.LinkedIn:
      return <Linkedin size={size} className={finalClass} />;
    case Platform.YouTube:
      return <Youtube size={size} className={finalClass} />;
    case Platform.GoogleBusiness:
      return <MapPin size={size} className={finalClass} />;
    case Platform.Threads:
      return <AtSign size={size} className={finalClass} />;
    case 'All':
      return <Layers size={size} className={finalClass} />;
    default:
      return <Share2 size={size} className={finalClass} />;
  }
};
