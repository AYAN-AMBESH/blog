import { marked } from 'marked'

const postModules = import.meta.glob('../../blogs/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
})

function filePathToSlug(filePath) {
  const fileName = filePath.split('/').at(-1) ?? ''
  return fileName.replace(/\.md$/i, '')
}

function parseFrontmatter(source) {
  if (!source.startsWith('---\n')) {
    return { data: {}, content: source }
  }

  const end = source.indexOf('\n---\n', 4)
  if (end === -1) {
    return { data: {}, content: source }
  }

  const rawHeader = source.slice(4, end)
  const content = source.slice(end + 5)
  const data = {}
  let activeListKey = null

  for (const line of rawHeader.split('\n')) {
    if (!line.trim()) {
      continue
    }

    const listMatch = line.match(/^\s*-\s+(.+)$/)
    if (listMatch && activeListKey) {
      data[activeListKey] = data[activeListKey] || []
      data[activeListKey].push(listMatch[1].trim())
      continue
    }

    const keyValueMatch = line.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/)
    if (!keyValueMatch) {
      activeListKey = null
      continue
    }

    const key = keyValueMatch[1].trim()
    const value = keyValueMatch[2].trim()

    if (value === '') {
      data[key] = []
      activeListKey = key
      continue
    }

    activeListKey = null
    data[key] = value
  }

  return { data, content }
}

function normalizeDate(input) {
  const date = new Date(input)
  return Number.isNaN(date.getTime()) ? null : date
}

function formatDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(date)
}

function firstParagraph(text) {
  const clean = text
    .replace(/^#+\s+/gm, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
    .replace(/[>*_`-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  return clean.slice(0, 170)
}

marked.setOptions({ gfm: true, breaks: true })

export const allPosts = Object.entries(postModules)
  .map(([filePath, source]) => {
    const { data, content } = parseFrontmatter(source)
    const slug = data.slug || filePathToSlug(filePath)
    const parsedDate = normalizeDate(data.date)

    return {
      slug,
      title: data.title || slug,
      date: parsedDate,
      dateLabel: parsedDate ? formatDate(parsedDate) : 'Unknown date',
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      excerpt: data.excerpt || firstParagraph(content),
      html: marked.parse(content),
    }
  })
  .sort((a, b) => {
    const left = a.date ? a.date.getTime() : 0
    const right = b.date ? b.date.getTime() : 0
    return right - left
  })

export function getPostBySlug(slug) {
  return allPosts.find((post) => post.slug === slug)
}
