import React, { useState, useRef, useEffect } from 'react';
import { Download } from 'lucide-react';

interface ComparisonSliderProps {
  originalImage: string;
  processedImage: string;
}

export const ComparisonSlider: React.FC<ComparisonSliderProps> = ({ originalImage, processedImage }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = () => setIsResizing(true);
  
  const handleMouseUp = () => setIsResizing(false);

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percentage = (x / rect.width) * 100;
    
    setSliderPosition(percentage);
  };

  const handleTouchMove = (e: TouchEvent) => {
     if (!isResizing || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const touchX = e.touches[0].clientX;
    const x = Math.max(0, Math.min(touchX - rect.left, rect.width));
    const percentage = (x / rect.width) * 100;
    setSliderPosition(percentage);
  }

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isResizing]);

  const downloadImage = () => {
    const link = document.createElement('a');
    link.href = processedImage;
    link.download = 'clearview-result.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <div 
        ref={containerRef}
        className="relative w-full aspect-video bg-gray-200 rounded-xl overflow-hidden select-none shadow-lg"
      >
        {/* Processed Image (Background) */}
        <img 
          src={processedImage} 
          alt="After" 
          className="absolute top-0 left-0 w-full h-full object-contain bg-white" 
        />
        
        <div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-xs font-bold pointer-events-none">
          处理后
        </div>

        {/* Original Image (Foreground, clipped) */}
        <div 
          className="absolute top-0 left-0 h-full overflow-hidden bg-white"
          style={{ width: `${sliderPosition}%` }}
        >
          <img 
            src={originalImage} 
            alt="Before" 
            className="absolute top-0 left-0 max-w-none h-full"
            style={{ width: containerRef.current ? `${containerRef.current.offsetWidth}px` : '100%' }}
             // Note: In a real robust app, we'd handle aspect ratio scaling better, 
             // but object-contain on both ensures alignment if container matches aspect.
             // For this demo, we assume the user uploads reasonably standard images or we force object-fit.
             // A better approach for exact alignment is usually background-image or strict width/height matching.
             // Let's refine the styling to ensure alignment:
          />
           <div className="absolute top-4 left-4 bg-black/50 text-white px-2 py-1 rounded text-xs font-bold pointer-events-none">
            原图
          </div>
        </div>

        {/* Slider Handle */}
        <div 
          className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-10 shadow-[0_0_10px_rgba(0,0,0,0.5)]"
          style={{ left: `${sliderPosition}%` }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center">
            <div className="flex gap-[2px]">
              <div className="w-[2px] h-3 bg-gray-400"></div>
              <div className="w-[2px] h-3 bg-gray-400"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
         <div className="text-sm text-gray-500">
            拖动滑块对比效果
         </div>
         <button 
           onClick={downloadImage}
           className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
         >
            <Download className="w-4 h-4" />
            下载无水印图片
         </button>
      </div>
    </div>
  );
};