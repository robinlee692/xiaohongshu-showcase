import { NextRequest, NextResponse } from 'next/server'
import { getSortedPostsData } from '@/lib/posts'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const contentDirectory = path.join(process.cwd(), 'content')

export async function GET() {
  try {
    const posts = getSortedPostsData()
    return NextResponse.json(posts)
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { slugs } = await request.json()
    
    if (!slugs || !Array.isArray(slugs)) {
      return NextResponse.json({ error: 'Invalid slugs' }, { status: 400 })
    }

    const deletedSlugs: string[] = []
    
    for (const slug of slugs) {
      const filePath = path.join(contentDirectory, `${slug}.md`)
      const promptsPath = path.join(contentDirectory, `${slug}.prompts.json`)
      
      // Delete .md file
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
        deletedSlugs.push(slug)
        console.log(`Deleted: ${filePath}`)
      }
      
      // Delete .prompts.json file if exists
      if (fs.existsSync(promptsPath)) {
        fs.unlinkSync(promptsPath)
        console.log(`Deleted: ${promptsPath}`)
      }
    }

    // Note: Git operations are not supported in Vercel Serverless environment
    // Files will be deleted in the current deployment but will reappear on next deployment
    // For production use, consider using a database or external storage

    if (deletedSlugs.length > 0) {
      console.log(`Successfully deleted ${deletedSlugs.length} posts`)
      console.log('Note: Changes are temporary in Vercel. Commit to Git for persistence.')
    }

    return NextResponse.json({ 
      success: true, 
      deleted: deletedSlugs,
      message: `Successfully deleted ${deletedSlugs.length} posts`,
      note: 'Changes are temporary in Vercel Serverless environment'
    })
  } catch (error) {
    console.error('Error deleting posts:', error)
    return NextResponse.json({ 
      error: 'Failed to delete posts',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { slug, status } = await request.json()
    
    if (!slug || !status) {
      return NextResponse.json({ error: 'Missing slug or status' }, { status: 400 })
    }

    const filePath = path.join(contentDirectory, `${slug}.md`)
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Read the file
    const fileContents = fs.readFileSync(filePath, 'utf8')
    const matterResult = matter(fileContents)
    
    // Update the status in frontmatter
    const newFrontmatter = {
      ...matterResult.data,
      status
    }
    
    // Rewrite the file with updated frontmatter
    const newContent = matter.stringify(matterResult.content, newFrontmatter)
    fs.writeFileSync(filePath, newContent, 'utf8')

    return NextResponse.json({ 
      success: true, 
      message: 'Status updated successfully'
    })
  } catch (error) {
    console.error('Error updating status:', error)
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
  }
}
