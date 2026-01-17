import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

export default function MyCampaigns({ user }) {
  const [myCampaigns, setMyCampaigns] = useState([])

  const getThumb = (id) => `https://img.youtube.com/vi/${id}/mqdefault.jpg`

  // Función para obtener campañas
  const fetchMyCampaigns = async () => {
    const { data } = await supabase
      .from('video_campaigns')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })
    setMyCampaigns(data || [])
  }

  // Función para borrar campaña
  const deleteCampaign = async (id) => {
    if (window.confirm('¿Quieres eliminar esta campaña?')) {
      const { error } = await supabase
        .from('video_campaigns')
        .delete()
        .eq('id', id)
      
      if (error) alert("Error al borrar")
      else fetchMyCampaigns() // Recarga la lista
    }
  }

  useEffect(() => {
    fetchMyCampaigns()

    // Suscripción en tiempo real para ver las vistas subir en vivo
    const channel = supabase
      .channel('my_vids')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'video_campaigns', filter: `owner_id=eq.${user.id}` }, 
        () => fetchMyCampaigns()
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user.id])

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-black text-gray-800">🚀 Mis Campañas</h2>
      
      {myCampaigns.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl p-8 text-center">
          <p className="text-gray-400 font-medium">Aún no tienes campañas creadas.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {myCampaigns.map(c => {
            const progress = Math.min(100, Math.round((c.used_views / c.required_views) * 100));
            
            return (
              <div key={c.id} className="bg-white border border-gray-100 p-4 rounded-3xl shadow-sm flex gap-4 items-center relative overflow-hidden">
                {/* Imagen del Video */}
                <img 
                  src={getThumb(c.video_id)} 
                  className="w-20 h-20 object-cover rounded-2xl shadow-inner bg-gray-100"
                  alt="Video"
                />
                
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      c.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {c.status === 'active' ? '● ACTIVO' : '✓ COMPLETADO'}
                    </span>
                    
                    {/* BOTÓN BORRAR */}
                    <button 
                      onClick={() => deleteCampaign(c.id)}
                      className="p-2 hover:bg-red-50 rounded-full text-red-400 hover:text-red-600 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  <div className="flex justify-between text-xs font-bold text-gray-600 mb-1">
                    <span>{c.used_views} / {c.required_views} vistas</span>
                    <span className={progress === 100 ? 'text-green-600' : 'text-indigo-600'}>{progress}%</span>
                  </div>

                  {/* Barra de progreso */}
                  <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${progress === 100 ? 'bg-green-500' : 'bg-indigo-600'}`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}