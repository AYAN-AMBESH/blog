import { promises as fs } from 'node:fs'
import path from 'node:path'

const rootDir = process.cwd()
const blogsDir = path.join(rootDir, 'blogs')

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

async function main() {
  const titleArg = process.argv.slice(2).join(' ').trim()
  const title = titleArg || 'Untitled Post'
  const slug = slugify(title)
  const date = new Date().toISOString().slice(0, 10)
  const targetPath = path.join(blogsDir, `${slug}.md`)

  await fs.mkdir(blogsDir, { recursive: true })

  const exists = await fs
    .access(targetPath)
    .then(() => true)
    .catch(() => false)

  if (exists) {
    console.error(`A post with slug \"${slug}\" already exists at ${targetPath}`)
    process.exitCode = 1
    return
  }

  const template = `---\ntitle: ${title}\ndate: ${date}\ntags:\n  - notes\nexcerpt: Short summary for cards and RSS.\n---\n\nWrite your post here.\n`

  await fs.writeFile(targetPath, template, 'utf8')
  console.log(`Created new post: blogs/${slug}.md`)
}

main().catch((error) => {
  console.error('Failed to create new post:', error)
  process.exitCode = 1
})
