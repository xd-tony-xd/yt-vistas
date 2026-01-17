import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

export default function WatchVideo({ campaign, user, onBack }) {
  const [seconds, setSeconds] = useState(120); 
  const [completed, setCompleted] = useState(false);

  // Función para extraer el ID por si acaso viene la URL completa
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
    } else if (seconds === 0 && !completed) {
      handleReward();
    }
  }, [seconds]);

  const handleReward = async () => {
    setCompleted(true);
    
    // --- CAMBIO CLAVE AQUÍ ---
    const { error } = await supabase.from('views').insert({
      campaign_id: campaign.id, // Ahora usamos el ID de la campaña, no el video_id
      viewer_id: user.id,
      watched_seconds: 120
    });
    // -------------------------

    if (error) {
      // Si el error es por duplicado (ya vio el video hoy)
      if (error.code === '23505') {
        alert("Ya reclamaste monedas por este video hoy. ¡Prueba con otro!");
      } else {
        alert("Error al reclamar monedas: " + error.message);
      }
      setCompleted(false);
    } else {
      alert("¡Felicidades! Ganaste 🪙 5 monedas");
      onBack(); 
    }
  };

  return (
    <div className="fixed inset-0 bg-black text-white p-4 flex flex-col items-center z-50">
      <div className="w-full max-w-2xl flex justify-between items-center mb-4">
        <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors">
          ← Abandonar (No ganarás monedas)
        </button>
        <div className="bg-gray-800 px-4 py-1 rounded-full border border-gray-700">
          🪙 Recompensa: <span className="text-green-400 font-bold">5 monedas</span>
        </div>
      </div>
      
      <div className="w-full max-w-2xl aspect-video bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-gray-800">
        {videoId ? (
          <iframe 
            width="100%" 
            height="100%" 
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&rel=0&showinfo=0&modestbranding=1`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <div className="h-full flex items-center justify-center">Error: ID de video no válido</div>
        )}
      </div>

      <div className="mt-8 text-center bg-gray-900 p-6 rounded-2xl border border-gray-800 w-full max-w-md">
        {seconds > 0 ? (
          <>
            <p className="text-gray-400 mb-2 uppercase tracking-widest text-xs font-bold">Tiempo restante</p>
            <p className="text-5xl font-black font-mono text-blue-500">{seconds}<span className="text-xl">s</span></p>
          </>
        ) : (
          <div className="animate-bounce">
            <p className="text-2xl font-bold text-green-500">¡Completado! 🎉</p>
            <p className="text-sm text-gray-400">Procesando tus monedas...</p>
          </div>
        )}
      </div>
    </div>
  );
}