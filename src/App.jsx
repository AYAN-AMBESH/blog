import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout.jsx'
import { BlogIndexPage } from './pages/BlogIndexPage.jsx'
import { BlogPostPage } from './pages/BlogPostPage.jsx'
import { HomePage } from './pages/HomePage.jsx'
import { NotFoundPage } from './pages/NotFoundPage.jsx'
import { ResumePage } from './pages/ResumePage.jsx'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/resume" element={<ResumePage />} />
        <Route path="/blog" element={<BlogIndexPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  )
}

export default App
