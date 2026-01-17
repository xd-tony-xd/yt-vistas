import { useEffect, useState } from 'react';
import { supabase } from "./supabase";
import Wallet from './components/Wallet';
import Campaigns from './components/Campaigns';
import MyCampaigns from './components/MyCampaigns';
import WatchVideo from './components/WatchVideo';
import UploadVideo from './components/UploadVideo';
import Shop from './components/Shop'; // 1. IMPORTAMOS LA TIENDA

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [view, setView] = useState('browse');

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        await supabase.auth.signOut();
        setUser(null);
      } else {
        setUser(session?.user ?? null);
      }
      setLoading(false);
    };
    checkUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="font-black text-indigo-600 animate-pulse text-lg">Cargando Comunidad...</p>
    </div>
  );

  if (!user) return (
    <div className="h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-white to-indigo-50">
      <div className="text-center mb-10">
        <div className="inline-block bg-indigo-600 text-white px-4 py-1 rounded-full text-[10px] font-black tracking-widest mb-4">
          COMUNIDAD REAL
        </div>
        <h1 className="text-6xl font-black italic text-gray-900 mb-4 tracking-tighter">
          YT-<span className="text-indigo-600 text-shadow-sm">BOOST</span>
        </h1>
        <p className="text-gray-500 max-w-xs mx-auto text-lg leading-tight">
          Apoyémonos entre creadores <br />
          <span className="text-indigo-600 font-bold">Sin publicidad, solo vistas reales.</span>
        </p>
      </div>
      
      <button 
        className="bg-gray-900 hover:bg-black text-white px-10 py-5 rounded-3xl font-black shadow-2xl transition-all transform hover:scale-105 active:scale-95 flex items-center gap-3" 
        onClick={() => supabase.auth.signInWithOAuth({ 
          provider: 'google',
          options: { redirectTo: window.location.origin } 
        })}>
        <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-6 h-6" alt="google" />
        Unirse con Google
      </button>

      <p className="mt-8 text-[10px] text-gray-400 uppercase tracking-widest font-bold">
        Regístrate y recibe 10 monedas de regalo 🎁
      </p>
    </div>
  );

  return (
    <div className="max-w-xl mx-auto min-h-screen bg-gray-50/50 flex flex-col">
      {/* HEADER PREMIUM */}
      <header className="px-6 py-6 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-100">
        <div>
          <h1 className="text-xl font-black italic text-gray-900">YT-BOOST</h1>
          <p className="text-[9px] text-indigo-500 font-bold uppercase tracking-widest">Comunidad de Apoyo</p>
          <p className="text-[10px] text-red-500 font-black uppercase tracking-tighter animate-pulse mt-1"> ⚠️ Saldo se actualiza al actualizar la pagina</p>
        </div>
        <button 
          onClick={() => supabase.auth.signOut()} 
          className="bg-gray-100 text-gray-400 px-4 py-2 rounded-2xl text-[10px] font-black hover:bg-red-50 hover:text-red-500 transition-all"
        >
          SALIR
        </button>
      </header>

      <div className="px-6 pb-24">
        {/* WALLET INTEGRADO */}
        <div className="my-6">
          <Wallet user={user} />
        </div>

        {/* NAVEGACIÓN ESTILO APP */}
        <div className="flex gap-2 mb-8 bg-gray-200/50 p-1.5 rounded-[2rem]">
          {[
            { id: 'browse', icon: '📺', label: 'DESCUBRIR' },
            { id: 'mine', icon: '🚀', label: 'MIS VIDEOS' },
            { id: 'upload', icon: '➕', label: 'IMPULSAR' },
            { id: 'shop', icon: '🪙', label: 'RECARGAR' } // 2. AÑADIMOS BOTÓN TIENDA
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setView(tab.id)} 
              className={`flex-1 py-3 rounded-[1.5rem] font-black text-[10px] tracking-tighter transition-all flex flex-col items-center gap-1 ${
                view === tab.id ? 'bg-white shadow-lg text-indigo-600 scale-105' : 'text-gray-400 hover:text-gray-600'
              }`}>
              <span className="text-lg">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* VISTAS */}
        <main className="transition-all duration-300">
          {view === 'browse' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <h2 className="text-sm font-black text-gray-800 uppercase tracking-widest">Videos por ver</h2>
                <span className="text-[10px] font-bold text-gray-400">ACTUALIZADO</span>
              </div>
              <Campaigns user={user} onSelect={setSelectedCampaign} />
            </div>
          )}

          {view === 'mine' && (
            <div className="animate-in slide-in-from-bottom-4 duration-500">
              <MyCampaigns user={user} />
            </div>
          )}

          {view === 'upload' && (
            <div className="animate-in zoom-in-95 duration-300">
              <UploadVideo user={user} onComplete={() => setView('mine')} />
            </div>
          )}

          {/* 3. VISTA DE LA TIENDA */}
          {view === 'shop' && (
            <div className="animate-in slide-in-from-right-4 duration-300">
              <Shop user={user} onBack={() => setView('browse')} />
            </div>
          )}
        </main>
      </div>

      {/* OVERLAY: WATCH VIDEO */}
      {selectedCampaign && (
        <WatchVideo 
          campaign={selectedCampaign} 
          user={user} 
          onBack={() => setSelectedCampaign(null)} 
        />
      )}
    </div>
  );
}

export default App;
