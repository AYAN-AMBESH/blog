import { Link } from 'react-router-dom'
import { allPosts } from '../lib/blogs.js'

export function BlogIndexPage() {
  return (
    <section>
      <div className="hero">
        <h1>Blog Archive</h1>
        <p>
          Every markdown file in blogs/ becomes a post card here and a page at
          /blog/your-file-name.
        </p>
      </div>

      <div className="feed" style={{ marginTop: '1rem' }}>
        {allPosts.length === 0 ? (
          <div className="empty">No posts yet. Create your first markdown file.</div>
        ) : (
          allPosts.map((post) => (
            <article className="post-card" key={post.slug}>
              <Link className="post-card-link" to={`/blog/${post.slug}`}>
                <h2 className="post-title">{post.title}</h2>
                <div className="post-meta">
                  <span>{post.dateLabel}</span>
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
