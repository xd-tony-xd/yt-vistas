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
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get('ref');
    if (ref) localStorage.setItem('referrer_id', ref);

    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    if (window.confirm("¿Cerrar sesión en YT-BOOST?")) {
      try {
        await supabase.auth.signOut();
        localStorage.clear();
        sessionStorage.clear();
        setUser(null);
        window.location.replace(window.location.origin);
      } catch (err) {
        window.location.reload();
      }
    }
  };

  const handleLogin = async () => {
    const referrerId = localStorage.getItem('referrer_id');
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: referrerId ? { referrer_id: referrerId } : {}
      }
    });
  };

  const copyReferralLink = () => {
    const urlProd = "https://yt-vistas.vercel.app"; 
    const base = window.location.hostname === 'localhost' ? urlProd : window.location.origin;
    navigator.clipboard.writeText(`${base}?ref=${user.id}`);
    alert("🚀 ¡Link Maestro copiado! +40 monedas por cada amigo.");
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white font-black text-indigo-600 animate-pulse text-sm tracking-[0.3em]">
      YT-BOOST...
    </div>
  );

  if (!user) return (
    <div className="h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-white to-indigo-50 text-center">
      <div className="inline-block bg-indigo-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black tracking-[0.2em] mb-6 shadow-lg shadow-indigo-100">
        PLATAFORMA #1 CREADORES
      </div>
      
      <h1 className="text-7xl font-black italic mb-4 tracking-tighter text-gray-900 leading-none">
        YT-<span className="text-indigo-600">BOOST</span>
      </h1>

      <div className="space-y-2 mb-10">
        <p className="text-gray-900 font-black text-2xl italic uppercase tracking-tighter">
          Vistas reales • Subs • Likes
        </p>
        <p className="text-gray-500 font-medium text-sm max-w-[280px] mx-auto leading-tight">
          La comunidad más grande para crecer en YouTube de forma orgánica y segura.
        </p>
      </div>

      <button 
        onClick={handleLogin} 
        className="bg-gray-900 text-white px-12 py-5 rounded-[2.5rem] font-black shadow-2xl transition-all active:scale-95 flex items-center gap-3 border-b-4 border-gray-700 hover:bg-black"
      >
        <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-6 h-6" alt="g" />
        Entrar con Google
      </button>

      <div className="mt-12 flex gap-4 text-[10px] font-black text-indigo-500 uppercase tracking-widest">
        <span className="bg-white px-4 py-2.5 rounded-2xl shadow-sm border border-indigo-50">⚡ Instantáneo</span>
        <span className="bg-white px-4 py-2.5 rounded-2xl shadow-sm border border-indigo-50">🛡️ 100% Seguro</span>
      </div>
    </div>
  );

  return (
    <div className="max-w-xl mx-auto min-h-screen bg-white flex flex-col font-sans">
      <header className="px-6 py-6 flex justify-between items-center sticky top-0 bg-white/90 backdrop-blur-md z-50 border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-black italic tracking-tighter leading-none">YT-BOOST</h1>
          <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-1.5 italic">Comunidad Activa</p>
        </div>
        <button 
          onClick={handleLogout} 
          className="bg-red-50 text-red-600 px-5 py-2.5 rounded-2xl text-[10px] font-black hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-90 uppercase tracking-tighter"
        >
          SALIR
        </button>
      </header>

      <div className="px-5 pb-24">
        <div className="my-6"><Wallet user={user} /></div>

        {/* --- BANNER DE REFERIDOS RE-AJUSTADO (MÁS GRANDE Y CLARO) --- */}
        <div className="relative overflow-hidden bg-gray-900 rounded-[2rem] p-[2px] mb-8 shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-gradient-x"></div>
          <div className="relative bg-gray-900 rounded-[1.9rem] px-5 py-5 flex items-center justify-between gap-3">
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-white text-black text-[9px] font-black px-2 py-0.5 rounded-lg uppercase tracking-tighter">MEGA BONO</span>
                <p className="text-white font-black text-base italic tracking-tighter truncate">¡GANA +40 🪙!</p>
              </div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest truncate">Por invitar amigos reales</p>
            </div>
            <button 
              onClick={copyReferralLink} 
              className="bg-white text-black font-black text-[11px] px-5 py-3.5 rounded-2xl active:scale-95 transition-all shadow-lg shrink-0 whitespace-nowrap uppercase tracking-tighter border-b-2 border-gray-200"
            >
              COPIAR LINK 🔗
            </button>
          </div>
        </div>

        {/* NAVEGACIÓN */}
        <div className="flex gap-2 mb-10 bg-gray-100 p-2 rounded-[2.2rem]">
          {[
            { id: 'browse', icon: '📺', label: 'DESCUBRIR' },
            { id: 'mine', icon: '🚀', label: 'MIS VIDEOS' },
            { id: 'upload', icon: '➕', label: 'IMPULSAR' },
            { id: 'shop', icon: '🪙', label: 'RECARGAR' }
          ].map((tab) => (
            <button 
              key={tab.id} 
              onClick={() => setView(tab.id)} 
              className={`flex-1 py-4 rounded-[1.8rem] font-black text-[9px] tracking-tighter transition-all flex flex-col items-center gap-1 ${
                view === tab.id ? 'bg-white shadow-md text-indigo-600 scale-105' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <span className="text-xl mb-0.5">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <main className="animate-in fade-in slide-in-from-bottom-3 duration-500">
          {view === 'browse' && (
            <div className="space-y-5">
              <div className="flex justify-between items-center px-1">
                <h2 className="text-[12px] font-black text-gray-400 uppercase tracking-[0.2em] italic">Directorio</h2>
                <div className="flex items-center gap-2 text-green-600">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                  <span className="text-[10px] font-black uppercase tracking-tighter">Live Feed</span>
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
        <WatchVideo campaign={selectedCampaign} user={user} onBack={() => setSelectedCampaign(null)} />
      )}
    </div>
  );
}

export default App;