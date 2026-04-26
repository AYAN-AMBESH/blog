import { Link, useParams } from 'react-router-dom'
import { getPostBySlug, getRelatedPosts } from '../lib/blogs.js'
import { usePageSeo } from '../lib/seo.js'

export function BlogPostPage() {
  const { slug = '' } = useParams()
  const post = getPostBySlug(slug)

  usePageSeo({
    title: post ? post.title : 'Post Not Found',
    description: post
      ? `${post.excerpt.slice(0, 145)}...`
      : 'The requested post could not be found in the archive.',
    type: post ? 'article' : 'website',
  })

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

  const relatedPosts = getRelatedPosts(post.slug, 3)
  const PostComponent = post.Component
  const mdxComponents = {
    img: (props) => <img loading="lazy" decoding="async" {...props} />,
  }

  return (
    <article className="article">
      <h1>{post.title}</h1>
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
      {PostComponent ? (
        <PostComponent components={mdxComponents} />
      ) : (
        <div dangerouslySetInnerHTML={{ __html: post.html }} />
      )}

      {relatedPosts.length > 0 ? (
        <section className="related-posts" aria-label="Related posts">
          <h2>Related posts</h2>
          <ul>
            {relatedPosts.map((relatedPost) => (
              <li key={relatedPost.slug}>
                <Link to={`/blog/${relatedPost.slug}`}>{relatedPost.title}</Link>
                <span>{relatedPost.readingLabel}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p>
        <Link to="/blog">Back to archive</Link>
      </p>
    </article>
  )
}
