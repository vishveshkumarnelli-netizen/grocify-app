import { useLocation } from 'react-router-dom'

export default function Search() {
  const query = new URLSearchParams(useLocation().search).get('q')

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Search Results</h1>
      <p className="text-gray-500 mt-2">Showing results for: "{query}"</p>
    </div>
  )
}