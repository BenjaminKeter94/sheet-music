
import React, { useState, useRef } from 'react';
import { 
  Music, 
  Settings, 
  Sparkles, 
  RotateCcw, 
  Download, 
  Hand,
  Layers,
  Info,
  ChevronRight,
  Loader2,
  Piano,
  Upload,
  Type as TypeIcon,
  X,
  FileImage
} from 'lucide-react';
import SheetMusicRenderer from './components/SheetMusicRenderer';
import { morphMusic } from './services/geminiService';
import { 
  DifficultyLevel, 
  MusicalStyle, 
  HandSize, 
  ArrangementConfig, 
  ArrangementResult 
} from './types';
import { DIFFICULTY_LABELS, INITIAL_ABC } from './constants';

const App: React.FC = () => {
  const [inputMethod, setInputMethod] = useState<'text' | 'image'>('image');
  const [inputAbc, setInputAbc] = useState<string>(INITIAL_ABC);
  const [inputImage, setInputImage] = useState<string | null>(null);
  const [morphedAbc, setMorphedAbc] = useState<string>(INITIAL_ABC);
  const [config, setConfig] = useState<ArrangementConfig>({
    difficulty: 3,
    style: 'Original',
    handSize: 'Standard',
    title: 'Piano Arrangement'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [resultMeta, setResultMeta] = useState<ArrangementResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setInputImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMorph = async () => {
    setIsLoading(true);
    try {
      const sourceData = inputMethod === 'image' && inputImage ? inputImage : inputAbc;
      const result = await morphMusic(sourceData, inputMethod === 'image' && !!inputImage, config);
      setMorphedAbc(result.abcNotation);
      setResultMeta(result);
    } catch (error: any) {
      console.error("Morphing failed", error);
      if (error?.message?.includes("Requested entity was not found.") && (window as any).aistudio?.openSelectKey) {
        await (window as any).aistudio.openSelectKey();
      } else {
        alert("Failed to morph music. Ensure your image is clear or ABC notation is valid.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMorphedAbc(inputAbc);
    setResultMeta(null);
    setInputImage(null);
  };

  const downloadAbc = () => {
    const element = document.createElement("a");
    const file = new Blob([morphedAbc], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${config.title || 'piano-arrangement'}.abc`;
    document.body.appendChild(element);
    element.click();
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#fbfbfb]">
      {/* Sidebar Controls */}
      <aside className="w-full lg:w-96 bg-white border-r border-stone-200 p-6 overflow-y-auto max-h-screen sticky top-0 shadow-sm z-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-stone-900 p-2 rounded-lg text-white shadow-md">
            <Piano size={24} />
          </div>
          <div>
            <h1 className="text-xl font-serif font-bold tracking-tight text-stone-900">Piano Morph</h1>
            <p className="text-[10px] text-stone-500 uppercase tracking-widest font-bold">Studio Arranger</p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Input Toggle */}
          <section>
            <div className="flex bg-stone-100 p-1 rounded-lg mb-4">
              <button 
                onClick={() => setInputMethod('image')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-md transition-all ${inputMethod === 'image' ? 'bg-white shadow-sm text-stone-900' : 'text-stone-400 hover:text-stone-600'}`}
              >
                <FileImage size={14} /> Scan Sheet
              </button>
              <button 
                onClick={() => setInputMethod('text')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-md transition-all ${inputMethod === 'text' ? 'bg-white shadow-sm text-stone-900' : 'text-stone-400 hover:text-stone-600'}`}
              >
                <TypeIcon size={14} /> ABC Text
              </button>
            </div>

            {inputMethod === 'image' ? (
              <div 
                onClick={() => !inputImage && fileInputRef.current?.click()}
                className={`relative group border-2 border-dashed rounded-xl p-6 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[160px] ${inputImage ? 'border-stone-200' : 'border-stone-300 hover:border-stone-900 bg-stone-50'}`}
              >
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                
                {inputImage ? (
                  <div className="relative w-full h-full">
                    <img src={inputImage} alt="Sheet music source" className="w-full h-32 object-cover rounded-lg shadow-sm" />
                    <button 
                      onClick={(e) => { e.stopPropagation(); setInputImage(null); }}
                      className="absolute -top-2 -right-2 p-1 bg-stone-900 text-white rounded-full shadow-lg hover:bg-black transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="bg-stone-200 p-3 rounded-full mb-3 text-stone-500 group-hover:scale-110 transition-transform">
                      <Upload size={20} />
                    </div>
                    <p className="text-sm font-bold text-stone-900">Upload Sheet Music</p>
                    <p className="text-[10px] text-stone-400 mt-1">JPEG, PNG supported</p>
                  </>
                )}
              </div>
            ) : (
              <textarea 
                value={inputAbc}
                onChange={(e) => setInputAbc(e.target.value)}
                className="w-full h-32 p-3 text-xs font-mono bg-stone-50 border border-stone-200 rounded-lg focus:ring-1 focus:ring-stone-900 outline-none resize-none"
                placeholder="Paste ABC piano notation..."
              />
            )}
          </section>

          {/* Difficulty Slider */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-semibold uppercase tracking-wider text-stone-500 flex items-center gap-2">
                <Layers size={16} /> Difficulty
              </label>
              <span className="text-xs font-bold bg-stone-900 px-2 py-1 rounded text-white">
                Lv. {config.difficulty}
              </span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="5" 
              step="1"
              value={config.difficulty}
              onChange={(e) => setConfig({...config, difficulty: parseInt(e.target.value) as DifficultyLevel})}
              className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-900"
            />
            <p className="mt-2 text-sm text-stone-700 font-medium italic">
              {DIFFICULTY_LABELS[config.difficulty]}
            </p>
          </section>

          {/* Style Swapper */}
          <section>
            <label className="text-sm font-semibold uppercase tracking-wider text-stone-500 flex items-center gap-2 mb-4">
              <Sparkles size={16} /> Genre & Era
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['Original', 'Classical', 'Jazz Swing', 'Lo-fi Chill', 'Cinematic', 'Pop Ballad'] as MusicalStyle[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setConfig({...config, style: s})}
                  className={`px-3 py-2 text-xs font-bold rounded-md border transition-all uppercase tracking-tighter ${
                    config.style === s 
                      ? 'bg-stone-900 border-stone-900 text-white shadow-md scale-105' 
                      : 'bg-white border-stone-200 text-stone-500 hover:border-stone-400'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </section>

          {/* Hand Size Optimization */}
          <section>
            <label className="text-sm font-semibold uppercase tracking-wider text-stone-500 flex items-center gap-2 mb-4">
              <Hand size={16} /> Reach Optimization
            </label>
            <div className="space-y-2">
              {(['Standard', 'Small (Max Octave)', 'Petite (Max 7th)'] as HandSize[]).map((h) => (
                <button
                  key={h}
                  onClick={() => setConfig({...config, handSize: h})}
                  className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-all flex items-center justify-between ${
                    config.handSize === h
                      ? 'border-stone-900 bg-stone-50 text-stone-900 font-bold'
                      : 'border-stone-100 bg-white text-stone-500'
                  }`}
                >
                  {h}
                  {config.handSize === h && <div className="w-2 h-2 rounded-full bg-stone-900" />}
                </button>
              ))}
            </div>
          </section>

          <div className="pt-4 space-y-3 pb-8">
            <button 
              onClick={handleMorph}
              disabled={isLoading || (inputMethod === 'image' && !inputImage)}
              className="w-full bg-stone-900 hover:bg-black disabled:bg-stone-300 text-white font-bold py-4 rounded-xl shadow-xl transition-all flex items-center justify-center gap-2 group"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />
                  Apply Arrangement
                </>
              )}
            </button>
            <button 
              onClick={handleReset}
              className="w-full bg-white border border-stone-200 text-stone-600 font-medium py-3 rounded-xl hover:bg-stone-50 transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw size={18} />
              Restore Original
            </button>
          </div>
        </div>
      </aside>

      {/* Main Display Area */}
      <main className="flex-1 p-6 md:p-10 lg:p-12 overflow-y-auto">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 text-stone-500 font-bold text-[10px] uppercase tracking-widest mb-2">
              <span>Studio Workspace</span>
              <ChevronRight size={10} />
              <span className="text-stone-900">Piano Score</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 leading-tight">
              {config.title}
            </h2>
            <div className="flex flex-wrap items-center gap-3 mt-6">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-stone-100 text-stone-700 text-[10px] font-black rounded border border-stone-200 uppercase">
                <Music size={12} /> {config.style}
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-stone-100 text-stone-700 text-[10px] font-black rounded border border-stone-200 uppercase">
                <Layers size={12} /> Level {config.difficulty}
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-stone-100 text-stone-700 text-[10px] font-black rounded border border-stone-200 uppercase">
                <Hand size={12} /> {config.handSize}
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={downloadAbc}
              className="flex items-center gap-2 bg-stone-900 text-white px-6 py-3 rounded-xl text-sm font-bold hover:shadow-lg transition-all active:scale-95"
            >
              <Download size={18} /> Export Score
            </button>
          </div>
        </header>

        {/* Sheet Music Rendering */}
        <div className="max-w-5xl mx-auto space-y-8">
          <SheetMusicRenderer abcNotation={morphedAbc} />

          {resultMeta && (
            <div className="grid md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm">
                <h4 className="flex items-center gap-2 text-stone-900 font-black text-sm uppercase tracking-widest mb-4">
                  <Sparkles size={16} className="text-stone-900" />
                  Pedagogical Notes
                </h4>
                <p className="text-stone-600 text-sm leading-relaxed font-medium">
                  {resultMeta.explanation}
                </p>
              </div>
              <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm">
                <h4 className="flex items-center gap-2 text-stone-900 font-black text-sm uppercase tracking-widest mb-4">
                  <Info size={16} className="text-stone-400" />
                  Score Composition
                </h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-end border-b border-stone-100 pb-2">
                    <span className="text-[10px] text-stone-400 font-black uppercase">Arrangement Reach</span>
                    <span className="text-sm text-stone-900 font-bold">{resultMeta.metadata.complexity}</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] text-stone-400 font-black uppercase">Technical Focus</span>
                    <span className="text-sm text-stone-900 font-bold text-right max-w-[200px]">{resultMeta.metadata.styleNotes}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!resultMeta && !isLoading && morphedAbc === INITIAL_ABC && (
            <div className="bg-stone-50 border border-stone-100 p-12 rounded-[2rem] text-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-md border border-stone-100">
                <Piano className="text-stone-900" size={32} />
              </div>
              <h3 className="text-2xl font-serif font-bold text-stone-900 mb-3">Professional Piano Rescoring</h3>
              <p className="text-stone-500 max-w-lg mx-auto text-sm font-medium leading-relaxed">
                Upload an image of your sheet music or paste ABC notation to transform the piece. 
                Our AI considers your unique hand size, skill level, and stylistic preferences.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
