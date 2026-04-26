import { Link, useParams } from 'react-router-dom'
import { getPostBySlug } from '../lib/blogs.js'

export function BlogPostPage() {
  const { slug = '' } = useParams()
  const post = getPostBySlug(slug)

  if (!post) {
    return (
      <article className="empty">
        <p>Post not found.</p>
        <p>
          <Link to="/blog">Back to blog</Link>
        </p>
      </article>
    )
  }

  return (
    <article className="article">
      <h1>{post.title}</h1>
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
      <div dangerouslySetInnerHTML={{ __html: post.html }} />
      <p>
        <Link to="/blog">Back to archive</Link>
      </p>
    </article>
  )
}
