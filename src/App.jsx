import { useEffect, useState } from 'react';
import { supabase } from "./supabase";
import Wallet from './components/Wallet';
import Campaigns from './components/Campaigns';
import MyCampaigns from './components/MyCampaigns';
import WatchVideo from './components/WatchVideo';
import UploadVideo from './components/UploadVideo';
import Shop from './components/Shop';

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

  // --- FUNCIÓN DE SALIDA DEFINITIVA ---
  const handleLogout = async () => {
    const confirm = window.confirm("¿Cerrar sesión en YT-BOOST?");
    if (confirm) {
      try {
        // 1. Sign out oficial
        await supabase.auth.signOut();
        
        // 2. Limpieza forzada de memoria y caché de sesión
        localStorage.clear();
        sessionStorage.clear();
        
        // 3. Limpiar estado de React
        setUser(null);
        setSelectedCampaign(null);
        setView('browse');

        // 4. Redirigir al origen (pantalla de login) sin dejar rastro en el historial
        window.location.replace(window.location.origin);
      } catch (err) {
        console.error("Error al salir:", err);
        // Fallback: si todo falla, forzar recarga
        window.location.href = "/";
      }
    }
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="font-black text-indigo-600 animate-pulse text-lg tracking-tighter">Sincronizando...</p>
    </div>
  );

  if (!user) return (
    <div className="h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-white to-indigo-50">
      <div className="text-center mb-10">
        <div className="inline-block bg-indigo-600 text-white px-4 py-1 rounded-full text-[10px] font-black tracking-widest mb-4">
          COMUNIDAD REAL
        </div>
        <h1 className="text-6xl font-black italic text-gray-900 mb-4 tracking-tighter">
          YT-<span className="text-indigo-600">BOOST</span>
        </h1>
        <p className="text-gray-500 max-w-xs mx-auto text-lg leading-tight">
          Apoyémonos entre creadores <br />
          <span className="text-indigo-600 font-bold italic">Vistas reales garantizadas.</span>
        </p>
      </div>
      
      <button 
        className="bg-gray-900 hover:bg-black text-white px-10 py-5 rounded-3xl font-black shadow-2xl transition-all transform hover:scale-105 active:scale-95 flex items-center gap-3" 
        onClick={() => supabase.auth.signInWithOAuth({ 
          provider: 'google',
          options: { redirectTo: window.location.origin } 
        })}>
        <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-6 h-6" alt="google" />
        Entrar con Google
      </button>

      <p className="mt-8 text-[10px] text-gray-400 uppercase tracking-widest font-black">
        Regalo de bienvenida: 10 monedas 🎁
      </p>
    </div>
  );

  return (
    <div className="max-w-xl mx-auto min-h-screen bg-gray-50/50 flex flex-col">
      {/* HEADER */}
      <header className="px-6 py-6 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-100">
        <div>
          <h1 className="text-xl font-black italic text-gray-900 leading-none">YT-BOOST</h1>
          <p className="text-[9px] text-indigo-500 font-black uppercase tracking-widest mt-1">Comunidad de Apoyo</p>
          <p className="text-[10px] font-black uppercase tracking-[0.15em] mt-2 bg-gradient-to-r from-indigo-600 via-purple-500 to-indigo-600 bg-[length:200%_auto] animate-gradient-x bg-clip-text text-transparent italic">✨ Juntos podemos • Comparte la web ✨</p>
        </div>
        <button 
          onClick={handleLogout} 
          className="bg-red-50 text-red-600 border border-red-100 px-4 py-2 rounded-2xl text-[10px] font-black hover:bg-red-600 hover:text-white transition-all shadow-sm active:scale-90"
        >
          SALIR
        </button>
      </header>

      <div className="px-6 pb-24">
        <div className="my-6">
          <Wallet user={user} />
        </div>

        {/* NAVEGACIÓN */}
        <div className="flex gap-2 mb-8 bg-gray-200/50 p-1.5 rounded-[2rem]">
          {[
            { id: 'browse', icon: '📺', label: 'DESCUBRIR' },
            { id: 'mine', icon: '🚀', label: 'MIS VIDEOS' },
            { id: 'upload', icon: '➕', label: 'IMPULSAR' },
            { id: 'shop', icon: '🪙', label: 'RECARGAR' }
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setView(tab.id)} 
              className={`flex-1 py-3 rounded-[1.5rem] font-black text-[10px] tracking-tighter transition-all flex flex-col items-center gap-1 ${
                view === tab.id ? 'bg-white shadow-md text-indigo-600 scale-105' : 'text-gray-400 hover:text-gray-600'
              }`}>
              <span className="text-lg">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* CONTENIDO */}
        <main>
          {view === 'browse' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <h2 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Videos por ver</h2>
                <div className="flex items-center gap-1.5">
                   <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                   <span className="text-[10px] font-black text-green-600 tracking-tighter">LIVE FEED</span>
                </div>
              </div>
              <Campaigns user={user} onSelect={setSelectedCampaign} />
            </div>
          )}

          {view === 'mine' && <MyCampaigns user={user} />}
          {view === 'upload' && <UploadVideo user={user} onComplete={() => setView('mine')} />}
          {view === 'shop' && <Shop user={user} onBack={() => setView('browse')} />}
        </main>
      </div>

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