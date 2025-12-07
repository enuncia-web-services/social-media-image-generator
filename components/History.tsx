import React from 'react';
import { GeneratedImage } from '../types';

interface HistoryProps {
  images: GeneratedImage[];
  onSelect: (image: GeneratedImage) => void;
}

export const History: React.FC<HistoryProps> = ({ images, onSelect }) => {
  if (images.length === 0) return null;

  return (
    <div className="mt-12 w-full max-w-6xl mx-auto">
      <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <span className="bg-indigo-100 text-indigo-600 p-1.5 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20v-6M6 20V10M18 20V4"/></svg>
        </span>
        Recent Generations
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {images.map((img) => (
          <button 
            key={img.id}
            onClick={() => onSelect(img)}
            className="group relative aspect-square rounded-xl overflow-hidden border border-slate-200 hover:ring-2 hover:ring-indigo-500 transition-all focus:outline-none"
          >
            <img 
              src={img.url} 
              alt={img.language} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 text-left">
              <span className="text-white font-bold text-sm">{img.language}</span>
              <span className="text-white/80 text-xs truncate">{img.style}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};