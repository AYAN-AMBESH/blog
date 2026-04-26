import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout.jsx'
import { BlogIndexPage } from './pages/BlogIndexPage.jsx'
import { BlogPostPage } from './pages/BlogPostPage.jsx'
import { HomePage } from './pages/HomePage.jsx'
import { ResumePage } from './pages/ResumePage.jsx'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/resume" element={<ResumePage />} />
        <Route path="/blog" element={<BlogIndexPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

export default App
