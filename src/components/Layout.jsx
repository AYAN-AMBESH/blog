import { useEffect, useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import chiruImage from '../assets/chiru.jpeg'

export function Layout({ children }) {
  const [showChiruMessage, setShowChiruMessage] = useState(false)
  const [chiruClickCount, setChiruClickCount] = useState(0)

  useEffect(() => {
    if (!showChiruMessage) {
      return undefined
    }

    const hideTimer = setTimeout(() => {
      setShowChiruMessage(false)
    }, 4200)

    return () => clearTimeout(hideTimer)
  }, [showChiruMessage])

  const handleChiruClick = () => {
    setChiruClickCount((count) => count + 1)
    setShowChiruMessage(true)
  }

  return (
    <>
      <div className="shell">
        <header className="topbar">
          <Link to="/" className="logo">
            whokilledtulpa 
          </Link>
          <nav className="nav" aria-label="Primary">
            <NavLink to="/" end>
              home
            </NavLink>
            <NavLink to="/blog">blog</NavLink>
          </nav>
        </header>
        <main className="content">{children}</main>
        <footer className="footer">
            Made by someone who knows how to break into systems but still Googles CSS flexbox. © 2026 Ayan Ambesh.
        </footer>
      </div>

      <aside className={`floating-chiru ${showChiruMessage ? 'is-active' : ''}`}>
        <button
          key={chiruClickCount}
          type="button"
          className="floating-chiru-button"
          onClick={handleChiruClick}
          aria-label="Show Chiru welcome message"
        >
          <img src={chiruImage} alt="Chiru the cat" />
        </button>
        <p className={`chiru-message ${showChiruMessage ? 'is-visible' : ''}`}>
          This is my pet cat chiru, He welcomes you with all his little heart
        </p>
      </aside>
    </>
  )
}
