import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { Button } from './components/Button';
import { History } from './components/History';
import { BatchGrid } from './components/BatchGrid';
import { ZoomableImage } from './components/ZoomableImage';
import { LANGUAGES, ART_STYLES } from './constants';
import { generateSocialImage } from './services/geminiService';
import { GeneratedImage, GenerationStatus, LanguageOption } from './types';

function App() {
  const [status, setStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  
  // Configuration State
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption>(LANGUAGES[0]);
  const [customStyle, setCustomStyle] = useState<string>('');
  
  // Batch Mode State
  const [isBatchMode, setIsBatchMode] = useState<boolean>(false);
  const [batchCount, setBatchCount] = useState<number>(4);
  const [varyLanguage, setVaryLanguage] = useState<boolean>(false);
  const [batchImages, setBatchImages] = useState<GeneratedImage[]>([]);

  // Result State
  const [currentImage, setCurrentImage] = useState<GeneratedImage | null>(null);
  const [history, setHistory] = useState<GeneratedImage[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    setStatus(GenerationStatus.GENERATING);
    setErrorMsg(null);
    setBatchImages([]); // Clear previous batch view if any

    const generateSingle = async (lang: LanguageOption, style: string) => {
      const base64Url = await generateSocialImage(lang, style);
      return {
        id: Date.now().toString() + Math.random().toString().slice(2),
        url: base64Url,
        language: lang.name,
        style: style,
        timestamp: Date.now()
      } as GeneratedImage;
    };

    // Determine Style
    const getStyle = () => customStyle.trim() 
      ? customStyle 
      : ART_STYLES[Math.floor(Math.random() * ART_STYLES.length)];

    try {
      if (isBatchMode) {
        // BATCH GENERATION
        const promises = [];
        for (let i = 0; i < batchCount; i++) {
          let lang = selectedLanguage;
          if (varyLanguage) {
            // Pick a random language from the list
            lang = LANGUAGES[Math.floor(Math.random() * LANGUAGES.length)];
          }
          promises.push(generateSingle(lang, getStyle()));
        }

        const results = await Promise.allSettled(promises);
        const successfulImages: GeneratedImage[] = [];
        
        results.forEach(result => {
          if (result.status === 'fulfilled') {
            successfulImages.push(result.value);
          } else {
            console.error("Batch item failed", result.reason);
          }
        });

        if (successfulImages.length === 0) {
          throw new Error("All images in batch failed to generate.");
        }

        setBatchImages(successfulImages);
        setHistory(prev => [...successfulImages, ...prev]);
        // Set current image to the first one for context, but view will remain batch grid
        setCurrentImage(successfulImages[0]);
        setStatus(GenerationStatus.SUCCESS);

      } else {
        // SINGLE GENERATION
        const img = await generateSingle(selectedLanguage, getStyle());
        setCurrentImage(img);
        setHistory(prev => [img, ...prev]);
        setStatus(GenerationStatus.SUCCESS);
      }

    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || "Failed to generate image. Please try again.");
      setStatus(GenerationStatus.ERROR);
    }
  }, [selectedLanguage, customStyle, isBatchMode, batchCount, varyLanguage]);

  const downloadImage = () => {
    if (!currentImage) return;
    const link = document.createElement('a');
    link.href = currentImage.url;
    link.download = `Enuncia_${currentImage.language}_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const selectRandomLanguage = () => {
    const randomLang = LANGUAGES[Math.floor(Math.random() * LANGUAGES.length)];
    setSelectedLanguage(randomLang);
  };

  const handleBatchImageSelect = (img: GeneratedImage) => {
    setCurrentImage(img);
    // Switch off batch mode to view the single image details
    setIsBatchMode(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Error Notification */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-3 animate-fade-in">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Panel: Controls */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-2 h-6 bg-indigo-500 rounded-full"></span>
                  Configuration
                </h2>
                
                {/* Mode Toggle */}
                <div className="flex bg-slate-100 p-1 rounded-lg">
                  <button 
                    onClick={() => setIsBatchMode(false)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${!isBatchMode ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Single
                  </button>
                  <button 
                    onClick={() => setIsBatchMode(true)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${isBatchMode ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Batch
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                {isBatchMode && (
                   <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-semibold text-slate-700">Batch Size</label>
                        <span className="text-sm font-bold text-indigo-600 bg-white px-2 py-0.5 rounded shadow-sm">{batchCount}</span>
                      </div>
                      <input 
                        type="range" 
                        min="2" 
                        max="4" 
                        value={batchCount} 
                        onChange={(e) => setBatchCount(parseInt(e.target.value))}
                        className="w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                      
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          id="varyLanguage"
                          checked={varyLanguage}
                          onChange={(e) => setVaryLanguage(e.target.checked)}
                          className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
                        />
                        <label htmlFor="varyLanguage" className="text-sm text-slate-700 cursor-pointer select-none">
                          Randomize Languages
                        </label>
                      </div>
                      <p className="text-xs text-slate-500 leading-snug">
                        {varyLanguage 
                          ? `Generates ${batchCount} images in different random languages.`
                          : `Generates ${batchCount} images in ${selectedLanguage.name}.`
                        }
                      </p>
                   </div>
                )}

                {/* Language Selector */}
                <div className={isBatchMode && varyLanguage ? 'opacity-50 pointer-events-none' : ''}>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Target Language</label>
                  <div className="relative">
                    <select 
                      value={selectedLanguage.name}
                      onChange={(e) => {
                        const lang = LANGUAGES.find(l => l.name === e.target.value);
                        if (lang) setSelectedLanguage(lang);
                      }}
                      className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none appearance-none transition-all cursor-pointer"
                    >
                      {LANGUAGES.map(lang => (
                        <option key={lang.name} value={lang.name}>{lang.name}</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </div>
                  </div>
                  {!isBatchMode && (
                    <button 
                      onClick={selectRandomLanguage}
                      className="mt-2 text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16l5 5v-5"/></svg>
                      Pick Random Language
                    </button>
                  )}
                </div>

                {/* Style Input */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Artistic Style</label>
                  <input 
                    type="text"
                    value={customStyle}
                    onChange={(e) => setCustomStyle(e.target.value)}
                    placeholder="e.g. 'Cyberpunk' or leave empty for random"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    {['Minimalist', '3D Render', 'Watercolor'].map(tag => (
                      <button
                        key={tag}
                        onClick={() => setCustomStyle(tag)}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs rounded-full transition-colors"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button 
                    onClick={handleGenerate} 
                    isLoading={status === GenerationStatus.GENERATING}
                    className="w-full"
                  >
                    {isBatchMode ? (
                       <>
                         <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                         Generate Batch ({batchCount})
                       </>
                    ) : (
                       <>
                         <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                         Generate Image
                       </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Instructions Panel */}
            <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100">
              <h3 className="font-semibold text-indigo-900 mb-2">Tips for best results:</h3>
              <ul className="text-sm text-indigo-800/80 space-y-2 list-disc list-inside">
                <li>Leave style empty for AI creativity.</li>
                <li>Batch mode is great for exploring different aesthetics.</li>
                <li>Check "Randomize Languages" to see global variations quickly.</li>
              </ul>
            </div>
          </div>

          {/* Right Panel: Display */}
          <div className="lg:col-span-8 flex flex-col items-center">
            
            {/* Conditional Render: Batch Grid OR Single View */}
            {isBatchMode && (status === GenerationStatus.SUCCESS || status === GenerationStatus.GENERATING) ? (
               <div className="w-full max-w-[600px]">
                 <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-800">Batch Results</h3>
                    <span className="text-xs text-slate-500">Click an image to view details</span>
                 </div>
                 <BatchGrid 
                    images={batchImages} 
                    onSelect={handleBatchImageSelect} 
                    isLoading={status === GenerationStatus.GENERATING}
                    skeletonCount={batchCount}
                 />
               </div>
            ) : (
              <div className="w-full aspect-square max-w-[600px] bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden relative group">
                {currentImage ? (
                  <>
                    <ZoomableImage 
                      src={currentImage.url} 
                      alt="Generated Social Media Asset" 
                    />
                    <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex justify-between items-end z-30 pointer-events-none">
                      <div className="text-white">
                        <p className="font-bold text-lg">{currentImage.language}</p>
                        <p className="text-sm opacity-80">{currentImage.style}</p>
                      </div>
                      <Button onClick={downloadImage} variant="secondary" className="!py-2 !px-4 !text-sm pointer-events-auto">
                        Download PNG
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-slate-50/50">
                    <div className="w-20 h-20 mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    </div>
                    <p className="text-lg font-medium text-slate-500">Ready to create</p>
                    <p className="max-w-xs mx-auto mt-2 text-sm">Select a language and style on the left to generate your unique social media asset.</p>
                  </div>
                )}
                
                {status === GenerationStatus.GENERATING && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-40 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                    <p className="font-semibold text-slate-700 animate-pulse">Designing your asset...</p>
                    <p className="text-sm text-slate-500 mt-2">Integrating branding & culture</p>
                  </div>
                )}
              </div>
            )}
          </div>
          
        </div>

        <History images={history} onSelect={handleBatchImageSelect} />
      </main>
    </div>
  );
}

export default App;