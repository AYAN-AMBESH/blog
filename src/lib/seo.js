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

function upsertJsonLd(id, data) {
  const selector = `script[type="application/ld+json"][data-seo-id="${id}"]`
  let script = document.head.querySelector(selector)

  if (!data) {
    if (script) {
      script.remove()
    }
    return
  }

  if (!script) {
    script = document.createElement('script')
    script.setAttribute('type', 'application/ld+json')
    script.setAttribute('data-seo-id', id)
    document.head.appendChild(script)
  }

  script.textContent = JSON.stringify(data)
}

export function usePageSeo({ title, description, type = 'website', robots = 'index,follow', structuredData = null }) {
  useEffect(() => {
    const siteName = 'whokilledtulpa'
    const fullTitle = title ? `${title} | ${siteName}` : siteName

    document.title = fullTitle
    upsertMetaByName('description', description)
    upsertMetaByName('robots', robots)
    upsertMetaByName('author', 'Ayan Ambesh')
    upsertMetaByName('twitter:card', 'summary')
    upsertMetaByName('twitter:title', fullTitle)
    upsertMetaByName('twitter:description', description)

    upsertMetaByProperty('og:site_name', siteName)
    upsertMetaByProperty('og:title', fullTitle)
    upsertMetaByProperty('og:description', description)
    upsertMetaByProperty('og:type', type)

    const canonicalUrl = `${window.location.origin}${window.location.pathname}`
    upsertCanonical(canonicalUrl)
    upsertMetaByProperty('og:url', canonicalUrl)

    const websiteSchema = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: siteName,
      url: window.location.origin,
      inLanguage: 'en',
    }

    const userSchema = structuredData
      ? Array.isArray(structuredData)
        ? structuredData
        : [structuredData]
      : []

    upsertJsonLd('website', websiteSchema)
    upsertJsonLd('page', userSchema.length > 0 ? userSchema : null)
  }, [description, robots, structuredData, title, type])
}
