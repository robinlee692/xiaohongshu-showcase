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
  const [copiedSection, setCopiedSection] = useState<string | null>(null)

  useEffect(() => {
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

  const handleCopy = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedSection(section)
      setTimeout(() => setCopiedSection(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
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
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/" className="text-xhs-red hover:underline text-sm">
            ← 返回首页
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Section 1: 笔记标题 */}
        <article className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-xhs-red to-pink-500 p-6 text-white">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">{post.title}</h1>
              <button
                onClick={() => handleCopy(post.title, 'title')}
                className="px-4 py-2 bg-white bg-opacity-20 backdrop-blur-sm text-white rounded-lg text-sm font-medium hover:bg-opacity-30 transition flex items-center gap-2"
              >
                {copiedSection === 'title' ? '✅ 已复制' : '📋 复制'}
              </button>
            </div>
          </div>
        </article>

        {/* Section 2: 笔记正文 */}
        <article className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800">📄 笔记正文</h2>
            <button
              onClick={() => handleCopy(post.content, 'content')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                copiedSection === 'content'
                  ? 'bg-green-500 text-white'
                  : 'bg-xhs-red text-white hover:bg-red-600'
              }`}
            >
              {copiedSection === 'content' ? '✅ 已复制' : '📋 复制全文'}
            </button>
          </div>
          <div className="p-6">
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: post.contentHtml }}
            />
          </div>
        </article>

        {/* Section 3: 笔记标签 */}
        <article className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800">🏷️ 笔记标签</h2>
            <button
              onClick={() => handleCopy(post.tags?.map(t => `#${t}`).join(' ') || '', 'tags')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                copiedSection === 'tags'
                  ? 'bg-green-500 text-white'
                  : 'bg-xhs-red text-white hover:bg-red-600'
              }`}
            >
              {copiedSection === 'tags' ? '✅ 已复制' : '📋 复制标签'}
            </button>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap gap-2">
              {post.tags && post.tags.length > 0 ? (
                post.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-xhs-pink bg-opacity-20 text-xhs-red text-sm rounded-full"
                  >
                    #{tag}
                  </span>
                ))
              ) : (
                <span className="text-gray-500 text-sm">暂无标签</span>
              )}
            </div>
          </div>
        </article>

        {/* Section 4: 配图提示词 */}
        <article className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800">🖼️ 配图提示词</h2>
            <button
              onClick={() => handleCopy(post.imagePrompts?.join('\n\n') || '', 'prompts')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                copiedSection === 'prompts'
                  ? 'bg-green-500 text-white'
                  : 'bg-xhs-red text-white hover:bg-red-600'
              }`}
            >
              {copiedSection === 'prompts' ? '✅ 已复制' : '📋 复制全部'}
            </button>
          </div>
          <div className="p-6">
            {post.imagePrompts && post.imagePrompts.length > 0 ? (
              <div className="space-y-4">
                {post.imagePrompts.map((prompt, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700 mb-1">图 {index + 1}</p>
                        <p className="text-sm text-gray-600">{prompt}</p>
                      </div>
                      <button
                        onClick={() => handleCopy(prompt, `prompt-${index}`)}
                        className={`text-xs px-3 py-1 rounded border transition ${
                          copiedSection === `prompt-${index}`
                            ? 'bg-green-500 text-white border-green-500'
                            : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        {copiedSection === `prompt-${index}` ? '✅' : '复制'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">🎨</div>
                <p>暂无配图提示词</p>
              </div>
            )}
          </div>
        </article>

        {/* Navigation */}
        <div className="mt-8 text-center">
          <Link href="/" className="xhs-btn inline-block">
            返回首页
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white mt-12 py-6">
        <div className="max-w-4xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>🐦 Robin | 小红书内容自动化展示系统</p>
        </div>
      </footer>
    </div>
  )
}
