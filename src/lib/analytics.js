const analyticsEndpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT || ''

export function trackPageView({ pathname, title }) {
  if (!analyticsEndpoint) {
    return
  }

  const payload = new URLSearchParams({
    path: pathname,
    title,
    referrer: document.referrer || 'direct',
  })

  if (navigator.sendBeacon) {
    navigator.sendBeacon(analyticsEndpoint, payload)
    return
  }

  fetch(analyticsEndpoint, {
    method: 'POST',
    body: payload,
    keepalive: true,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  }).catch(() => {})
}
