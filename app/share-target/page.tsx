'use client'

import { useEffect, useState } from 'react'

export default function ShareTargetPage() {
  const [data, setData] = useState({ title: '', text: '', url: '' })

  useEffect(() => {
    const form = new FormData(document.forms[0])
    const title = form.get('title') || ''
    const text = form.get('text') || ''
    const url = form.get('url') || ''

    setData({ title: String(title), text: String(text), url: String(url) })
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white bg-gradient-to-br from-black to-gray-900 px-6 py-10 text-center">
      <img src="/icons/icon-192x192.png" alt="Flavor Studios Logo" className="w-20 h-20 mb-6" />
      <h1 className="text-2xl font-bold mb-2">🔥 Shared Content Received</h1>
      <p className="mb-4 text-gray-300">{data.title || data.text || 'No message attached.'}</p>
      {data.url && (
        <a href={data.url} className="underline text-blue-400 hover:text-blue-300" target="_blank" rel="noopener noreferrer">
          Open Shared Link
        </a>
      )}
      <p className="mt-6 text-sm text-gray-500">Flavor Studios PWA – Web Share Target Handler</p>
    </div>
  )
}
