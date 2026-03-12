'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Post {
  slug: string
  title: string
  date: string
  content: string
  tags?: string[]
  status?: string
  imageCount?: number
  hasImagePrompts?: boolean
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Check if already authenticated
    const authenticated = sessionStorage.getItem('authenticated')
    if (authenticated === 'true') {
      setIsAuthenticated(true)
      fetchPosts()
    } else {
      setLoading(false)
    }
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === '0692') {
      sessionStorage.setItem('authenticated', 'true')
      setIsAuthenticated(true)
      fetchPosts()
    } else {
      setError('密码错误')
    }
  }

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/posts')
      const data = await res.json()
      setPosts(data)
    } catch (err) {
      console.error('Failed to fetch posts:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 to-red-100">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-xhs-red mb-2">📕 小红书内容展示</h1>
            <p className="text-gray-600">请输入访问密码</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-xhs-red focus:border-transparent outline-none transition"
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button type="submit" className="w-full xhs-btn py-3">
              进入
            </button>
          </form>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">加载中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-xhs-red">📕 小红书内容展示</h1>
              <p className="text-gray-600 mt-1">每日自动生成的优质内容 | 共 {posts.length} 篇</p>
            </div>
            <button
              onClick={() => {
                sessionStorage.removeItem('authenticated')
                setIsAuthenticated(false)
              }}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              退出
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {posts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">暂无内容</h2>
            <p className="text-gray-500">小红书内容正在生成中...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link key={post.slug} href={`/posts/${post.slug}`}>
                <div className="xhs-card h-full cursor-pointer hover:shadow-xl transition-shadow duration-300">
                  <div className="p-6">
                    {/* Status & Date */}
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        post.status === '已发布' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {post.status || '待发布'}
                      </span>
                      <span className="text-xs text-gray-500">{post.date}</span>
                    </div>
                    
                    {/* Title */}
                    <h2 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2 min-h-[3.5rem]">
                      {post.title}
                    </h2>
                    
                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {post.tags.slice(0, 4).map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-xhs-pink bg-opacity-20 text-xhs-red text-xs rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                        {post.tags.length > 4 && (
                          <span className="text-xs text-gray-500">+{post.tags.length - 4}</span>
                        )}
                      </div>
                    )}
                    
                    {/* Content Info */}
                    <div className="flex items-center gap-4 text-xs text-gray-500 pt-4 border-t border-gray-100">
                      <span className="flex items-center gap-1">
                        📄 {post.content.length} 字
                      </span>
                      <span className="flex items-center gap-1">
                        🖼️ {post.imageCount || 0} 张配图
                      </span>
                      {post.hasImagePrompts && (
                        <span className="flex items-center gap-1">
                          ✨ 含生图提示词
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>🐦 Robin | 小红书内容自动化展示系统</p>
          <p className="mt-1">最后更新：{new Date().toLocaleDateString('zh-CN')}</p>
        </div>
      </footer>
    </div>
  )
}
