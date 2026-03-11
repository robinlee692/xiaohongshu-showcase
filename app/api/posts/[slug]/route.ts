import { NextResponse } from 'next/server'
import { getPostData, getAllPostSlugs } from '@/lib/posts'

export async function generateStaticParams() {
  const slugs = getAllPostSlugs()
  return slugs
}

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const post = await getPostData(params.slug)
    return NextResponse.json(post)
  } catch (error) {
    console.error('Error fetching post:', error)
    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  }
}
