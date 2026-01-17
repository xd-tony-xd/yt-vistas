  import { useState, useEffect } from 'react'
  import { supabase } from '../supabase'

  export default function UploadVideo({ user, onComplete }) {
    const [url, setUrl] = useState('')
    // CAMBIO: Ahora inicia en '1' por defecto
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

    // Costo: 2 min = 10. Cada minuto extra +5.
    const costPerView = 10 + (selectedMinutes - 2) * 5;
    const totalCost = (parseInt(numViews) || 0) * costPerView;

    const getYouTubeID = (url) => {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
      const match = url.match(regExp)
      return (match && match[2].length === 11) ? match[2] : null
    }

    const handleUpload = async (e) => {
      e.preventDefault()
      const videoId = getYouTubeID(url)
      const views = parseInt(numViews)

      if (!videoId) return alert("URL de YouTube inválida")
      if (!views || views < 1) return alert("Ingresa al menos 1 vista")
      if (userBalance < totalCost) return alert("Saldo insuficiente")

      setLoading(true)
      try {
        const { error: cError } = await supabase.from('video_campaigns').insert({
          video_id: videoId,
          owner_id: user.id,
          required_views: views,
          watch_seconds: selectedMinutes * 60,
          cost: totalCost,
          status: 'active'
        })
        if (cError) throw cError

        await supabase.from('transactions').insert({
          user_id: user.id,
          amount: totalCost,
          type: 'spend',
          reason: `Campaña ${selectedMinutes}min x ${views} vistas`
        })

        const { error: wError } = await supabase.from('wallets').update({ balance: userBalance - totalCost }).eq('user_id', user.id)
        if (wError) throw wError

        alert("🚀 ¡Campaña lanzada con éxito!")
        onComplete()
      } catch (error) {
        alert("Error: " + error.message)
      } finally {
        setLoading(false)
      }
    }

    return (
      <div className="max-w-md mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-indigo-600 p-6 text-center text-white">
          <h3 className="font-black text-xl uppercase tracking-widest">Impulsar Video</h3>
        </div>
        
        <form onSubmit={handleUpload} className="p-6 space-y-5">
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase ml-2 tracking-wider">YouTube Link</label>
            <input 
              className="w-full bg-gray-50 p-4 rounded-2xl border-2 border-gray-100 outline-none focus:border-indigo-500 text-gray-700 transition-all"
              placeholder="Pega el link aquí..."
              value={url} onChange={e => setUrl(e.target.value)}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-2 tracking-wider">Duración</label>
              <select 
                className="w-full bg-gray-50 p-4 rounded-2xl border-2 border-gray-100 outline-none focus:border-indigo-500 text-indigo-600 font-bold appearance-none cursor-pointer"
                value={selectedMinutes}
                onChange={e => setSelectedMinutes(parseInt(e.target.value))}
              >
                {minuteOptions.map(min => (
                  <option key={min} value={min}>{min} Minutos</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-2 tracking-wider">Nº Vistas</label>
              <input 
                type="number"
                className="w-full bg-gray-50 p-4 rounded-2xl border-2 border-gray-100 outline-none focus:border-indigo-500 text-indigo-600 font-bold"
                placeholder="1"
                value={numViews}
                // Al ser un string '', el input queda vacío al borrar y no te bloquea el teclado
                onChange={e => setNumViews(e.target.value)}
              />
            </div>
          </div>

          <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500 font-medium">Costo por vista:</span>
              <span className="text-indigo-600 font-bold">🪙 {costPerView}</span>
            </div>
            <div className="pt-2 border-t border-indigo-100 flex justify-between items-center">
              <span className="text-indigo-900 font-black text-sm uppercase">Total:</span>
              <span className="text-2xl font-black text-indigo-600">🪙 {totalCost}</span>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading || userBalance < totalCost || !numViews || parseInt(numViews) < 1}
            className={`w-full py-4 rounded-2xl font-black text-white transition-all shadow-lg ${
              loading || userBalance < totalCost || !numViews || parseInt(numViews) < 1
              ? 'bg-gray-300 cursor-not-allowed shadow-none' 
              : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 active:scale-95'
            }`}
          >
            {loading ? "PROCESANDO..." : "🚀 LANZAR AHORA"}
          </button>

          {userBalance < totalCost && totalCost > 0 && (
            <p className="text-center text-red-500 text-[10px] font-black uppercase">
              ⚠️ Saldo insuficiente (Tienes 🪙 {userBalance})
            </p>
          )}
        </form>
      </div>
    )
  }