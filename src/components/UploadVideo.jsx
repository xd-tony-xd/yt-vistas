import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export default function UploadVideo({ user, onComplete }) {
  const [url, setUrl] = useState('')
  const [numViews, setNumViews] = useState(1)
  const [loading, setLoading] = useState(false)
  const [userBalance, setUserBalance] = useState(0)

  useEffect(() => {
    const fetchBalance = async () => {
      const { data } = await supabase.from('wallets').select('balance').eq('user_id', user.id).maybeSingle()
      if (data) setUserBalance(data.balance)
    }
    fetchBalance()
  }, [user.id])

  const getYouTubeID = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
    const match = url.match(regExp)
    return (match && match[2].length === 11) ? match[2] : null
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    const videoId = getYouTubeID(url)
    if (!videoId) return alert("URL de YouTube inválida")

    const totalCost = numViews * 10
    if (userBalance < totalCost) return alert("Saldo insuficiente")

    setLoading(true)
    try {
      // 1. Crear campaña (Enviando 'cost' explícitamente)
      const { error: cError } = await supabase.from('video_campaigns').insert({
        video_id: videoId,
        owner_id: user.id,
        required_views: numViews,
        watch_seconds: 120,
        cost: totalCost, // <-- Agregado para evitar error de NOT NULL
        status: 'active'
      })
      if (cError) throw cError

      // 2. Registrar transacción
      await supabase.from('transactions').insert({
        user_id: user.id,
        amount: totalCost,
        type: 'spend',
        reason: 'Campaña de video'
      })

      // 3. Actualizar Saldo
      const { error: wError } = await supabase.from('wallets').update({ balance: userBalance - totalCost }).eq('user_id', user.id)
      if (wError) throw wError

      alert("🚀 ¡Video impulsado con éxito!")
      onComplete()
    } catch (error) {
      alert("Error: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-300">
      <div className="bg-indigo-600 p-6 text-center text-white">
        <h3 className="font-black text-xl uppercase tracking-widest">Impulsar Video</h3>
      </div>
      <form onSubmit={handleUpload} className="p-6 space-y-4">
        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase ml-2">Link del video</label>
          <input 
            className="w-full bg-gray-50 p-4 rounded-2xl border-2 border-gray-100 outline-none focus:border-indigo-500 transition-all"
            placeholder="https://www.youtube.com/watch?v=..."
            value={url} onChange={e => setUrl(e.target.value)}
            required
          />
        </div>
        
        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase ml-2">¿Cuántas vistas quieres?</label>
          <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border-2 border-gray-100">
            <input 
              type="number" className="flex-1 bg-transparent font-bold text-lg outline-none text-indigo-600"
              value={numViews} onChange={e => setNumViews(Math.max(1, parseInt(e.target.value)))}
            />
            <span className="text-gray-400 font-bold text-xs uppercase">Vistas (10 c/u)</span>
          </div>
        </div>

        <div className="p-5 bg-indigo-50 rounded-2xl flex justify-between items-center border border-indigo-100">
          <span className="text-indigo-900 font-bold">TOTAL A PAGAR:</span>
          <span className="text-2xl font-black text-indigo-600 tracking-tighter">🪙 {numViews * 10}</span>
        </div>

        <button 
          type="submit"
          disabled={loading || userBalance < (numViews * 10)}
          className={`w-full py-4 rounded-2xl font-black text-white shadow-lg transition-all ${
            loading || userBalance < (numViews * 10) 
            ? 'bg-gray-300 cursor-not-allowed shadow-none' 
            : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95 shadow-indigo-200'
          }`}
        >
          {loading ? "PROCESANDO..." : "🚀 PUBLICAR AHORA"}
        </button>
      </form>
    </div>
  )
}