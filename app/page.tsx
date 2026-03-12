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
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [error, setError] = useState('')
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set())
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
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

  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

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

  const handleStatusChange = async (slug: string, newStatus: string) => {
    try {
      const res = await fetch('/api/posts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, status: newStatus })
      })
      if (res.ok) {
        setPosts(posts.map(p => p.slug === slug ? { ...p, status: newStatus } : p))
      }
    } catch (err) {
      console.error('Status update failed:', err)
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 to-red-100">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
          <h1 className="text-3xl font-bold text-xhs-red text-center mb-6">📕 小红书内容展示</h1>
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
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-[1600px] mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-xhs-red">📕 小红书内容展示</h1>
              <p className="text-sm text-gray-600 mt-0.5">共 {posts.length} 篇</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button onClick={() => setViewMode('grid')} className={`px-3 py-1.5 rounded-md text-sm font-medium ${viewMode === 'grid' ? 'bg-white text-xhs-red shadow-sm' : 'text-gray-600'}`}>卡片</button>
                <button onClick={() => setViewMode('list')} className={`px-3 py-1.5 rounded-md text-sm font-medium ${viewMode === 'list' ? 'bg-white text-xhs-red shadow-sm' : 'text-gray-600'}`}>列表</button>
              </div>
              <button onClick={() => { sessionStorage.removeItem('authenticated'); setIsAuthenticated(false) }} className="text-gray-500 hover:text-gray-700 text-sm">退出</button>
            </div>
          </div>
          
          {/* 批量操作栏 - 仅在选择内容时显示 */}
          {selectedPosts.size > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <input type="checkbox" checked={true} readOnly className="w-4 h-4 text-red-600 rounded" />
                <span className="text-sm font-medium text-red-700">已选择 {selectedPosts.size} 篇</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setSelectedPosts(new Set())} className="text-sm text-red-600 hover:text-red-800 font-medium">取消选择</button>
                <button onClick={() => setShowDeleteConfirm(true)} className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600">删除选中</button>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>💡 提示：勾选内容后可批量删除，点击状态标签可切换状态</span>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 py-6">
        {posts.length === 0 ? (
          <div className="text-center py-20"><div className="text-6xl mb-4">📝</div><h2 className="text-2xl font-bold text-gray-700 mb-2">暂无内容</h2><p className="text-gray-500">小红书内容正在生成中...</p></div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-5 gap-4">
            {posts.map((post) => (
              <div key={post.slug} className="relative">
                <input type="checkbox" checked={selectedPosts.has(post.slug)} onChange={() => toggleSelect(post.slug)} className={`absolute top-3 left-3 w-4 h-4 text-red-600 rounded z-10 transition-opacity ${selectedPosts.size > 0 ? 'opacity-100' : 'opacity-0 hover:opacity-50'}`} />
                <Link href={`/posts/${post.slug}`}>
                  <div className="xhs-card h-full cursor-pointer pt-8">
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2" onClick={(e) => e.stopPropagation()}>
                        <span className={`px-2 py-0.5 text-xs rounded-full font-medium cursor-pointer hover:opacity-80 transition ${post.status === '已发布' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`} onClick={(e) => { e.stopPropagation(); handleStatusChange(post.slug, post.status === '待发布' ? '已发布' : '待发布') }} title="点击切换状态">{post.status || '待发布'}</span>
                        <span className="text-xs text-gray-500">{formatDate(post.date)}</span>
                      </div>
                      <h2 className="text-sm font-bold text-gray-800 mb-2 line-clamp-2 min-h-[2.5rem]">{post.title}</h2>
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {post.tags.slice(0, 3).map((tag, index) => (
                            <span key={index} className="px-1.5 py-0.5 bg-xhs-pink bg-opacity-20 text-xhs-red text-[10px] rounded-full">#{tag}</span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-[10px] text-gray-500 pt-2 border-t border-gray-100">
                        <span>📄 {post.content.length}字</span>
                        <span>🖼️ {post.imageCount || 0}图</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-10 px-4 py-3"></th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">状态</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">标题</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">日期</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">标签</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">字数</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">配图</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {posts.map((post) => (
                  <tr key={post.slug} className="hover:bg-gray-50 cursor-pointer" onClick={() => window.location.href = `/posts/${post.slug}`}>
                    <td className="px-4 py-3"><input type="checkbox" checked={selectedPosts.has(post.slug)} onChange={(e) => { e.stopPropagation(); toggleSelect(post.slug) }} className={`w-4 h-4 text-red-600 rounded transition-opacity ${selectedPosts.size > 0 ? 'opacity-100' : 'opacity-0 hover:opacity-50'}`} /></td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}><span className={`px-2 py-1 text-xs rounded-full font-medium cursor-pointer hover:opacity-80 transition ${post.status === '已发布' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`} onClick={(e) => { e.stopPropagation(); handleStatusChange(post.slug, post.status === '待发布' ? '已发布' : '待发布') }} title="点击切换状态">{post.status || '待发布'}</span></td>
                    <td className="px-4 py-3"><span className="text-sm font-medium text-gray-800">{post.title}</span></td>
                    <td className="px-4 py-3"><span className="text-sm text-gray-500">{formatDate(post.date)}</span></td>
                    <td className="px-4 py-3"><div className="flex flex-wrap gap-1">{post.tags?.slice(0, 3).map((tag, index) => (<span key={index} className="px-2 py-0.5 bg-xhs-pink bg-opacity-20 text-xhs-red text-xs rounded-full">#{tag}</span>))}{post.tags && post.tags.length > 3 && (<span className="text-xs text-gray-500">+{post.tags.length - 3}</span>)}</div></td>
                    <td className="px-4 py-3"><span className="text-sm text-gray-500">{post.content.length}字</span></td>
                    <td className="px-4 py-3"><span className="text-sm text-gray-500">{post.imageCount || 0}图</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">确认删除</h3>
              <p className="text-gray-600">确定要删除选中的 <span className="font-bold text-xhs-red">{selectedPosts.size}</span> 篇内容吗？</p>
              <p className="text-sm text-gray-500 mt-2">此操作不可恢复！</p>
              {deleteError && <p className="text-red-500 text-sm mt-3">{deleteError}</p>}
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setShowDeleteConfirm(false); setDeleteError('') }} disabled={deleting} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50">取消</button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 disabled:opacity-50">{deleting ? '删除中...' : '确认删除'}</button>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-white mt-12 py-6">
        <div className="max-w-[1600px] mx-auto px-4 text-center text-gray-500 text-sm">
          <p>🐦 Robin | 小红书内容自动化展示系统</p>
          <p className="mt-1">最后更新：{new Date().toLocaleDateString('zh-CN')}</p>
        </div>
      </footer>
    </div>
  )
}
