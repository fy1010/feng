import React, { useState } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { ComparisonSlider } from './components/ComparisonSlider';
import { ProcessingStatus } from './types';
import { removeWatermark } from './services/geminiService';
import { Wand2, Loader2, X, AlertTriangle } from 'lucide-react';

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [status, setStatus] = useState<ProcessingStatus>(ProcessingStatus.IDLE);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [customInstruction, setCustomInstruction] = useState<string>("");
  const [fileData, setFileData] = useState<File | null>(null);

  const handleImageSelected = (base64: string, file: File) => {
    setOriginalImage(base64);
    setProcessedImage(null);
    setFileData(file);
    setStatus(ProcessingStatus.IDLE);
    setErrorMessage(null);
  };

  const handleReset = () => {
    setOriginalImage(null);
    setProcessedImage(null);
    setFileData(null);
    setStatus(ProcessingStatus.IDLE);
    setErrorMessage(null);
    setCustomInstruction("");
  };

  const handleProcess = async () => {
    if (!originalImage || !fileData) return;

    setStatus(ProcessingStatus.PROCESSING);
    setErrorMessage(null);

    try {
      const resultBase64 = await removeWatermark(originalImage, fileData.type, customInstruction);
      setProcessedImage(resultBase64);
      setStatus(ProcessingStatus.SUCCESS);
    } catch (error) {
      console.error(error);
      setStatus(ProcessingStatus.ERROR);
      setErrorMessage("处理图片时发生错误。请稍后重试或尝试不同的图片。");
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-800">
      <Header />

      <main className="flex-grow w-full max-w-6xl mx-auto px-4 py-8">
        
        {/* Intro Section - Only show when no image selected */}
        {!originalImage && (
          <div className="text-center mb-12 mt-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900">
              一键移除照片水印与文字
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              利用 Google Gemini 先进的 AI 视觉模型，智能识别并擦除图片上的 Logo、水印和不需要的文字，自动补全背景。
            </p>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden min-h-[500px]">
          
          {/* View Container */}
          <div className="p-6 md:p-8">
            {!originalImage ? (
              <ImageUploader onImageSelected={handleImageSelected} />
            ) : (
              <div className="flex flex-col gap-6">
                {/* Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4">
                  <h3 className="text-lg font-semibold">编辑工作区</h3>
                  <button 
                    onClick={handleReset}
                    className="text-sm text-gray-500 hover:text-red-500 flex items-center gap-1 transition-colors"
                    disabled={status === ProcessingStatus.PROCESSING}
                  >
                    <X className="w-4 h-4" /> 重新上传
                  </button>
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
                  {/* Left: Controls */}
                  <div className="lg:col-span-1 flex flex-col gap-6 order-2 lg:order-1">
                    <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                      <label className="block text-sm font-semibold text-blue-900 mb-2">
                        补充指令 (可选)
                      </label>
                      <textarea 
                        value={customInstruction}
                        onChange={(e) => setCustomInstruction(e.target.value)}
                        placeholder="例如：去除右上角的红色Logo，或者去除中间的日期水印..."
                        className="w-full text-sm p-3 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none h-24 bg-white"
                        disabled={status === ProcessingStatus.PROCESSING || status === ProcessingStatus.SUCCESS}
                      />
                      <p className="text-xs text-blue-600 mt-2">
                        默认情况下，AI 会自动检测并移除所有文字和水印。如果您有特定需求，请在此描述。
                      </p>
                    </div>

                    {status === ProcessingStatus.ERROR && (
                      <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <p className="text-sm">{errorMessage}</p>
                      </div>
                    )}

                    <button
                      onClick={handleProcess}
                      disabled={status === ProcessingStatus.PROCESSING || status === ProcessingStatus.SUCCESS}
                      className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-md
                        ${status === ProcessingStatus.PROCESSING 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : status === ProcessingStatus.SUCCESS
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5'
                        }
                      `}
                    >
                      {status === ProcessingStatus.PROCESSING ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" /> 正在处理...
                        </>
                      ) : status === ProcessingStatus.SUCCESS ? (
                        <>
                          <Wand2 className="w-5 h-5" /> 已完成
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-5 h-5" /> 开始去除水印
                        </>
                      )}
                    </button>
                    
                    {status === ProcessingStatus.SUCCESS && (
                       <button
                         onClick={() => {
                           setStatus(ProcessingStatus.IDLE);
                           setProcessedImage(null);
                         }}
                         className="w-full py-2 text-sm text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-200"
                       >
                         重新编辑这张图
                       </button>
                    )}
                  </div>

                  {/* Right: Preview/Result */}
                  <div className="lg:col-span-2 order-1 lg:order-2">
                    {status === ProcessingStatus.SUCCESS && processedImage ? (
                      <div className="animate-in fade-in duration-500">
                        <ComparisonSlider 
                          originalImage={originalImage} 
                          processedImage={processedImage} 
                        />
                      </div>
                    ) : (
                      <div className="relative w-full aspect-auto rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                         <img 
                          src={originalImage} 
                          alt="Original" 
                          className={`w-full h-full object-contain max-h-[600px] mx-auto ${status === ProcessingStatus.PROCESSING ? 'opacity-50 blur-sm scale-[0.99] transition-all duration-700' : ''}`}
                        />
                        {status === ProcessingStatus.PROCESSING && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl flex flex-col items-center gap-3">
                              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                              <p className="font-medium text-gray-700">AI 正在抹除水印...</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 text-center">
          <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600 font-bold text-xl">1</div>
            <h3 className="font-bold text-gray-900 mb-2">上传图片</h3>
            <p className="text-sm text-gray-500">支持各类常见的图片格式，自动识别图片内容。</p>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600 font-bold text-xl">2</div>
            <h3 className="font-bold text-gray-900 mb-2">AI 智能处理</h3>
            <p className="text-sm text-gray-500">Gemini 模型精准定位文字和水印，智能填充背景纹理。</p>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600 font-bold text-xl">3</div>
            <h3 className="font-bold text-gray-900 mb-2">下载结果</h3>
            <p className="text-sm text-gray-500">实时对比处理效果，一键下载干净清晰的无水印图片。</p>
          </div>
        </div>

      </main>

      <footer className="w-full py-8 border-t border-gray-200 bg-white mt-auto">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} ClearView AI. Powered by Google Gemini.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;