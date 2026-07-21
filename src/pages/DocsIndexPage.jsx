import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { allDocs, allDocTags } from '../lib/docs.js'
import { usePageSeo } from '../lib/seo.js'

export function DocsIndexPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTag, setActiveTag] = useState('all')
  const baseUrl = window.location.origin

  usePageSeo({
    title: 'Docs',
    description:
      'Documentation for the security tools I build — javscan, sapyscan, and splice: install steps, usage, rules, and design notes.',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Docs',
      url: `${baseUrl}/docs`,
      description:
        'Documentation for javscan, sapyscan, and splice — install steps, usage, rules, and design notes.',
    },
  })

  const filteredDocs = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    return allDocs.filter((doc) => {
      const matchesTag =
        activeTag === 'all' || doc.tags.some((tag) => tag.toLowerCase() === activeTag)

      if (!matchesTag) {
        return false
      }

      if (!query) {
        return true
      }

      const haystack =
        `${doc.title} ${doc.tagline} ${doc.language} ${doc.tags.join(' ')} ${doc.content}`.toLowerCase()
      return haystack.includes(query)
    })
  }, [activeTag, searchTerm])

  return (
    <section>
      <div className="hero">
        <h1>Docs</h1>
        <p>
          Documentation for the tools I build and maintain. Two static analysers and one
          intercepting proxy — what they do, how to run them, and why they are built the way
          they are.
        </p>
      </div>

      <div className="blog-controls" aria-label="Docs filters">
        <label className="search-label" htmlFor="docs-search-input">
          Search docs
        </label>
        <input
          id="docs-search-input"
          className="search-input"
          type="search"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search by tool, flag, or keyword"
        />

        <div className="filter-tags" role="tablist" aria-label="Filter docs by tag">
          <button
            type="button"
            className={`filter-tag ${activeTag === 'all' ? 'is-active' : ''}`}
            onClick={() => setActiveTag('all')}
          >
            All
          </button>
          {allDocTags.map((tag) => (
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
        {filteredDocs.length === 0 ? (
          <div className="empty">
            {allDocs.length === 0
              ? 'No docs yet. Add a markdown file to the docs directory.'
              : 'No docs match your current search and tag filters.'}
          </div>
        ) : (
          filteredDocs.map((doc) => (
            <article className="post-card doc-card" key={doc.slug}>
              <Link className="post-card-link" to={`/docs/${doc.slug}`}>
                <h2 className="post-title">{doc.title}</h2>
                <div className="post-meta">
                  {doc.language ? <span className="doc-lang">{doc.language}</span> : null}
                  {doc.updatedLabel ? <span>Updated {doc.updatedLabel}</span> : null}
                  <div className="tags">
                    {doc.tags.map((tag) => (
                      <span className="tag" key={tag}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
                <p>{doc.tagline}</p>
              </Link>
              {doc.repo ? (
                <a className="doc-repo-link" href={doc.repo} rel="noreferrer noopener" target="_blank">
                  source ↗
                </a>
              ) : null}
            </article>
          ))
        )}
      </div>
    </section>
  )
}
