import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

export default function MyCampaigns({ user }) {
  const [myCampaigns, setMyCampaigns] = useState([])

  const getThumb = (id) => `https://img.youtube.com/vi/${id}/mqdefault.jpg`

  const fetchMyCampaigns = async () => {
    const { data } = await supabase
      .from('video_campaigns')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })
    setMyCampaigns(data || [])
  }

  const deleteCampaign = async (id) => {
    if (window.confirm('¿Quieres eliminar esta campaña?')) {
      const { error } = await supabase
        .from('video_campaigns')
        .delete()
        .eq('id', id)
      
      if (error) alert("Error al borrar")
      else fetchMyCampaigns()
    }
  }

  useEffect(() => {
    fetchMyCampaigns()

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
      <h2 className="text-xl font-black text-gray-800 flex items-center gap-2 italic">
        🚀 MIS CAMPAÑAS
      </h2>
      
      {myCampaigns.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl p-10 text-center">
          <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">Aún no tienes <br/> campañas creadas</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {myCampaigns.map(c => {
            const progress = Math.min(100, Math.round((c.used_views / c.required_views) * 100));
            const minutes = Math.floor(c.watch_seconds / 60);
            
            return (
              <div key={c.id} className="bg-white border border-gray-100 p-4 rounded-[2rem] shadow-sm flex gap-4 items-center relative overflow-hidden">
                
                {/* Imagen con badge de tiempo */}
                <div className="relative flex-shrink-0">
                  <img 
                    src={getThumb(c.video_id)} 
                    className="w-20 h-20 object-cover rounded-2xl bg-gray-100"
                    alt="Video"
                  />
                  <span className="absolute bottom-1 right-1 bg-black/70 text-[9px] text-white px-1.5 py-0.5 rounded-lg font-black">
                    {minutes}m
                  </span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${
                      c.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {c.status === 'active' ? '● En Curso' : '✓ Completado'}
                    </span>
                    
                    <button 
                      onClick={() => deleteCampaign(c.id)}
                      className="p-1.5 hover:bg-red-50 rounded-xl text-red-300 hover:text-red-500 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  <div className="flex justify-between items-end mb-1.5">
                    <div className="leading-none">
                      <p className="text-lg font-black text-gray-800 leading-none">
                        {c.used_views} <span className="text-gray-300 text-xs font-bold">/ {c.required_views}</span>
                      </p>
                      <p className="text-[9px] font-bold text-gray-400 uppercase">Vistas obtenidas</p>
                    </div>
                    <span className={`text-xs font-black ${progress === 100 ? 'text-green-500' : 'text-indigo-600'}`}>
                      {progress}%
                    </span>
                  </div>

                  {/* Barra de progreso con efecto */}
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ease-out ${progress === 100 ? 'bg-green-500' : 'bg-indigo-600'}`}
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