'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Post {
  slug: string
  title: string
  date: string
  content: string
  tags?: string[]
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [error, setError] = useState('')
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set())
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
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

  const toggleSelect = (slug: string) => {
    const newSelected = new Set(selectedPosts)
    if (newSelected.has(slug)) {
      newSelected.delete(slug)
    } else {
      newSelected.add(slug)
    }
    setSelectedPosts(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedPosts.size === posts.length) {
      setSelectedPosts(new Set())
    } else {
      setSelectedPosts(new Set(posts.map(p => p.slug)))
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    setDeleteError('')
    try {
      const res = await fetch('/api/posts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slugs: Array.from(selectedPosts) })
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setPosts(posts.filter(p => !selectedPosts.has(p.slug)))
        setSelectedPosts(new Set())
        setShowDeleteConfirm(false)
      } else {
        setDeleteError(data.error || '删除失败，请重试')
      }
    } catch (err) {
      console.error('Delete failed:', err)
      setDeleteError('网络错误，请重试')
    } finally {
      setDeleting(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const weekday = weekdays[date.getDay()]
    return `${year}-${month}-${day} ${weekday}`
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 to-red-100 p-4">
        <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-sm">
          <h1 className="text-2xl font-bold text-xhs-red text-center mb-6">📕 小红书内容展示</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-xhs-red outline-none"
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button type="submit" className="w-full xhs-btn py-3">进入</button>
          </form>
        </div>
      </div>
    )
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-xl text-gray-600">加载中...</div></div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50">
      {/* Header - 移动端优化 */}
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-[1600px] mx-auto px-3 py-3">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-lg font-bold text-xhs-red">📕 小红书内容展示</h1>
              <p className="text-xs text-gray-600 mt-0.5">共 {posts.length} 篇</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex bg-gray-100 rounded-lg p-0.5">
                <button onClick={() => setViewMode('grid')} className={`px-2 py-1.5 rounded-md text-xs font-medium transition ${viewMode === 'grid' ? 'bg-white text-xhs-red shadow-sm' : 'text-gray-600'}`}>卡片</button>
                <button onClick={() => setViewMode('list')} className={`px-2 py-1.5 rounded-md text-xs font-medium transition ${viewMode === 'list' ? 'bg-white text-xhs-red shadow-sm' : 'text-gray-600'}`}>列表</button>
              </div>
              <button onClick={() => { sessionStorage.removeItem('authenticated'); setIsAuthenticated(false) }} className="text-gray-500 hover:text-gray-700 text-xs px-2">退出</button>
            </div>
          </div>
          
          {/* 批量操作栏 - 移动端优化 */}
          {selectedPosts.size > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={true} readOnly className="w-3.5 h-3.5 text-red-600 rounded" />
                <span className="text-xs font-medium text-red-700">已选择 {selectedPosts.size} 篇</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={() => setSelectedPosts(new Set())} disabled={deleting} className="text-xs text-red-600 hover:text-red-800 font-medium disabled:opacity-50">取消</button>
                <button onClick={handleDelete} disabled={deleting} className="px-3 py-1.5 bg-red-500 text-white rounded-md text-xs font-medium hover:bg-red-600 disabled:opacity-50">{deleting ? '删除中...' : '删除'}</button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content - 移动端优化 */}
      <main className="max-w-[1600px] mx-auto px-3 py-4">
        {posts.length === 0 ? (
          <div className="text-center py-20"><div className="text-6xl mb-4">📝</div><h2 className="text-xl font-bold text-gray-700 mb-2">暂无内容</h2><p className="text-gray-500 text-sm">小红书内容正在生成中...</p></div>
        ) : viewMode === 'grid' ? (
          /* 卡片视图 - 响应式布局 */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {posts.map((post) => (
              <div key={post.slug} className="relative">
                <input type="checkbox" checked={selectedPosts.has(post.slug)} onChange={() => toggleSelect(post.slug)} className={`absolute top-2 left-2 w-4 h-4 text-red-600 rounded z-10 transition-opacity ${selectedPosts.size > 0 ? 'opacity-100' : 'opacity-0 hover:opacity-50'}`} />
                <Link href={`/posts/${post.slug}`}>
                  <div className="xhs-card h-full cursor-pointer pt-8">
                    <div className="p-3">
                      <h2 className="text-xs font-bold text-gray-800 mb-2 line-clamp-2 min-h-[2.5rem]">{post.title}</h2>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-500">{formatDate(post.date)}</span>
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-0.5">
                            {post.tags.slice(0, 2).map((tag, index) => (
                              <span key={index} className="px-1 py-0.5 bg-xhs-pink bg-opacity-20 text-xhs-red text-[9px] rounded-full">#{tag}</span>
                            ))}
                            {post.tags.length > 2 && <span className="text-[9px] text-gray-500">+{post.tags.length - 2}</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          /* 列表视图 - 移动端优化 */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="w-10 px-3 py-3"></th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-3 py-3">标题</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-3 py-3 whitespace-nowrap">日期</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-3 py-3">标签</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {posts.map((post) => (
                    <tr key={post.slug} className="hover:bg-gray-50 cursor-pointer" onClick={() => window.location.href = `/posts/${post.slug}`}>
                      <td className="px-3 py-3"><input type="checkbox" checked={selectedPosts.has(post.slug)} onChange={(e) => { e.stopPropagation(); toggleSelect(post.slug) }} className={`w-4 h-4 text-red-600 rounded transition-opacity ${selectedPosts.size > 0 ? 'opacity-100' : 'opacity-0 hover:opacity-50'}`} /></td>
                      <td className="px-3 py-3"><span className="text-sm font-medium text-gray-800">{post.title}</span></td>
                      <td className="px-3 py-3"><span className="text-sm text-gray-500 whitespace-nowrap">{formatDate(post.date)}</span></td>
                      <td className="px-3 py-3"><div className="flex flex-wrap gap-1">{post.tags?.slice(0, 3).map((tag, index) => (<span key={index} className="px-2 py-0.5 bg-xhs-pink bg-opacity-20 text-xhs-red text-xs rounded-full">#{tag}</span>))}{post.tags && post.tags.length > 3 && (<span className="text-xs text-gray-500">+{post.tags.length - 3}</span>)}</div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal - 移动端优化 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">⚠️</div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">确认删除</h3>
              <p className="text-gray-600 text-sm">确定要删除选中的 <span className="font-bold text-xhs-red">{selectedPosts.size}</span> 篇内容吗？</p>
              <p className="text-xs text-gray-500 mt-2">此操作不可恢复！</p>
              {deleteError && <p className="text-red-500 text-sm mt-3">{deleteError}</p>}
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setShowDeleteConfirm(false); setDeleteError('') }} disabled={deleting} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50">取消</button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 disabled:opacity-50">{deleting ? '删除中...' : '确认删除'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white mt-8 py-4">
        <div className="max-w-[1600px] mx-auto px-4 text-center text-gray-500 text-xs">
          <p>🐦 Robin | 小红书内容自动化展示系统</p>
          <p className="mt-1">最后更新：{new Date().toLocaleDateString('zh-CN')}</p>
        </div>
      </footer>
    </div>
  )
}
