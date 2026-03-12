import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'

// Use relative path within project directory (for Vercel deployment)
const xiaohongshuDirectory = path.join(process.cwd(), 'content')

// Check if directory exists
function contentDirExists(): boolean {
  try {
    return fs.existsSync(xiaohongshuDirectory)
  } catch {
    return false
  }
}

export function getSortedPostsData() {
  // Return empty array if content directory doesn't exist
  if (!contentDirExists()) {
    return []
  }

  // Get file names under /content
  const fileNames = fs.readdirSync(xiaohongshuDirectory)
  const allPostsData = fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map(fileName => {
      // Read markdown file as string
      const fullPath = path.join(xiaohongshuDirectory, fileName)
      const fileContents = fs.readFileSync(fullPath, 'utf8')

      // Use gray-matter to parse the post metadata section
      const matterResult = matter(fileContents)

      return {
        slug: fileName.replace(/\.md$/, ''),
        title: matterResult.data.title || '无标题',
        date: matterResult.data.date || fileName.split('-').slice(0, 3).join('-'),
        content: matterResult.content,
        tags: matterResult.data.tags || [],
        status: matterResult.data.status || '待发布',
      }
    })
  
  // Sort posts by date
  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1
    } else {
      return -1
    }
  })
}

export function getAllPostSlugs() {
  if (!contentDirExists()) {
    return []
  }
  
  const fileNames = fs.readdirSync(xiaohongshuDirectory)
  return fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map(fileName => ({
      slug: fileName.replace(/\.md$/, ''),
    }))
}

export async function getPostData(slug: string) {
  if (!contentDirExists()) {
    throw new Error('Content directory not found')
  }
  
  const fullPath = path.join(xiaohongshuDirectory, `${slug}.md`)
  
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Post not found: ${slug}`)
  }
  
  const fileContents = fs.readFileSync(fullPath, 'utf8')

  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents)

  // Use remark to convert markdown into HTML string
  const processedContent = await remark()
    .use(html)
    .process(matterResult.content)
  const contentHtml = processedContent.toString()

  return {
    slug,
    contentHtml,
    ...(matterResult.data as { date: string; title: string; tags?: string[]; status?: string }),
  }
}
