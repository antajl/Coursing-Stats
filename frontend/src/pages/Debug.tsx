import { useEffect, useState } from 'react'
import { SEO } from '../components/SEO'

export default function Debug() {
  const [dataChecks, setDataChecks] = useState<Record<string, any>>({})

  useEffect(() => {
    async function checkDataPaths() {
      const paths = [
        '/data/v1/breeds.json',
        '/data/v1/indexes/years.json',
        '/data/v1/indexes/top-placement-2026.json',
        '/data/v1/indexes/judges-summary.json',
        '/data/v1/donino/speed_records.json',
        '/data/v1/donino/coursing_records.json',
      ]

      const results: Record<string, any> = {}

      for (const path of paths) {
        try {
          const response = await fetch(path)
          results[path] = {
            status: response.status,
            ok: response.ok,
            statusText: response.statusText,
            data: response.ok ? await response.json() : null,
          }
        } catch (error) {
          results[path] = {
            error: error instanceof Error ? error.message : String(error),
          }
        }
      }

      setDataChecks(results)
    }

    checkDataPaths()
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <SEO title="Debug - Data Paths" description="Debug page to check data paths availability" />
      <h1 className="text-2xl font-bold mb-6">Debug: Data Paths</h1>
      
      <div className="space-y-4">
        {Object.entries(dataChecks).map(([path, result]) => (
          <div key={path} className="border rounded-lg p-4">
            <h2 className="font-mono text-sm font-semibold mb-2">{path}</h2>
            <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        ))}
      </div>

      {Object.keys(dataChecks).length === 0 && (
        <p className="text-gray-500">Loading data checks...</p>
      )}
    </div>
  )
}
