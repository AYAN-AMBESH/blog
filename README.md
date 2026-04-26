# Portfolio + Markdown Blog

A React + Vite portfolio inspired by retro personal web blogs.

## Run locally

1. Install dependencies:
	npm install
2. Start dev server:
	npm run dev
3. Build for production:
	npm run build

## How blog posts work

- Put markdown files inside the blogs folder.
- Each markdown file automatically appears in the blog listing and gets a route at /blog/your-file-name.
- Example: blogs/my-day.md becomes /blog/my-day.

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

## Main app routes

- / : Portfolio home
- /blog : Blog archive
- /blog/:slug : Single blog post
