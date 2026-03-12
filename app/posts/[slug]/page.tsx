'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface PostData {
  slug: string
  title: string
  date: string
  contentHtml: string
  content: string
  tags?: string[]
  status?: string
  imageSuggestions?: string[]
  imagePrompts?: string[]
}

export default function PostPage() {
  const params = useParams()
  const router = useRouter()
  const [post, setPost] = useState<PostData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<'preview' | 'raw'>('preview')

  useEffect(() => {
    // Check authentication
    const authenticated = sessionStorage.getItem('authenticated')
    if (!authenticated) {
      router.push('/')
      return
    }

    if (params.slug) {
      fetchPost(params.slug as string)
    }
  }, [params.slug, router])

  const fetchPost = async (slug: string) => {
    try {
      const res = await fetch(`/api/posts/${slug}`)
      if (!res.ok) throw new Error('Failed to fetch post')
      const data = await res.json()
      setPost(data)
    } catch (err) {
      console.error('Error fetching post:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!post) return
    try {
      await navigator.clipboard.writeText(post.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">加载中...</div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-700 mb-4">内容未找到</h1>
          <Link href="/" className="xhs-btn">返回首页</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <Link href="/" className="text-xhs-red hover:underline text-sm">
            ← 返回首页
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Title Card */}
        <article className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-xhs-red to-pink-500 p-8 text-white">
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <span className={`px-3 py-1 text-sm rounded-full font-medium ${
                post.status === '已发布' 
                  ? 'bg-green-500' 
                  : 'bg-yellow-500'
              }`}>
                {post.status || '待发布'}
              </span>
              <span className="text-sm opacity-90">📅 {post.date}</span>
              <span className="text-sm opacity-90">📄 {post.content.length} 字</span>
              <span className="text-sm opacity-90">🖼️ {post.imageSuggestions?.length || 0} 张配图</span>
            </div>
            <h1 className="text-3xl font-bold">{post.title}</h1>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="px-8 py-4 border-b border-gray-100">
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-xhs-pink bg-opacity-20 text-xhs-red text-sm rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Content Tabs */}
          <div className="px-8 pt-6 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  activeTab === 'preview'
                    ? 'bg-xhs-red text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                👁️ 预览模式
              </button>
              <button
                onClick={() => setActiveTab('raw')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  activeTab === 'raw'
                    ? 'bg-xhs-red text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                📝 源码模式
              </button>
              <div className="flex-1" />
              <button
                onClick={handleCopy}
                className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition flex items-center gap-2"
              >
                {copied ? '✅ 已复制' : '📋 复制全文'}
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {activeTab === 'preview' ? (
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: post.contentHtml }}
              />
            ) : (
              <textarea
                className="w-full h-96 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-xhs-red focus:border-transparent outline-none"
                value={post.content}
                readOnly
              />
            )}
          </div>
        </article>

        {/* Image Suggestions */}
        {post.imageSuggestions && post.imageSuggestions.length > 0 && (
          <article className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
              <h2 className="text-2xl font-bold">🖼️ 配图建议</h2>
              <p className="text-sm opacity-90 mt-1">共 {post.imageSuggestions.length} 张</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {post.imageSuggestions.map((suggestion, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                    <h3 className="font-bold text-xhs-red mb-2">{suggestion}</h3>
                    {post.imagePrompts && post.imagePrompts[index] && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">✨ 画面描述：</span>
                        </p>
                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                          {post.imagePrompts[index]}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </article>
        )}

        {/* Image Prompts Summary */}
        {post.imagePrompts && post.imagePrompts.length > 0 && (
          <article className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-6 text-white">
              <h2 className="text-2xl font-bold">✨ 生图提示词汇总</h2>
              <p className="text-sm opacity-90 mt-1">可直接用于 AI 绘画工具</p>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {post.imagePrompts.map((prompt, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700 mb-1">图 {index + 1}</p>
                        <p className="text-sm text-gray-600">{prompt}</p>
                      </div>
                      <button
                        onClick={async () => {
                          await navigator.clipboard.writeText(prompt)
                        }}
                        className="text-xs px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 transition"
                      >
                        复制
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </article>
        )}

        {/* Navigation */}
        <div className="mt-8 text-center">
          <Link href="/" className="xhs-btn inline-block">
            返回首页
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white mt-12 py-6">
        <div className="max-w-5xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>🐦 Robin | 小红书内容自动化展示系统</p>
        </div>
      </footer>
    </div>
  )
}
