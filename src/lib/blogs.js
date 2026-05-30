import { marked } from 'marked'
import DOMPurify from 'dompurify'

const markdownPostModules = import.meta.glob('../../blogs/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
})

const mdxPostModules = import.meta.glob('../../blogs/*.mdx', {
  eager: true,
})

function filePathToSlug(filePath) {
  const fileName = filePath.split('/').at(-1) ?? ''
  return fileName.replace(/\.(md|mdx)$/i, '')
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

function toPlainText(markdown) {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[(.*?)\]\((.*?)\)/g, '$1')
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[>*_~-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function countWords(text) {
  return text ? text.split(/\s+/).filter(Boolean).length : 0
}

function readingTimeLabel(minutes) {
  return `${minutes} min read`
}

function addLazyLoadingToImages(html) {
  return html.replace(/<img\b([^>]*?)>/gi, (fullMatch, attrs) => {
    let nextAttrs = attrs

    if (!/\bloading\s*=/.test(nextAttrs)) {
      nextAttrs += ' loading="lazy"'
    }

    if (!/\bdecoding\s*=/.test(nextAttrs)) {
      nextAttrs += ' decoding="async"'
    }

    return `<img${nextAttrs}>`
  })
}

function sanitizeHtml(html) {
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ['style', 'script', 'iframe', 'object', 'embed', 'form', 'input', 'button'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'style'],
    ALLOW_UNKNOWN_PROTOCOLS: false,
  })
}

function normalizeTags(tagsInput) {
  if (!Array.isArray(tagsInput)) {
    return []
  }

  return tagsInput.map((tag) => String(tag).trim()).filter(Boolean)
}

marked.setOptions({ gfm: true, breaks: true })

const markdownPosts = Object.entries(markdownPostModules)
  .map(([filePath, source]) => {
    const { data, content } = parseFrontmatter(source)
    const slug = data.slug || filePathToSlug(filePath)
    const parsedDate = normalizeDate(data.date)
    const plainContent = toPlainText(content)
    const wordCount = countWords(plainContent)
    const readingMinutes = Math.max(1, Math.ceil(wordCount / 200))
    const tags = normalizeTags(data.tags)

    return {
      slug,
      title: data.title || slug,
      date: parsedDate,
      dateLabel: parsedDate ? formatDate(parsedDate) : 'Unknown date',
      tags,
      excerpt: data.excerpt || firstParagraph(content),
      content: plainContent,
      wordCount,
      readingMinutes,
      readingLabel: readingTimeLabel(readingMinutes),
      html: addLazyLoadingToImages(sanitizeHtml(marked.parse(content))),
      Component: null,
    }
  })

const mdxPosts = Object.entries(mdxPostModules).map(([filePath, module]) => {
  const mdxModule = module || {}
  const meta = typeof mdxModule.meta === 'object' && mdxModule.meta ? mdxModule.meta : {}
  const slug = meta.slug || filePathToSlug(filePath)
  const parsedDate = normalizeDate(meta.date)
  const tags = normalizeTags(meta.tags)
  const excerpt = meta.excerpt || `MDX post: ${meta.title || slug}`
  const plainContent = [meta.title || slug, excerpt, tags.join(' '), meta.searchText || '']
    .join(' ')
    .trim()
  const wordCount = countWords(plainContent)
  const readingMinutes = Math.max(1, Math.ceil((wordCount || 120) / 200))

  return {
    slug,
    title: meta.title || slug,
    date: parsedDate,
    dateLabel: parsedDate ? formatDate(parsedDate) : 'Unknown date',
    tags,
    excerpt,
    content: plainContent,
    wordCount,
    readingMinutes,
    readingLabel: readingTimeLabel(readingMinutes),
    html: null,
    Component: typeof mdxModule.default === 'function' ? mdxModule.default : null,
  }
})

export const allPosts = [...markdownPosts, ...mdxPosts]
  .sort((a, b) => {
    const left = a.date ? a.date.getTime() : 0
    const right = b.date ? b.date.getTime() : 0
    return right - left
  })

export function getPostBySlug(slug) {
  return allPosts.find((post) => post.slug === slug)
}

export const allTags = Array.from(
  new Set(allPosts.flatMap((post) => post.tags.map((tag) => tag.toLowerCase()))),
).sort((a, b) => a.localeCompare(b))

export function getRelatedPosts(slug, limit = 3) {
  const currentPost = getPostBySlug(slug)
  if (!currentPost) {
    return []
  }

  const currentTags = new Set(currentPost.tags.map((tag) => tag.toLowerCase()))

  return allPosts
    .filter((post) => post.slug !== slug)
    .map((post) => {
      const overlap = post.tags.reduce((score, tag) => {
        return currentTags.has(tag.toLowerCase()) ? score + 1 : score
      }, 0)

      return { post, overlap }
    })
    .filter(({ overlap }) => overlap > 0)
    .sort((left, right) => {
      if (right.overlap !== left.overlap) {
        return right.overlap - left.overlap
      }

      const leftDate = left.post.date ? left.post.date.getTime() : 0
      const rightDate = right.post.date ? right.post.date.getTime() : 0
      return rightDate - leftDate
    })
    .slice(0, limit)
    .map(({ post }) => post)
}
