import { Link, useParams } from 'react-router-dom'
import { allDocs, getDocBySlug } from '../lib/docs.js'
import { usePageSeo } from '../lib/seo.js'

export function DocPage() {
  const { slug = '' } = useParams()
  const doc = getDocBySlug(slug)
  const baseUrl = window.location.origin
  const docUrl = `${baseUrl}/docs/${slug}`

  usePageSeo({
    title: doc ? `${doc.title} docs` : 'Doc Not Found',
    description: doc
      ? doc.tagline.slice(0, 155)
      : 'The requested documentation page could not be found.',
    type: doc ? 'article' : 'website',
    robots: doc ? 'index,follow' : 'noindex,nofollow',
    structuredData: doc
      ? {
          '@context': 'https://schema.org',
          '@type': 'TechArticle',
          headline: `${doc.title} documentation`,
          description: doc.tagline,
          dateModified: doc.updated ? doc.updated.toISOString() : undefined,
          url: docUrl,
          author: {
            '@type': 'Person',
            name: 'Ayan Ambesh',
          },
          publisher: {
            '@type': 'Person',
            name: 'Ayan Ambesh',
          },
        }
      : null,
  })

  if (!doc) {
    return (
      <article className="empty">
        <p>Doc not found.</p>
        <p>
          <Link to="/docs">Back to docs</Link>
        </p>
      </article>
    )
  }

  const otherDocs = allDocs.filter((entry) => entry.slug !== doc.slug)

  return (
    <article className="article doc-article">
      <h1>{doc.title}</h1>
      {doc.tagline ? <p className="doc-tagline">{doc.tagline}</p> : null}

      <div className="post-meta">
        {doc.language ? <span className="doc-lang">{doc.language}</span> : null}
        {doc.license ? <span>{doc.license} license</span> : null}
        {doc.updatedLabel ? <span>Updated {doc.updatedLabel}</span> : null}
        <div className="tags">
          {doc.tags.map((tag) => (
            <span className="tag" key={tag}>
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {doc.repo ? (
        <p className="doc-actions">
          <a href={doc.repo} rel="noreferrer noopener" target="_blank">
            View source on GitHub ↗
          </a>
        </p>
      ) : null}

      {doc.sections.length > 1 ? (
        <nav className="doc-toc" aria-label="On this page">
          <h2>On this page</h2>
          <ul>
            {doc.sections.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`}>{section.text}</a>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      <div dangerouslySetInnerHTML={{ __html: doc.html }} />

      {otherDocs.length > 0 ? (
        <section className="related-posts" aria-label="Other docs">
          <h2>Other tools</h2>
          <ul>
            {otherDocs.map((entry) => (
              <li key={entry.slug}>
                <Link to={`/docs/${entry.slug}`}>{entry.title}</Link>
                <span>{entry.language}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p>
        <Link to="/docs">Back to docs</Link>
      </p>
    </article>
  )
}
