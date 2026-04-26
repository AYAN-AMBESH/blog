import { Link } from 'react-router-dom'
import { allPosts } from '../lib/blogs.js'
import heroVideo from '../assets/my_vid.mp4'

const latestPosts = allPosts.slice(0, 3)

export function HomePage() {
  return (
    <>
      <section className="hero">
        <h1>Ayan Ambesh</h1>
        <p>
            Security professional with hands-on experience in privacy and
            application security analysis, offensive security workflows, and
            OSINT-driven investigations. Skilled in static and dynamic analysis, 
            vulnerability triage, digital forensics, and security automation using
            Python and Rust. Currently pursuing MSc in Digital Forensics and Information Security
        </p>

        <div className="hero-video-frame">
          <video autoPlay loop muted playsInline controls>
            <source src={heroVideo} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

        <div className="hero-grid">
          <article className="panel">
            <h2>About</h2>
            <p>
               I find things people hide, fix things people broke, and write about both.
               I do application security, OSINT, and digital forensics, 
               basically I'm the person you call after things go wrong,
               and occasionally before. Always perpetually debugging something.
            </p>
          </article>
          <article className="panel">
            <h2>Quick links</h2>
            <p>
              <a href="https://github.com/AYAN-AMBESH" target="_blank" rel="noreferrer">
                GitHub
              </a>{' '}
              /{' '}
              <a href="https://www.linkedin.com/in/ayan-ambesh/" target="_blank" rel="noreferrer">
                LinkedIn
              </a>{' '}
              / <Link to="/resume">Resume</Link> / <Link to="/blog">All posts</Link>
            </p>
          </article>
        </div>
      </section>

      <section className="feed" aria-label="Latest blog posts">
        {latestPosts.length === 0 ? (
          <div className="empty">
            No posts found. Add markdown files to blogs/ and reload.
          </div>
        ) : (
          latestPosts.map((post) => (
            <article className="post-card" key={post.slug}>
              <Link className="post-card-link" to={`/blog/${post.slug}`}>
                <h2 className="post-title">{post.title}</h2>
                <div className="post-meta">{post.dateLabel}</div>
                <p>{post.excerpt}</p>
              </Link>
            </article>
          ))
        )}
      </section>
    </>
  )
}
