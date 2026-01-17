import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../supabase'

export default function Campaigns({ user, onSelect }) {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)

  const getThumb = (id) => `https://img.youtube.com/vi/${id}/mqdefault.jpg`

  const calculateBaseReward = (watch_seconds) => {
    const mins = Math.floor(watch_seconds / 60);
    if (mins <= 2) return 5;
    return 5 + (mins - 2) * 2;
  };

  // Usamos useCallback para poder llamarlo desde el useEffect y el botón de refresh
  const fetchCampaigns = useCallback(async () => {
    setLoading(true)
    try {
      // 1. Traemos los datos. Quitamos filtros de la query para asegurar que lleguen.
      const { data, error } = await supabase
        .from('video_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // 2. FILTRADO MANUAL (Más confiable)
      const available = (data || []).filter(c => {
        const isNotMine = c.owner_id !== user.id;
        const hasViewsLeft = c.used_views < c.required_views;
        // Solo mostrar si NO es mío Y si faltan vistas
        return isNotMine && hasViewsLeft;
      });

      setCampaigns(available);
    } catch (err) {
      console.error("Error fetching:", err.message);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 space-y-4">
      <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">Buscando videos...</p>
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-black text-gray-800 flex items-center gap-2">
          📺 Videos Disponibles
        </h2>
        <button 
          onClick={fetchCampaigns}
          className="p-2 hover:bg-indigo-50 rounded-full transition-all active:rotate-180 duration-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h5M20 20v-5h-5M2.3 12a10 10 0 0117.8-6.4M21.7 12a10 10 0 01-17.8 6.4" />
          </svg>
        </button>
      </div>
      
      {campaigns.length === 0 ? (
        <div className="bg-white p-10 rounded-[2rem] text-center border-2 border-dashed border-gray-100 shadow-sm">
          <div className="text-4xl mb-3">😴</div>
          <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest">
            No hay videos disponibles <br/> de otros usuarios ahora.
          </p>
          <button onClick={fetchCampaigns} className="mt-4 text-indigo-600 font-bold text-xs underline">Refrescar</button>
        </div>
      ) : (
        <div className="grid gap-3 pb-10">
          {campaigns.map((camp) => {
            const reward = calculateBaseReward(camp.watch_seconds);
            const minutes = Math.floor(camp.watch_seconds / 60);

            return (
              <div key={camp.id} className="bg-white p-3 rounded-[1.5rem] shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-all active:scale-[0.98]">
                <div className="relative flex-shrink-0">
                  <img 
                    src={getThumb(camp.video_id)} 
                    alt="thumbnail" 
                    className="w-24 h-16 object-cover rounded-2xl bg-gray-100 shadow-inner"
                  />
                  <span className="absolute bottom-1 right-1 bg-black/70 text-[8px] text-white px-1.5 py-0.5 rounded-lg font-black">
                    {minutes}m
                  </span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-black text-gray-800 leading-tight">Ver {minutes} min</p>
                  <p className="text-green-600 font-black text-sm flex items-center gap-1">
                    <span className="text-xs">🪙</span> +{reward} Monedas
                  </p>
                  <div className="flex gap-1 mt-1">
                    <span className="text-[7px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-md font-bold uppercase">
                      {camp.required_views - camp.used_views} Cupos
                    </span>
                  </div>
                </div>
                
                <button 
                  onClick={() => onSelect(camp)}
                  className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-black text-xs shadow-lg shadow-indigo-100 active:bg-indigo-700 transition-all uppercase tracking-tighter"
                >
                  VER
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  )
}