import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'

const API_URL = import.meta.env.PROD 
  ? 'https://procoursing-stats.antajltube.workers.dev'
  : ''

export default function DogProfile() {
  const { id } = useParams()
  const [dogData, setDogData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDogData()
  }, [id])

  const fetchDogData = async () => {
    try {
      const response = await fetch(`${API_URL}/api/dogs/${id}`)
      const data = await response.json()
      setDogData(data)
    } catch (error) {
      console.error('Error fetching dog data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-white">Загрузка...</div>
  }

  if (!dogData || dogData.length === 0) {
    return <div className="text-center py-8 text-white">Собака не найдена</div>
  }

  const dog = dogData[0]
  const results = dogData

  return (
    <div className="p-6">
      <Link to="/top" className="text-cyan-400 hover:text-cyan-300 mb-6 inline-block font-medium">
        ← Назад к топу
      </Link>

      <div className="bg-gradient-to-r from-cyan-500 to-purple-500 rounded-2xl shadow-2xl p-10 mb-8 text-white border border-white/20">
        <h1 className="text-5xl font-extrabold mb-3">{dog.name_lat}</h1>
        <p className="text-2xl text-white/80 mb-6">{dog.name_ru}</p>
        <div className="flex gap-4">
          <span className="bg-white/20 backdrop-blur-sm px-5 py-2 rounded-full text-sm font-medium border border-white/30">
            Порода: {dog.breed}
          </span>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden border border-white/10">
        <div className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 px-6 py-5 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white">История выступлений</h2>
        </div>
        <table className="min-w-full divide-y divide-white/10">
          <thead className="bg-white/5">
            <tr>
              <th className="px-6 py-5 text-left text-xs font-bold text-cyan-300 uppercase tracking-wider">
                Дата
              </th>
              <th className="px-6 py-5 text-left text-xs font-bold text-cyan-300 uppercase tracking-wider">
                Событие
              </th>
              <th className="px-6 py-5 text-center text-xs font-bold text-cyan-300 uppercase tracking-wider">
                Место
              </th>
              <th className="px-6 py-5 text-center text-xs font-bold text-cyan-300 uppercase tracking-wider">
                Баллы
              </th>
              <th className="px-6 py-5 text-left text-xs font-bold text-cyan-300 uppercase tracking-wider">
                Титул
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {results.map((result) => (
              <tr key={result.id} className="hover:bg-white/10 transition-all duration-300">
                <td className="px-6 py-5 whitespace-nowrap text-sm text-white font-medium">
                  {result.date_start}
                </td>
                <td className="px-6 py-5 text-sm text-white/90">
                  {result.title}
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-center text-sm">
                  {result.placement ? (
                    <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-bold shadow-lg ${
                      result.placement === 1 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white shadow-yellow-500/30' :
                      result.placement === 2 ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800' :
                      result.placement === 3 ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-white shadow-orange-500/30' :
                      'bg-white/10 text-white/60'
                    }`}>
                      {result.placement}
                    </span>
                  ) : '-'}
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-center text-sm text-white font-bold">
                  {result.total_score || '-'}
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-sm text-white/60">
                  {result.qualification ? (
                    <span className="px-3 py-1.5 text-xs font-bold rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg">
                      {result.qualification}
                    </span>
                  ) : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
