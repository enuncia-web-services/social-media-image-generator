import React from 'react';
import { GeneratedImage } from '../types';

interface BatchGridProps {
  images: GeneratedImage[];
  onSelect: (image: GeneratedImage) => void;
  isLoading?: boolean;
  skeletonCount?: number;
}

export const BatchGrid: React.FC<BatchGridProps> = ({ 
  images, 
  onSelect, 
  isLoading, 
  skeletonCount = 4 
}) => {
  const displayItems = isLoading 
    ? Array(skeletonCount).fill(null) 
    : images;

  return (
    <div className="grid grid-cols-2 gap-4 w-full h-full min-h-[400px] animate-fade-in">
      {displayItems.map((img, idx) => (
        <div 
          key={img?.id || idx} 
          className={`relative group aspect-square rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm ${isLoading ? 'animate-pulse' : 'cursor-pointer hover:ring-2 hover:ring-indigo-500 transition-all'}`}
          onClick={() => img && onSelect(img)}
        >
          {img ? (
            <>
              <img src={img.url} alt={img.language} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white font-medium bg-black/50 px-3 py-1 rounded-full text-sm backdrop-blur-sm">View Details</span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                <p className="text-white text-xs font-bold truncate">{img.language}</p>
              </div>
            </>
          ) : (
            <div className="w-full h-full bg-slate-100 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full border-2 border-slate-300 border-t-indigo-500 animate-spin"></div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};