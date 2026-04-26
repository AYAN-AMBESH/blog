import resumePdf from '../assets/resume.pdf'
import { usePageSeo } from '../lib/seo.js'

export function ResumePage() {
  usePageSeo({
    title: 'Resume',
    description: 'Resume and downloadable PDF for Ayan Ambesh.',
  })

  return (
    <section className="resume-page">
      <div className="resume-toolbar">
        <h1>Resume</h1>
        <a
          className="resume-download"
          href={resumePdf}
          download="Ayan-Ambesh-Resume.pdf"
          aria-label="Download resume PDF"
        >
          Download PDF
        </a>
      </div>

      <div className="resume-viewer" role="region" aria-label="Embedded resume PDF viewer">
        <iframe
          className="resume-embed"
          src={`${resumePdf}#view=FitH`}
          title="Ayan Ambesh Resume"
        />
      </div>
    </section>
  )
}
