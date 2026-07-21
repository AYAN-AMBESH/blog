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
        {/*
          `target="_blank"` is the mobile fallback: in-app webviews (Instagram, LinkedIn)
          and older iOS Safari ignore `download` entirely, and without a target the tap
          does nothing at all. With it, the PDF at least opens in a viewer.
        */}
        <a
          className="resume-download"
          href={resumePdf}
          download="Ayan-Ambesh-Resume.pdf"
          type="application/pdf"
          target="_blank"
          rel="noopener"
          aria-label="Download resume PDF"
        >
          Download PDF
        </a>
      </div>

      <div className="resume-viewer" role="region" aria-label="Embedded resume PDF viewer">
        {/*
          `<object>` rather than `<iframe>` so browsers that cannot render a PDF inline —
          which is most mobile browsers — show the fallback below instead of a blank box.
        */}
        <object
          className="resume-embed"
          data={`${resumePdf}#view=FitH`}
          type="application/pdf"
          aria-label="Ayan Ambesh Resume"
        >
          <div className="resume-fallback">
            <p>
              Your browser cannot display PDFs inline — most mobile browsers cannot.
            </p>
            <a href={resumePdf} target="_blank" rel="noopener">
              Open the resume PDF ↗
            </a>
          </div>
        </object>
      </div>
    </section>
  )
}
