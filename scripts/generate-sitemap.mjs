import { promises as fs } from 'node:fs'
import path from 'node:path'

const rootDir = process.cwd()
const blogsDir = path.join(rootDir, 'blogs')
const docsDir = path.join(rootDir, 'docs')
const publicDir = path.join(rootDir, 'public')
const siteUrl = (process.env.SITE_URL || 'https://whokilledtulpa.com').replace(/\/$/, '')
const today = new Date().toISOString().slice(0, 10)

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function toSlug(fileName) {
  return fileName.replace(/\.(md|mdx)$/i, '')
}

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n/)
  if (!match) {
    return { data: {}, body: content }
  }

  const rawHeader = match[1]
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

    if (!value) {
      data[key] = []
      activeListKey = key
      continue
    }

    activeListKey = null
    data[key] = value
  }

  return { data, body: content.slice(match[0].length) }
}

function frontmatterSlug(content) {
  const { data } = parseFrontmatter(content)
  return data.slug || null
}

function extractMdxMeta(content) {
  const metaBlock = content.match(/export\s+const\s+meta\s*=\s*\{([\s\S]*?)\}/)
  if (!metaBlock) {
    return {}
  }

  const meta = {}
  const scalarFields = ['title', 'date', 'excerpt', 'slug']

  for (const field of scalarFields) {
    const fieldMatch = metaBlock[1].match(new RegExp(`${field}\\s*:\\s*["']([^"']+)["']`, 'i'))
    if (fieldMatch) {
      meta[field] = fieldMatch[1].trim()
    }
  }

  const tagsMatch = metaBlock[1].match(/tags\s*:\s*\[([^\]]*)\]/i)
  if (tagsMatch) {
    meta.tags = tagsMatch[1]
      .split(',')
      .map((tag) => tag.trim().replace(/^['\"]|['\"]$/g, ''))
      .filter(Boolean)
  }

  return meta
}

function normalizeDate(dateInput) {
  const parsed = new Date(dateInput)
  return Number.isNaN(parsed.getTime()) ? today : parsed.toISOString().slice(0, 10)
}

function markdownExcerpt(body) {
  return body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
    .replace(/[>*_`#-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 180)
}

async function collectBlogEntries() {
  const files = await fs.readdir(blogsDir)
  const contentFiles = files.filter((file) => /\.(md|mdx)$/i.test(file))
  const entries = []

  for (const file of contentFiles) {
    const fullPath = path.join(blogsDir, file)
    const raw = await fs.readFile(fullPath, 'utf8')
    const isMdx = file.toLowerCase().endsWith('.mdx')

    const { data, body } = parseFrontmatter(raw)
    const mdxMeta = isMdx ? extractMdxMeta(raw) : {}

    const slug = data.slug || mdxMeta.slug || frontmatterSlug(raw) || toSlug(file)
    const title = data.title || mdxMeta.title || slug
    const date = normalizeDate(data.date || mdxMeta.date || today)
    const excerpt = data.excerpt || mdxMeta.excerpt || markdownExcerpt(body)

    entries.push({ slug, title, date, excerpt })
  }

  return entries.sort((a, b) => b.date.localeCompare(a.date))
}

async function collectDocEntries() {
  let files = []

  try {
    files = await fs.readdir(docsDir)
  } catch {
    return []
  }

  const entries = []

  for (const file of files.filter((name) => /\.md$/i.test(name))) {
    const raw = await fs.readFile(path.join(docsDir, file), 'utf8')
    const { data } = parseFrontmatter(raw)

    entries.push({
      slug: data.slug || toSlug(file),
      lastmod: normalizeDate(data.updated || today),
    })
  }

  return entries.sort((a, b) => a.slug.localeCompare(b.slug))
}

function getDocRouteEntries(entries) {
  return entries.map((entry) => ({
    path: `/docs/${entry.slug}`,
    lastmod: entry.lastmod,
    changefreq: 'monthly',
    priority: '0.7',
  }))
}

function getBlogRouteEntries(entries) {
  return entries
    .map((entry) => ({
      path: `/blog/${entry.slug}`,
      lastmod: entry.date,
      changefreq: 'monthly',
      priority: '0.72',
    }))
    .sort((a, b) => a.path.localeCompare(b.path))
}

function createSitemapXml(routeEntries) {
  const urls = routeEntries
    .map((routeEntry) => {
      return `  <url>\n    <loc>${siteUrl}${routeEntry.path}</loc>\n    <lastmod>${routeEntry.lastmod}</lastmod>\n    <changefreq>${routeEntry.changefreq}</changefreq>\n    <priority>${routeEntry.priority}</priority>\n  </url>`
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
}

function createRssXml(entries) {
  const items = entries
    .map((entry) => {
      const link = `${siteUrl}/blog/${entry.slug}`
      return `  <item>\n    <title>${escapeXml(entry.title)}</title>\n    <link>${escapeXml(link)}</link>\n    <guid>${escapeXml(link)}</guid>\n    <pubDate>${new Date(entry.date).toUTCString()}</pubDate>\n    <description>${escapeXml(entry.excerpt)}</description>\n  </item>`
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0">\n<channel>\n  <title>whokilledtulpa</title>\n  <link>${siteUrl}</link>\n  <description>Security, OSINT, and digital forensics notes by Ayan Ambesh.</description>\n  <language>en-us</language>\n${items}\n</channel>\n</rss>\n`
}

async function main() {
  const staticRoutes = [
    { path: '/', lastmod: today, changefreq: 'weekly', priority: '1.0' },
    { path: '/blog', lastmod: today, changefreq: 'daily', priority: '0.9' },
    { path: '/terminal', lastmod: today, changefreq: 'monthly', priority: '0.7' },
    { path: '/docs', lastmod: today, changefreq: 'weekly', priority: '0.8' },
    { path: '/resume', lastmod: today, changefreq: 'monthly', priority: '0.6' },
  ]
  const blogEntries = await collectBlogEntries()
  const blogRoutes = getBlogRouteEntries(blogEntries)
  const docRoutes = getDocRouteEntries(await collectDocEntries())
  const allRoutes = [...staticRoutes, ...blogRoutes, ...docRoutes]

  await fs.mkdir(publicDir, { recursive: true })
  await fs.writeFile(path.join(publicDir, 'sitemap.xml'), createSitemapXml(allRoutes), 'utf8')
  await fs.writeFile(path.join(publicDir, 'rss.xml'), createRssXml(blogEntries), 'utf8')

  const robots = `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\nSitemap: ${siteUrl}/rss.xml\n`
  await fs.writeFile(path.join(publicDir, 'robots.txt'), robots, 'utf8')

  console.log(
    `Generated sitemap with ${allRoutes.length} routes (${docRoutes.length} docs) and RSS with ${blogEntries.length} posts.`,
  )
}

main().catch((error) => {
  console.error('Failed to generate sitemap:', error)
  process.exitCode = 1
})
