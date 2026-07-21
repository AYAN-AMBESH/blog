import { Marked } from 'marked'
import DOMPurify from 'dompurify'

/**
 * A dedicated instance rather than the shared `marked` singleton: docs are hard-wrapped
 * prose, so `breaks` must stay off or every wrapped line becomes a <br>. The blog keeps
 * its own `breaks: true` setting untouched.
 */
const markdown = new Marked({ gfm: true, breaks: false })

const docModules = import.meta.glob('../../docs/*.md', {
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

function toPlainText(markdown) {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[(.*?)\]\((.*?)\)/g, '$1')
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[>*_~|-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function sanitizeHtml(html) {
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ['style', 'script', 'iframe', 'object', 'embed', 'form', 'input', 'button'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'style'],
    ALLOW_UNKNOWN_PROTOCOLS: false,
  })
}

/**
 * marked no longer emits heading ids, so add them back for the in-page table of contents.
 * Runs after sanitizing since DOMPurify keeps `id` but not everything we might inject.
 */
function addHeadingIds(html) {
  return html.replace(/<h2>([\s\S]*?)<\/h2>/gi, (fullMatch, inner) => {
    const text = inner.replace(/<[^>]+>/g, '')
    return `<h2 id="${slugifyHeading(text)}">${inner}</h2>`
  })
}

/** Rule tables are wide; let them scroll inside their own box instead of the page. */
function wrapTables(html) {
  return html.replace(/<table>[\s\S]*?<\/table>/gi, (table) => {
    return `<div class="table-scroll">${table}</div>`
  })
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

function normalizeTags(tagsInput) {
  if (!Array.isArray(tagsInput)) {
    return []
  }

  return tagsInput.map((tag) => String(tag).trim()).filter(Boolean)
}

/**
 * Collect the `## ` headings so each doc page can render its own table of contents.
 * Ids come from the same slugifier `addHeadingIds` uses, so the anchors line up.
 */
function extractSections(source) {
  const sections = []
  let insideCodeFence = false

  for (const line of source.split('\n')) {
    if (line.trimStart().startsWith('```')) {
      insideCodeFence = !insideCodeFence
      continue
    }

    if (insideCodeFence) {
      continue
    }

    const headingMatch = line.match(/^##\s+(.+?)\s*$/)
    if (!headingMatch) {
      continue
    }

    const text = headingMatch[1].replace(/`/g, '')
    sections.push({ text, id: slugifyHeading(text) })
  }

  return sections
}

function slugifyHeading(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
}

export const allDocs = Object.entries(docModules)
  .map(([filePath, source]) => {
    const { data, content } = parseFrontmatter(source)
    const slug = data.slug || filePathToSlug(filePath)
    const updatedDate = normalizeDate(data.updated)

    return {
      slug,
      title: data.title || slug,
      tagline: data.tagline || '',
      repo: data.repo || '',
      language: data.language || '',
      license: data.license || '',
      status: data.status || '',
      order: Number.parseInt(data.order, 10) || 999,
      updated: updatedDate,
      updatedLabel: updatedDate ? formatDate(updatedDate) : '',
      tags: normalizeTags(data.tags),
      sections: extractSections(content),
      content: toPlainText(content),
      html: wrapTables(
        addHeadingIds(addLazyLoadingToImages(sanitizeHtml(markdown.parse(content)))),
      ),
    }
  })
  .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))

export function getDocBySlug(slug) {
  return allDocs.find((doc) => doc.slug === slug)
}

export const allDocTags = Array.from(
  new Set(allDocs.flatMap((doc) => doc.tags.map((tag) => tag.toLowerCase()))),
).sort((a, b) => a.localeCompare(b))
