import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

export default function Stats({ user }) {
  const [totalWatched, setTotalWatched] = useState(0)

  useEffect(() => {
    const getStats = async () => {
      const { count } = await supabase
        .from('views')
        .select('*', { count: 'exact', head: true })
        .eq('viewer_id', user.id)
      setTotalWatched(count || 0)
    }
    getStats()
  }, [user.id])

  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <div className="bg-blue-50 p-4 rounded-lg text-center">
        <p className="text-xs text-blue-600 font-bold uppercase">Videos Vistos</p>
        <p className="text-2xl font-black">{totalWatched}</p>
      </div>
      <div className="bg-purple-50 p-4 rounded-lg text-center">
        <p className="text-xs text-purple-600 font-bold uppercase">Nivel</p>
        <p className="text-2xl font-black">⭐ {Math.floor(totalWatched / 10)}</p>
      </div>
    </div>
  )
}