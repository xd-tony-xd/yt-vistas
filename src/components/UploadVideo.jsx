import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export default function UploadVideo({ user, onComplete }) {
  const [url, setUrl] = useState('')
  const [numViews, setNumViews] = useState('1') 
  const [selectedMinutes, setSelectedMinutes] = useState(2) 
  const [loading, setLoading] = useState(false)
  const [userBalance, setUserBalance] = useState(0)

  // Opciones de 2 a 20 minutos
  const minuteOptions = Array.from({ length: 19 }, (_, i) => i + 2);

  useEffect(() => {
    const fetchBalance = async () => {
      const { data } = await supabase.from('wallets').select('balance').eq('user_id', user.id).maybeSingle()
      if (data) setUserBalance(data.balance)
    }
    fetchBalance()
  }, [user.id])

  // LÓGICA DE COSTO: 2 min = 10. Cada minuto extra +5.
  const costPerView = 10 + (selectedMinutes - 2) * 5;
  const totalCost = (parseInt(numViews) || 0) * costPerView;

  // --- FUNCIÓN DE LIMPIEZA CORREGIDA (Soporta Live, Shorts, etc.) ---
  const cleanVideoId = (input) => {
    if (!input) return "";
    if (input.length === 11 && !input.includes("/")) return input;
    const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts|live)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = input.match(regExp);
    return (match && match[1]) ? match[1] : input.trim();
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    const videoId = cleanVideoId(url) // Usamos la nueva función
    const views = parseInt(numViews)

    // Validaciones
    if (!videoId || videoId.length !== 11) {
      return alert("❌ URL de YouTube inválida. Copia el enlace completo de la barra de direcciones.")
    }
    if (!views || views < 1) return alert("Ingresa al menos 1 vista")
    if (userBalance < totalCost) return alert("Saldo insuficiente")

    setLoading(true)
    try {
      // 1. Crear la campaña
      const { error: cError } = await supabase.from('video_campaigns').insert({
        video_id: videoId,
        owner_id: user.id,
        required_views: views,
        watch_seconds: selectedMinutes * 60,
        cost: totalCost,
        status: 'active'
      })
      if (cError) throw cError

      // 2. Registrar la transacción (El descuento real de dinero lo hace el TRIGGER de SQL que instalamos antes,
      // pero actualizamos el estado local para que el usuario lo vea de inmediato)
      
      alert("🚀 ¡Campaña lanzada con éxito!")
      onComplete() // Volver a la lista de videos
    } catch (error) {
      alert("Error: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100">
      <div className="bg-indigo-600 p-8 text-center text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-black/10 pointer-events-none italic font-black text-6xl opacity-10 select-none">VIDEO</div>
        <h3 className="font-black text-2xl uppercase tracking-tighter relative z-10">Impulsar Video 🚀</h3>
        <p className="text-indigo-200 text-[10px] font-bold uppercase tracking-widest mt-1">Configura tu campaña</p>
      </div>
      
      <form onSubmit={handleUpload} className="p-8 space-y-6">
        <div>
          <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">YouTube URL (Shorts, Live, Video)</label>
          <input 
            className="w-full bg-gray-50 p-5 rounded-[1.5rem] border-2 border-gray-100 outline-none focus:border-indigo-500 text-gray-700 transition-all font-medium mt-1"
            placeholder="Pega el link aquí..."
            value={url} onChange={e => setUrl(e.target.value)}
            required
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Tiempo de Vista</label>
            <select 
              className="w-full bg-gray-50 p-5 rounded-[1.5rem] border-2 border-gray-100 outline-none focus:border-indigo-500 text-indigo-600 font-black appearance-none cursor-pointer mt-1"
              value={selectedMinutes}
              onChange={e => setSelectedMinutes(parseInt(e.target.value))}
            >
              {minuteOptions.map(min => (
                <option key={min} value={min}>{min} Minutos</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Cantidad Vistas</label>
            <input 
              type="number"
              className="w-full bg-gray-50 p-5 rounded-[1.5rem] border-2 border-gray-100 outline-none focus:border-indigo-500 text-indigo-600 font-black mt-1"
              placeholder="1"
              value={numViews}
              onChange={e => setNumViews(e.target.value)}
            />
          </div>
        </div>

        <div className="p-6 bg-indigo-50/50 rounded-[2rem] border border-indigo-100 space-y-3">
          <div className="flex justify-between text-[10px] font-black text-indigo-300 uppercase">
            <span>Costo por vista</span>
            <span>🪙 {costPerView}</span>
          </div>
          <div className="pt-3 border-t border-indigo-100 flex justify-between items-center">
            <span className="text-indigo-900 font-black text-sm uppercase">Total a invertir</span>
            <span className="text-3xl font-black text-indigo-600 tracking-tighter">🪙 {totalCost}</span>
          </div>
        </div>

        <div className="space-y-3">
          <button 
            type="submit"
            disabled={loading || userBalance < totalCost || !numViews || parseInt(numViews) < 1}
            className={`w-full py-5 rounded-[1.5rem] font-black text-white transition-all shadow-xl text-lg tracking-tight ${
              loading || userBalance < totalCost || !numViews || parseInt(numViews) < 1
              ? 'bg-gray-200 cursor-not-allowed shadow-none' 
              : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100 active:scale-95'
            }`}
          >
            {loading ? "PROCESANDO..." : "LANZAR CAMPAÑA ⚡"}
          </button>

          {userBalance < totalCost && totalCost > 0 && (
            <div className="bg-red-50 p-3 rounded-xl border border-red-100">
              <p className="text-center text-red-500 text-[10px] font-black uppercase">
                ⚠️ Saldo insuficiente (Tienes 🪙 {userBalance})
              </p>
            </div>
          )}
        </div>
      </form>
    </div>
  )
}