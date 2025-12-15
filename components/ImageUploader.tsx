import React, { useRef, useState } from 'react';
import { UploadCloud, ImagePlus, AlertCircle } from 'lucide-react';

interface ImageUploaderProps {
  onImageSelected: (base64: string, file: File) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected }) => {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert("请上传图片文件");
      return;
    }
    
    // Limit size to avoid overwhelming browser/api for this demo (e.g. 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("图片大小不能超过 10MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        onImageSelected(e.target.result as string, file);
      }
    };
    reader.readAsDataURL(file);
  };

  const onButtonClick = () => {
    inputRef.current?.click();
  };

  return (
    <div 
      className={`relative w-full h-64 md:h-80 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all duration-200 ease-in-out cursor-pointer overflow-hidden group
        ${dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400"}
      `}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={onButtonClick}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept="image/png, image/jpeg, image/jpg, image/webp"
        onChange={handleChange}
      />

      <div className="flex flex-col items-center gap-4 text-center px-4">
        <div className={`p-4 rounded-full transition-colors ${dragActive ? "bg-blue-100" : "bg-gray-100 group-hover:bg-gray-200"}`}>
          {dragActive ? (
             <UploadCloud className="w-8 h-8 text-blue-600" />
          ) : (
             <ImagePlus className="w-8 h-8 text-gray-500" />
          )}
        </div>
        
        <div>
          <p className="text-lg font-medium text-gray-700">
            点击或拖拽图片到这里
          </p>
          <p className="text-sm text-gray-500 mt-1">
            支持 JPG, PNG, WEBP (最大 10MB)
          </p>
        </div>
      </div>
      
      {/* Decorative prompt */}
      <div className="absolute bottom-4 flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100">
        <AlertCircle className="w-3 h-3" />
        <span>建议上传包含清晰水印的图片</span>
      </div>
    </div>
  );
};