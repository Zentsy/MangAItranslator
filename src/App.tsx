import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useTranslation } from "react-i18next";
import MangaBackground from "@/components/MangaBackground";
import EditorView from "@/components/EditorView";
import FileUpload from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import CyberLoading from "@/components/CyberLoading";
import { useMangaStore } from "@/store/useMangaStore";
import { Cpu, LayoutGrid, FileImage, Settings, MonitorCheck, ShieldAlert, Key } from "lucide-react";

function App() {
  const { t } = useTranslation();
  const [ollamaStatus, setOllamaStatus] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'editor'>('dashboard');
  const { apiKey, setApiKey } = useMangaStore();

  async function checkOllama() {
    try {
      const status = await invoke<boolean>("check_ollama_status");
      setOllamaStatus(status);
    } catch (e) {
      setOllamaStatus(false);
    }
  }

  useEffect(() => {
    checkOllama();
  }, []);

  return (
    <MangaBackground>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className="w-20 border-r border-white/10 flex flex-col items-center py-8 gap-8 bg-black/40 backdrop-blur-md relative z-20">
          <div className="w-12 h-12 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center mb-4">
            <span className="text-xl font-bold italic tracking-tighter">MA</span>
          </div>
          
          <nav className="flex flex-col gap-6 flex-1">
            <Button variant="ghost" size="icon" onClick={() => setCurrentView('dashboard')} className={`hover:bg-white/5 transition-all ${currentView === 'dashboard' ? 'text-white bg-white/10' : 'text-white/50'}`}>
              <LayoutGrid size={24} />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setCurrentView('editor')} className={`hover:bg-white/5 transition-all ${currentView === 'editor' ? 'text-white bg-white/10' : 'text-white/50'}`}>
              <FileImage size={24} />
            </Button>
          </nav>

          <Button variant="ghost" size="icon" className="hover:bg-white/5 text-white/50 hover:text-white mt-auto">
            <Settings size={24} />
          </Button>
        </aside>

        {/* Main Area */}
        <div className="flex-1 relative overflow-hidden">
          {currentView === 'dashboard' ? (
            <main className="h-full flex flex-col p-8 relative">
              <header className="flex justify-between items-center mb-12">
                <div>
                  <h1 className="text-4xl font-black uppercase tracking-tighter italic">{t('dashboard.title')} <span className="text-white/40">Translator</span></h1>
                  <p className="text-white/40 text-sm font-mono tracking-widest mt-1 uppercase">{t('dashboard.subtitle')}</p>
                </div>

                <div className="flex gap-4">
                   {/* API Key Input */}
                   <div className="flex items-center gap-2 px-4 py-1 bg-white/5 border border-white/10 rounded-full">
                      <Key size={14} className="text-white/40" />
                      <input 
                        type="password" 
                        placeholder="Gemini API Key"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="bg-transparent border-none outline-none text-[10px] w-32 font-mono text-white/80 placeholder:text-white/20"
                      />
                   </div>

                  <div className={`flex items-center gap-3 px-4 py-2 rounded-full border ${ollamaStatus ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-500' : 'border-rose-500/20 bg-rose-500/5 text-rose-500'} transition-all`}>
                    <span className="text-xs font-bold uppercase tracking-widest">Ollama: {ollamaStatus ? t('common.online') : t('common.offline')}</span>
                  </div>
                </div>
              </header>

              <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FileUpload onSuccess={() => setCurrentView('editor')} />
                
                <div className="group relative p-6 bg-white/5 border border-white/10 rounded-2xl opacity-50">
                   <h3 className="text-xl font-bold mb-2 uppercase italic">{t('dashboard.history.title')}</h3>
                   <p className="text-sm text-white/40 leading-relaxed">{t('dashboard.history.description')}</p>
                </div>
              </section>
            </main>
          ) : (
            <div className="h-full p-4">
              <EditorView onBack={() => setCurrentView('dashboard')} />
            </div>
          )}
        </div>
      </div>
    </MangaBackground>
  );
}

export default App;