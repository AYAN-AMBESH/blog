import { Link } from 'react-router-dom'
import { usePageSeo } from '../lib/seo.js'

export function NotFoundPage() {
  usePageSeo({
    title: '404 Not Found',
    description: 'Page not found. Explore the blog archive, homepage, or resume.',
    robots: 'noindex,nofollow',
  })

  return (
    <section className="not-found-page" aria-label="Page not found">
      <p className="not-found-code">404</p>
      <h1>Signal Lost in the Archive</h1>
      <p>
        The route you requested does not exist. It might have been moved, renamed, or never
        deployed.
      </p>
      <div className="not-found-actions">
        <Link to="/">Go home</Link>
        <Link to="/blog">Browse blog</Link>
        <Link to="/resume">Open resume</Link>
        <a href="/rss.xml">RSS feed</a>
        <a href="https://github.com/AYAN-AMBESH" target="_blank" rel="noreferrer">
          GitHub
        </a>
      </div>
    </section>
  )
}