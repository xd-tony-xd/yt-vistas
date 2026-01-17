import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

export default function Campaigns({ user, onSelect }) {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)

  // Obtener miniatura de YouTube a partir del video_id
  const getThumb = (id) => `https://img.youtube.com/vi/${id}/mqdefault.jpg`

  // --- LÓGICA DE RECOMPENSA DINÁMICA (Igual a WatchVideo) ---
  const calculateBaseReward = (watch_seconds) => {
    const mins = Math.floor(watch_seconds / 60);
    if (mins <= 2) return 5;
    return 5 + (mins - 2) * 2;
  };

  useEffect(() => {
    const fetchCampaigns = async () => {
      const { data, error } = await supabase
        .from('video_campaigns')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (!error) setCampaigns(data)
      setLoading(false)
    }
    fetchCampaigns()
  }, [])

  if (loading) return <div className="text-center py-10 text-gray-500 animate-pulse">Cargando videos...</div>

  const otherCampaigns = campaigns.filter(c => c.owner_id !== user.id)

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-black text-gray-800 flex items-center gap-2">
        📺 Videos Disponibles
      </h2>
      
      {otherCampaigns.length === 0 ? (
        <div className="bg-gray-50 p-10 rounded-3xl text-center border-2 border-dashed border-gray-200">
          <p className="text-gray-400 font-medium">No hay videos nuevos. ¡Vuelve más tarde!</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {otherCampaigns.map((camp) => {
            // Calculamos la recompensa y minutos reales para cada tarjeta
            const reward = calculateBaseReward(camp.watch_seconds);
            const minutes = Math.floor(camp.watch_seconds / 60);

            return (
              <div key={camp.id} className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="relative">
                  <img 
                    src={getThumb(camp.video_id)} 
                    alt="thumb" 
                    className="w-24 h-16 object-cover rounded-xl bg-gray-100"
                  />
                  <span className="absolute bottom-1 right-1 bg-black/70 text-[8px] text-white px-1 rounded font-bold">
                    {minutes}m
                  </span>
                </div>
                
                <div className="flex-1">
                  <p className="font-bold text-gray-800 leading-tight">Ver {minutes} min</p>
                  <p className="text-green-600 font-black text-sm">🪙 +{reward} Monedas</p>
                  {minutes > 2 && (
                    <span className="text-[8px] bg-indigo-50 text-indigo-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">
                      🔥 Alto Pago
                    </span>
                  )}
                </div>
                
                <button 
                  onClick={() => onSelect(camp)}
                  className="bg-indigo-600 text-white px-5 py-2 rounded-xl font-bold text-sm shadow-lg shadow-indigo-100 active:scale-95 transition-all"
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