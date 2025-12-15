import React, { useState, useRef } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { ComparisonSlider } from './components/ComparisonSlider';
import { ImageCanvas, ImageCanvasHandle } from './components/ImageCanvas';
import { ProcessingStatus } from './types';
import { editImage, EditMode } from './services/geminiService';
import { Wand2, Loader2, X, AlertTriangle, Eraser, Type, Image as ImageIcon } from 'lucide-react';

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [status, setStatus] = useState<ProcessingStatus>(ProcessingStatus.IDLE);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [customInstruction, setCustomInstruction] = useState<string>("");
  const [fileData, setFileData] = useState<File | null>(null);
  
  const [editMode, setEditMode] = useState<EditMode>('general');
  const canvasRef = useRef<ImageCanvasHandle>(null);

  const handleImageSelected = (base64: string, file: File) => {
    setOriginalImage(base64);
    setProcessedImage(null);
    setFileData(file);
    setStatus(ProcessingStatus.IDLE);
    setErrorMessage(null);
    setEditMode('general'); // Default to general mode
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
      let imageToSend = originalImage;
      
      // If in eraser mode, get the image with red marks from canvas
      if (editMode === 'eraser' && canvasRef.current) {
         const canvasData = canvasRef.current.getCanvasData();
         if (canvasData) {
            imageToSend = canvasData;
         }
      }

      const resultBase64 = await editImage(imageToSend, fileData.type, editMode, customInstruction);
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
              AI 智能图片编辑与修复
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              利用 Google Gemini 2.5 视觉模型，不仅可以移除水印，还能通过文字指令修图，或使用消除笔精准去除背景杂物。
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
                  <div className="flex items-center gap-4">
                     <h3 className="text-lg font-semibold">编辑工作区</h3>
                     
                     {/* Mode Selector */}
                     {status !== ProcessingStatus.SUCCESS && (
                       <div className="flex bg-gray-100 p-1 rounded-lg">
                          <button
                            onClick={() => setEditMode('general')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${editMode === 'general' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            disabled={status === ProcessingStatus.PROCESSING}
                          >
                            <Type className="w-4 h-4" /> 通用/文字编辑
                          </button>
                          <button
                            onClick={() => setEditMode('eraser')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${editMode === 'eraser' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            disabled={status === ProcessingStatus.PROCESSING}
                          >
                            <Eraser className="w-4 h-4" /> 智能消除笔
                          </button>
                       </div>
                     )}
                  </div>

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
                    
                    {editMode === 'general' ? (
                      <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                        <label className="block text-sm font-semibold text-blue-900 mb-2">
                          AI 编辑指令
                        </label>
                        <textarea 
                          value={customInstruction}
                          onChange={(e) => setCustomInstruction(e.target.value)}
                          placeholder="输入指令，例如：
- 去除图片中的所有文字和Logo
- 将背景改为更梦幻的夕阳风格
- 去除背景中的路人
- 增加一点复古胶片滤镜效果"
                          className="w-full text-sm p-3 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none h-40 bg-white"
                          disabled={status === ProcessingStatus.PROCESSING || status === ProcessingStatus.SUCCESS}
                        />
                        <p className="text-xs text-blue-600 mt-2">
                          如果不输入指令，默认执行“智能去水印”操作。
                        </p>
                      </div>
                    ) : (
                      <div className="bg-amber-50 p-5 rounded-xl border border-amber-100">
                        <h4 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                          <Eraser className="w-4 h-4" /> 使用说明
                        </h4>
                        <p className="text-sm text-amber-800 leading-relaxed">
                          在右侧图片上使用鼠标或手指涂抹您想要移除的区域（将会显示为红色）。
                          <br/><br/>
                          AI 将会自动识别红色区域，移除该物体并自动补全背景。
                        </p>
                      </div>
                    )}

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
                          <Wand2 className="w-5 h-5" /> 
                          {editMode === 'eraser' ? '消除选中区域' : '开始 AI 处理'}
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
                      <div className="relative w-full aspect-auto rounded-xl overflow-hidden bg-gray-50 border border-gray-200 min-h-[300px] flex items-center justify-center">
                        
                        {editMode === 'eraser' ? (
                           <div className={status === ProcessingStatus.PROCESSING ? 'opacity-50 blur-sm pointer-events-none' : ''}>
                              <ImageCanvas 
                                ref={canvasRef} 
                                imageSrc={originalImage} 
                              />
                           </div>
                        ) : (
                           <img 
                            src={originalImage} 
                            alt="Original" 
                            className={`w-full h-full object-contain max-h-[600px] mx-auto ${status === ProcessingStatus.PROCESSING ? 'opacity-50 blur-sm scale-[0.99] transition-all duration-700' : ''}`}
                          />
                        )}

                        {status === ProcessingStatus.PROCESSING && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl flex flex-col items-center gap-3">
                              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                              <p className="font-medium text-gray-700">AI 正在处理...</p>
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
            <h3 className="font-bold text-gray-900 mb-2">多模式编辑</h3>
            <p className="text-sm text-gray-500">支持“智能消除笔”手动涂抹，或使用文字指令进行创意修改。</p>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600 font-bold text-xl">2</div>
            <h3 className="font-bold text-gray-900 mb-2">Gemini 2.5 Flash</h3>
            <p className="text-sm text-gray-500">最新的 AI 视觉模型，理解复杂的自然语言指令和图像内容。</p>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600 font-bold text-xl">3</div>
            <h3 className="font-bold text-gray-900 mb-2">背景一致性</h3>
            <p className="text-sm text-gray-500">移除物体后自动补全背景，确保画面光影和纹理自然统一。</p>
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