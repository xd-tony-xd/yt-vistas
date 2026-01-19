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
    alert("🚀 Link copiado. ¡Gana 40 monedas por cada amigo!");
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-black text-indigo-600 animate-pulse">CARGANDO...</div>;

  if (!user) return (
    <div className="h-screen flex flex-col items-center justify-center p-6 bg-white text-center">
      <h1 className="text-5xl font-black italic mb-2 tracking-tighter text-gray-900">YT-<span className="text-indigo-600">BOOST</span></h1>
      <p className="text-gray-400 mb-8 font-bold italic">Vistas reales garantizadas.</p>
      <button onClick={handleLogin} className="bg-black text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 shadow-xl active:scale-95 transition-all">
        <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="g" />
        Entrar con Google
      </button>
    </div>
  );

  return (
    <div className="max-w-xl mx-auto min-h-screen bg-white flex flex-col font-sans">
      <header className="px-6 py-4 flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-50">
        <h1 className="text-xl font-black italic tracking-tighter">YT-BOOST</h1>
        <button onClick={() => supabase.auth.signOut()} className="text-[9px] font-black text-gray-300 uppercase tracking-widest hover:text-red-500">Salir</button>
      </header>

      <div className="px-5 pb-24">
        <div className="my-4"><Wallet user={user} /></div>

        {/* --- BANNER DE REFERIDOS COMPACTO --- */}
        <div className="relative overflow-hidden bg-gray-900 rounded-[2rem] p-[2px] mb-6 shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-gradient-x"></div>
          <div className="relative bg-gray-900 rounded-[1.9rem] p-4 flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-indigo-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase">Regalo</span>
                <p className="text-white font-black text-sm italic">¡GANA +40 🪙!</p>
              </div>
              <p className="text-[10px] text-gray-400 font-medium">Por cada amigo invitado.</p>
            </div>
            <button 
              onClick={copyReferralLink} 
              className="bg-white text-black font-black text-[10px] px-4 py-2.5 rounded-xl hover:bg-indigo-50 active:scale-95 transition-all shadow-md shrink-0"
            >
              COPIAR LINK 🔗
            </button>
          </div>
        </div>

        {/* NAVEGACIÓN COMPACTA */}
        <div className="flex gap-2 mb-6 bg-gray-100 p-1.5 rounded-[1.8rem]">
          {[
            { id: 'browse', icon: '📺', label: 'DESCUBRIR' },
            { id: 'mine', icon: '🚀', label: 'MIS VIDEOS' },
            { id: 'upload', icon: '➕', label: 'IMPULSAR' },
            { id: 'shop', icon: '🪙', label: 'RECARGAR' }
          ].map((tab) => (
            <button key={tab.id} onClick={() => setView(tab.id)} className={`flex-1 py-3 rounded-[1.4rem] font-black text-[8px] tracking-widest transition-all flex flex-col items-center ${view === tab.id ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400'}`}>
              <span className="text-base mb-0.5">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <main>
          {view === 'browse' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Explorar Videos</h2>
                <span className="text-[8px] font-black text-green-500 bg-green-50 px-2 py-0.5 rounded-full uppercase">En Vivo</span>
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