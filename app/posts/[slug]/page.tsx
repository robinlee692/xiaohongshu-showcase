'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface PostData {
  slug: string
  title: string
  date: string
  contentHtml: string
  tags?: string[]
  status?: string
}

export default function PostPage() {
  const params = useParams()
  const router = useRouter()
  const [post, setPost] = useState<PostData | null>(null)
  const [loading, setLoading] = useState(true)

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
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/" className="text-xhs-red hover:underline">
            ← 返回首页
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <article className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-xhs-red to-pink-500 p-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              <span className={`px-3 py-1 text-sm rounded-full ${
                post.status === '已发布' 
                  ? 'bg-green-500' 
                  : 'bg-yellow-500'
              }`}>
                {post.status || '待发布'}
              </span>
              <span className="text-sm opacity-90">{post.date}</span>
            </div>
            <h1 className="text-3xl font-bold">{post.title}</h1>
          </div>

          {/* Content */}
          <div className="p-8">
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: post.contentHtml }}
            />

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-bold text-gray-700 mb-3">🏷️ 话题标签</h3>
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
