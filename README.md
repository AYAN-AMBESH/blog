# Portfolio + Markdown and MDX Blog

A React + Vite portfolio inspired by retro personal web blogs.

## Run locally

1. Install dependencies:
	npm install
2. Start dev server:
	npm run dev
3. Build for production:
	npm run build

## Content workflow

- Put markdown or MDX files inside the blogs folder.
- Each post becomes a route at /blog/your-file-name.
- Example: blogs/my-day.md becomes /blog/my-day.

### Create a new post quickly

Run:
	npm run new:post -- "My Post Title"

This scaffolds a markdown file with frontmatter in blogs/.

### Frontmatter format

Use this optional frontmatter block at the top of each markdown file:

---
title: My Post Title
date: 2026-04-26
tags:
  - life
  - notes
excerpt: Optional short summary shown on cards.
---

If you skip frontmatter, the file name is used as title/slug.

### MDX post format

MDX files support components inside posts.

Use `meta` export for post metadata:

```mdx
export const meta = {
	title: 'My MDX Post',
	date: '2026-04-26',
	tags: ['mdx', 'notes'],
	excerpt: 'Short summary for cards and RSS.',
	slug: 'my-mdx-post'
}

## Hello from MDX

You can render JSX and custom components here.
```

## Reach and SEO

- RSS feed is generated at /rss.xml.
- Sitemap is generated at /sitemap.xml.
- robots.txt is generated in public/ on build.
- Open Graph and Twitter metadata are set globally and per page.

### Build-time feed generation

- `npm run build` automatically runs the sitemap/feed generator first.
- `npm run sitemap` runs generation directly.

## Privacy-friendly analytics

Set this environment variable to enable simple pageview tracking:

- `VITE_ANALYTICS_ENDPOINT`

Example endpoint types:
- Self-hosted analytics ingest endpoint
- Serverless function collecting pageview events

If the variable is not set, analytics calls are skipped.

## Automated checks (GitHub Actions)

On push and pull requests, workflow checks run:

- Production build (`npm run build`)
- Link checker for README and blog content

## Main app routes

- / : Portfolio home
- /blog : Blog archive
- /blog/:slug : Single blog post
- /resume : Resume page
- * : Custom 404 page
