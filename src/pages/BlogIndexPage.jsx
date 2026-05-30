import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { allPosts, allTags } from '../lib/blogs.js'
import { usePageSeo } from '../lib/seo.js'

export function BlogIndexPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTag, setActiveTag] = useState('all')
  const baseUrl = window.location.origin

  usePageSeo({
    title: 'Blog Archive',
    description:
      'Security, OSINT, and digital forensics notes with searchable posts and tag filters.',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Blog Archive',
      url: `${baseUrl}/blog`,
      description: 'Security, OSINT, and digital forensics notes with searchable posts and tag filters.',
    },
  })

  const filteredPosts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    return allPosts.filter((post) => {
      const matchesTag =
        activeTag === 'all' || post.tags.some((tag) => tag.toLowerCase() === activeTag)

      if (!matchesTag) {
        return false
      }

      if (!query) {
        return true
      }

      const haystack = `${post.title} ${post.excerpt} ${post.tags.join(' ')} ${post.content}`.toLowerCase()
      return haystack.includes(query)
    })
  }, [activeTag, searchTerm])

  return (
    <section>
      <div className="hero">
        <h1>Blog Archive</h1>
        <p>
          Every markdown file in blogs/ becomes a post card here and a page at
          /blog/your-file-name.
        </p>
      </div>

      <div className="blog-controls" aria-label="Blog filters">
        <label className="search-label" htmlFor="blog-search-input">
          Search posts
        </label>
        <input
          id="blog-search-input"
          className="search-input"
          type="search"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search by topic, tool, or keyword"
        />

        <div className="filter-tags" role="tablist" aria-label="Filter posts by tag">
          <button
            type="button"
            className={`filter-tag ${activeTag === 'all' ? 'is-active' : ''}`}
            onClick={() => setActiveTag('all')}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              type="button"
              key={tag}
              className={`filter-tag ${activeTag === tag ? 'is-active' : ''}`}
              onClick={() => setActiveTag(tag)}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      <div className="feed" style={{ marginTop: '1rem' }}>
        {filteredPosts.length === 0 ? (
          <div className="empty">
            {allPosts.length === 0
              ? 'No posts yet. Create your first markdown file.'
              : 'No posts match your current search and tag filters.'}
          </div>
        ) : (
          filteredPosts.map((post) => (
            <article className="post-card" key={post.slug}>
              <Link className="post-card-link" to={`/blog/${post.slug}`}>
                <h2 className="post-title">{post.title}</h2>
                <div className="post-meta">
                  <span>{post.dateLabel}</span>
                  <span>{post.readingLabel}</span>
                  <div className="tags">
                    {post.tags.map((tag) => (
                      <span className="tag" key={tag}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
                <p>{post.excerpt}</p>
              </Link>
            </article>
          ))
        )}
      </div>
    </section>
  )
}
