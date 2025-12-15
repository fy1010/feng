import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Eraser, Undo2 } from 'lucide-react';

interface ImageCanvasProps {
  imageSrc: string;
}

export interface ImageCanvasHandle {
  getCanvasData: () => string | null;
}

export const ImageCanvas = forwardRef<ImageCanvasHandle, ImageCanvasProps>(({ imageSrc }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Store the image object to redraw if needed
  const imageObjRef = useRef<HTMLImageElement | null>(null);

  // Initialize Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.src = imageSrc;
    img.crossOrigin = "anonymous";
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      imageObjRef.current = img;
      setImageLoaded(true);
    };
  }, [imageSrc]);

  // Expose method to parent
  useImperativeHandle(ref, () => ({
    getCanvasData: () => {
      return canvasRef.current?.toDataURL('image/png') || null;
    }
  }));

  const getCoordinates = (event: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX, clientY;
    if ('touches' in event) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = (event as React.MouseEvent).clientX;
      clientY = (event as React.MouseEvent).clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault(); // Prevent scrolling on touch
    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = Math.max(10, (canvasRef.current?.width || 1000) / 30); // Dynamic brush size
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)'; // Red semi-transparent brush
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();

    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) ctx.closePath();
  };

  const clearDrawing = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!canvas || !ctx || !imageObjRef.current) return;

    // Clear and redraw original image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imageObjRef.current, 0, 0);
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <div 
        ref={containerRef}
        className="relative w-full bg-gray-100 rounded-xl overflow-hidden border border-gray-200 cursor-crosshair touch-none"
      >
        <canvas
          ref={canvasRef}
          className="w-full h-auto block max-h-[600px] object-contain mx-auto"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        {!imageLoaded && <div className="absolute inset-0 flex items-center justify-center">Loading...</div>}
        
        <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm pointer-events-none flex items-center gap-2">
            <Eraser className="w-3 h-3" />
            涂抹红色以消除物体
        </div>
      </div>
      
      <div className="flex justify-end">
        <button 
          onClick={clearDrawing}
          className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Undo2 className="w-4 h-4" /> 清除笔迹
        </button>
      </div>
    </div>
  );
});

ImageCanvas.displayName = "ImageCanvas";