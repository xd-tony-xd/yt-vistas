import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

export default function WatchVideo({ campaign, user, onBack }) {
  const [seconds, setSeconds] = useState(campaign.watch_seconds || 120); 
  const [claimed, setClaimed] = useState(false);
  
  const [didLike, setDidLike] = useState(false);
  const [didSub, setDidSub] = useState(false);
  const [openedLink, setOpenedLink] = useState(false);

  // --- LÓGICA DE RECOMPENSA DINÁMICA ---
  const calculateBaseReward = () => {
    const mins = Math.floor(campaign.watch_seconds / 60);
    if (mins <= 2) return 5;
    return 5 + (mins - 2) * 2; 
  };
  
  const baseReward = calculateBaseReward();
  const currentTotalPotential = baseReward + (didLike ? 1 : 0) + (didSub ? 2 : 0);

  const cleanVideoId = (input) => {
    if (!input) return "";
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = input.match(regExp);
    return (match && match[2].length === 11) ? match[2] : input;
  };

  const videoId = cleanVideoId(campaign.video_id);

  useEffect(() => {
    if (seconds > 0) {
      const timer = setTimeout(() => setSeconds(seconds - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [seconds]);

  const handleOpenYoutube = () => {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
    setOpenedLink(true);
  };

  const handleReward = async () => {
    if (seconds > 0 || claimed) return;

    if ((didLike || didSub) && !openedLink) {
      alert("Haz clic en 'ABRIR EN YOUTUBE' para realizar las acciones.");
      return;
    }

    setClaimed(true);
    
    let totalReward = baseReward;
    if (didLike) totalReward += 1;
    if (didSub) totalReward += 2;

    const { error } = await supabase.from('views').insert({
      campaign_id: campaign.id,
      viewer_id: user.id,
      watched_seconds: campaign.watch_seconds, 
      reward_amount: totalReward, 
      metadata: { liked: didLike, subscribed: didSub }
    });

    if (error) {
      if (error.code === '23505') {
        alert("Ya reclamaste monedas por este video hoy.");
      } else {
        alert("Error: " + error.message);
      }
      setClaimed(false);
    } else {
      alert(`¡Felicidades! Ganaste 🪙 ${totalReward} monedas por ver ${Math.floor(campaign.watch_seconds/60)} min`);
      onBack(); 
    }
  };

  return (
    <div className="fixed inset-0 bg-black text-white p-4 flex flex-col items-center z-50 overflow-y-auto">
      <div className="w-full max-w-2xl flex justify-between items-center mb-4">
        <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors text-sm">
          ← Abandonar
        </button>
        <div className="bg-gray-800 px-4 py-1 rounded-full border border-gray-700">
          🪙 Ganarás: <span className="text-yellow-400 font-bold">{currentTotalPotential} monedas</span>
        </div>
      </div>
      
      <div className="w-full max-w-2xl aspect-video bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-gray-800">
        {videoId ? (
          <iframe 
            width="100%" height="100%" 
            /* Se eliminó mute=1 para que el audio intente activarse solo */
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&rel=0&modestbranding=1`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <div className="h-full flex items-center justify-center">Error: ID no válido</div>
        )}
      </div>

      <div className="mt-6 w-full max-w-md space-y-3 pb-10">
        <p className="text-[10px] text-red-500 text-center font-bold uppercase mb-2">
          ⚠️ Si mientes al marcar, podrías ser baneado
        </p>

        <div className={`p-4 rounded-xl border flex justify-between items-center ${seconds === 0 ? "bg-green-500/10 border-green-500/50" : "bg-gray-900 border-gray-800"}`}>
          <div className="flex items-center gap-3">
            <span className="text-lg">{seconds === 0 ? "✅" : "📺"}</span>
            <p className="text-sm font-bold">Ver {Math.floor(campaign.watch_seconds / 60)} min {seconds > 0 ? `(${seconds}s)` : ""}</p>
          </div>
          <span className="text-yellow-500 font-bold">+{baseReward}</span>
        </div>

        <button 
          onClick={handleOpenYoutube}
          className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl text-xs transition-all flex items-center justify-center gap-2"
        >
          {openedLink ? "✅ VIDEO ABIERTO" : "1. ABRIR EN YOUTUBE (PARA LIKE/SUB)"}
        </button>

        <div className={`p-4 rounded-xl border flex justify-between items-center transition-all ${didLike ? "bg-blue-500/20 border-blue-500" : "bg-gray-900 border-gray-800"} ${!openedLink && "opacity-50"}`}>
          <label className="flex items-center gap-3 cursor-pointer w-full">
            <input 
              type="checkbox" 
              disabled={!openedLink}
              checked={didLike} 
              onChange={(e) => setDidLike(e.target.checked)}
              className="w-5 h-5 accent-blue-500"
            />
            <span className="text-sm">Le di Like 👍</span>
          </label>
          <span className="text-yellow-500 font-bold">+1</span>
        </div>

        <div className={`p-4 rounded-xl border flex justify-between items-center transition-all ${didSub ? "bg-red-500/20 border-red-500" : "bg-gray-900 border-gray-800"} ${!openedLink && "opacity-50"}`}>
          <label className="flex items-center gap-3 cursor-pointer w-full">
            <input 
              type="checkbox" 
              disabled={!openedLink}
              checked={didSub} 
              onChange={(e) => setDidSub(e.target.checked)}
              className="w-5 h-5 accent-red-500"
            />
            <span className="text-sm">Me suscribí 🔔</span>
          </label>
          <span className="text-yellow-500 font-bold">+2</span>
        </div>

        <button
          disabled={seconds > 0 || claimed}
          onClick={handleReward}
          className={`w-full py-4 rounded-xl font-black text-lg transition-all ${
            seconds === 0 && !claimed
            ? "bg-yellow-500 text-black shadow-lg shadow-yellow-500/20 active:scale-95" 
            : "bg-gray-800 text-gray-600 cursor-not-allowed"
          }`}
        >
          {claimed ? "PROCESANDO..." : seconds > 0 ? `ESPERA (${seconds}s)` : "RECLAMAR RECOMPENSA 🪙"}
        </button>
      </div>
    </div>
  );
}