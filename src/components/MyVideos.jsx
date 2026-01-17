import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

export default function MyVideos({ user }) {
  const [videos, setVideos] = useState([])

  const loadVideos = async () => {
    const { data } = await supabase
      .from('videos')
      .select('*')
      .eq('user_id', user.id)
    setVideos(data || [])
  }

  useEffect(() => {
    if (user) loadVideos()
  }, [user])

  return (
    <div className="bg-white shadow-md p-6 rounded-lg mb-6">
      <h2 className="text-xl font-bold mb-3">🎥 Mis Videos</h2>
      <button
        onClick={loadVideos}
        className="mb-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        🔄 Recargar
      </button>
      {videos.length > 0 ? (
        <ul className="space-y-2">
          {videos.map(v => (
            <li key={v.id} className="border border-gray-200 rounded px-3 py-2">
              {v.youtube_url}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No has subido videos aún.</p>
      )}
    </div>
  )
}
