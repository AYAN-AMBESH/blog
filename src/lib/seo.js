import { useEffect } from 'react'

function upsertMetaByName(name, content) {
  let element = document.querySelector(`meta[name="${name}"]`)

  if (!element) {
    element = document.createElement('meta')
    element.setAttribute('name', name)
    document.head.appendChild(element)
  }

  element.setAttribute('content', content)
}

function upsertMetaByProperty(property, content) {
  let element = document.querySelector(`meta[property="${property}"]`)

  if (!element) {
    element = document.createElement('meta')
    element.setAttribute('property', property)
    document.head.appendChild(element)
  }

  element.setAttribute('content', content)
}

function upsertCanonical(url) {
  let canonical = document.querySelector('link[rel="canonical"]')

  if (!canonical) {
    canonical = document.createElement('link')
    canonical.setAttribute('rel', 'canonical')
    document.head.appendChild(canonical)
  }

  canonical.setAttribute('href', url)
}

export function usePageSeo({ title, description, type = 'website' }) {
  useEffect(() => {
    const siteName = 'whokilledtulpa'
    const fullTitle = title ? `${title} | ${siteName}` : siteName

    document.title = fullTitle
    upsertMetaByName('description', description)
    upsertMetaByName('robots', 'index,follow')
    upsertMetaByName('twitter:card', 'summary')
    upsertMetaByName('twitter:title', fullTitle)
    upsertMetaByName('twitter:description', description)

    upsertMetaByProperty('og:title', fullTitle)
    upsertMetaByProperty('og:description', description)
    upsertMetaByProperty('og:type', type)

    const canonicalUrl = `${window.location.origin}${window.location.pathname}`
    upsertCanonical(canonicalUrl)
    upsertMetaByProperty('og:url', canonicalUrl)
  }, [description, title, type])
}
