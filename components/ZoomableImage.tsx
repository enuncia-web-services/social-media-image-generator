import React, { useState, useRef, useEffect } from 'react';

interface ZoomableImageProps {
  src: string;
  alt: string;
}

export const ZoomableImage: React.FC<ZoomableImageProps> = ({ src, alt }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset zoom when src changes
  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [src]);

  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
    // Only intercept if we are hovering over the container
    if (e.deltaY !== 0) {
      const scaleAdjustment = -e.deltaY * 0.001;
      const newScale = Math.min(Math.max(1, scale + scaleAdjustment), 5);
      setScale(newScale);
      
      // If zooming out to 1, reset position
      if (newScale === 1) {
        setPosition({ x: 0, y: 0 });
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      e.preventDefault();
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const zoomIn = (e?: React.MouseEvent) => {
    e?.stopPropagation(); 
    setScale(prev => Math.min(prev + 0.5, 5));
  };

  const zoomOut = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const newScale = Math.max(1, scale - 0.5);
    setScale(newScale);
    if (newScale === 1) setPosition({ x: 0, y: 0 });
  };
  
  const reset = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div 
      ref={containerRef}
      className={`w-full h-full overflow-hidden relative bg-slate-100 ${scale > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div 
        style={{ 
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transition: isDragging ? 'none' : 'transform 0.2s ease-out',
          transformOrigin: 'center',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <img 
          src={src} 
          alt={alt} 
          className="max-w-full max-h-full object-contain pointer-events-none select-none"
          draggable={false}
        />
      </div>

      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm border border-slate-200 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-20">
        <button 
          onClick={zoomIn}
          className="p-1.5 hover:bg-slate-100 rounded text-slate-700 transition-colors"
          title="Zoom In"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
        </button>
        <button 
          onClick={zoomOut}
          className="p-1.5 hover:bg-slate-100 rounded text-slate-700 transition-colors"
          title="Zoom Out"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
        </button>
        <button 
          onClick={reset}
          className="p-1.5 hover:bg-slate-100 rounded text-slate-700 transition-colors"
          title="Reset"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
        </button>
      </div>
    </div>
  );
};