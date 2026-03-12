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

// Load image prompts from .prompts.json file
function loadImagePrompts(slug: string): string[] {
  try {
    const promptsPath = path.join(xiaohongshuDirectory, `${slug}.prompts.json`)
    if (fs.existsSync(promptsPath)) {
      const data = JSON.parse(fs.readFileSync(promptsPath, 'utf8'))
      return data.imagePrompts || []
    }
  } catch (error) {
    console.error(`Failed to load prompts for ${slug}:`, error)
  }
  return []
}

// Extract image suggestions and prompts from content (fallback for old format)
function extractImageInfo(content: string): { imageSuggestions?: string[]; imagePrompts?: string[] } {
  const result: { imageSuggestions?: string[]; imagePrompts?: string[] } = {}
  
  // Extract image suggestions (【图 X - 标题】格式)
  const imagePattern = /【(图 \d+[^】]*)】/g
  let imageMatch
  const imageMatches: RegExpExecArray[] = []
  while ((imageMatch = imagePattern.exec(content)) !== null) {
    imageMatches.push(imageMatch)
  }
  if (imageMatches.length > 0) {
    result.imageSuggestions = imageMatches.map(m => m[1])
  }
  
  // Extract image prompts (画面：开头的段落)
  const promptPattern = /画面：([^\n]+)/g
  let promptMatch
  const promptMatches: RegExpExecArray[] = []
  while ((promptMatch = promptPattern.exec(content)) !== null) {
    promptMatches.push(promptMatch)
  }
  if (promptMatches.length > 0) {
    result.imagePrompts = promptMatches.map(m => m[1].trim())
  }
  
  return result
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
      const slug = fileName.replace(/\.md$/, '')
      
      // Load image prompts from .prompts.json file (v3.0 format)
      const imagePrompts = loadImagePrompts(slug)
      
      // Fallback to extracting from content (old format)
      const imageInfo = imagePrompts.length === 0 ? extractImageInfo(matterResult.content) : { imagePrompts }

      return {
        slug,
        title: matterResult.data.title || '无标题',
        date: matterResult.data.date || fileName.split('-').slice(0, 3).join('-'),
        content: matterResult.content,
        tags: matterResult.data.tags || [],
        status: matterResult.data.status || '待发布',
        imageCount: imageInfo.imagePrompts?.length || 0,
        hasImagePrompts: !!imageInfo.imagePrompts?.length,
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
  
  // Load image prompts from .prompts.json file (v3.0 format)
  let imagePrompts = loadImagePrompts(slug)
  
  // Fallback to extracting from content (old format)
  if (imagePrompts.length === 0) {
    const imageInfo = extractImageInfo(matterResult.content)
    imagePrompts = imageInfo.imagePrompts || []
  }

  // Use remark to convert markdown into HTML string
  const processedContent = await remark()
    .use(html)
    .process(matterResult.content)
  const contentHtml = processedContent.toString()

  return {
    slug,
    contentHtml,
    content: matterResult.content,
    ...(matterResult.data as { date: string; title: string; tags?: string[]; status?: string }),
    imagePrompts,
  }
}
