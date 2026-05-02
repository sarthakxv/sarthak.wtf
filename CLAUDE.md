# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal portfolio website for Sarthak Verma, built with Next.js 16, React 19, TypeScript, and Tailwind CSS 4. The site features a minimal one-page layout with MDX blog support and animated components powered by Motion-Primitives.

## Development Commands

This project uses **pnpm** (see `pnpm-lock.yaml`). Commands work with `npm` too, but stick with pnpm to avoid lockfile drift.

```bash
# Install dependencies
pnpm install

# Run development server (default: http://localhost:3000)
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Type-check (use this — see note below)
npx tsc --noEmit
```

**Heads-up:** `pnpm lint` is currently broken — Next.js 16 removed `next lint`, so the script in `package.json` errors out. Use `npx tsc --noEmit` for verification until the lint script is migrated to ESLint CLI. There is no test suite configured.

## Project Structure

### Core Directories

- `app/` - Next.js App Router pages and layouts
  - `data.ts` - Central data source for projects, work experience, blog posts, and personal info
  - `page.tsx` - Main portfolio page with all sections
  - `layout.tsx` - Root layout with metadata, fonts (Geist, Geist Mono), and theme provider
  - `header.tsx` / `footer.tsx` - Site chrome
  - `robots.ts` - Generates `/robots.txt` (uses `WEBSITE_URL` from `data.ts`)
  - `essay/` - MDX blog posts directory with custom layout
- `components/ui/` - Reusable animated UI components from Motion-Primitives
- `hooks/useClickOutside.tsx` - Click-outside hook (used by `morphing-dialog`)
- `lib/utils.ts` - Utility functions (`cn` helper for Tailwind class merging)
- `mdx-components.tsx` - Required by `@next/mdx`. Defines a `<Cover>` figure component and overrides `<code>` to apply `sugar-high` syntax highlighting in MDX posts.
- `public/` - Static assets

### Key Configuration Files

- `next.config.mjs` - Wraps the Next config in `withMDX` and adds `md`/`mdx` to `pageExtensions` so MDX files become routes.
- `tsconfig.json` - TypeScript config with `@/*` path alias pointing to root
- `eslint.config.mjs` - ESLint with Next.js, TypeScript, Prettier, and MDX support
- `.prettierrc.json` - Style is **no semicolons, single quotes, 2-space tabs, trailing commas, 80 col**, with `prettier-plugin-tailwindcss` for class sorting. Match this when generating new code.

## Architecture

### Data Management

All content is centralized in `app/data.ts`:

- `PROJECTS` - Portfolio projects with `name`, `description`, `link`, `image`, and `id`
- `WORK_EXPERIENCE` - Job history with company, title, dates, and description
- `BLOG_POSTS` - Essay links and metadata
- `SOCIAL_LINKS` - External profile links
- `PERSONAL_INFO` - Name, title, description, email, company info, etc.

**Important**: When updating portfolio content, always edit `app/data.ts` - do not hardcode content in components.

### Blog/Essay System

- Blog posts are MDX files in `app/essay/[slug]/page.mdx`
- Custom essay layout in `app/essay/layout.tsx` includes scroll progress indicator and copy URL button
- New blog posts must be added to `BLOG_POSTS` array in `data.ts` with matching link path

### Animation Architecture

The site uses Motion (motion.js) for animations:

- Main page uses staggered fade-in animations with `VARIANTS_CONTAINER` and `VARIANTS_SECTION`
- Mobile detection for hover states: `isMobile` state controls when hover animations are always active
- Load-bearing components in `components/ui/` (browse the directory for the rest):
  - `morphing-dialog.tsx` — expandable image/video modals (uses `useClickOutside`)
  - `magnetic.tsx` — magnetic hover for interactive elements
  - `spotlight.tsx` — gradient spotlight on hover
  - `animated-background.tsx` — list-item background animation

### Styling

- Tailwind CSS 4 with dark mode support via `next-themes`
- `@tailwindcss/typography` for MDX prose styling
- Custom fonts: Geist (sans) and Geist Mono (monospace)
- Dark mode: System-based default, toggleable via theme provider
- Utility function `cn()` in `lib/utils.ts` for merging Tailwind classes

## Key Patterns

### Adding New Projects

1. Add project object to `PROJECTS` array in `app/data.ts`
2. Include: `name`, `description`, `link`, `image`, and unique `id`
3. Drop the cover image at `public/images/<slug>-cover.webp` — every existing entry follows this naming convention

### Adding New Blog Posts

1. Create directory `app/essay/[slug]/`
2. Add `page.mdx` file with content (use `<Cover src=… alt=… caption=… />` for hero images — defined in `mdx-components.tsx`)
3. Add entry to `BLOG_POSTS` array in `app/data.ts` with matching link path
4. Code blocks in MDX are auto-highlighted via `sugar-high` — no language fences or extra config needed

### Creating Animated Components

- Use `motion` from 'motion/react' for animations
- Follow existing patterns in `app/page.tsx` for staggered animations
- Include mobile detection when using hover animations
- Spring animations typically use `{ type: 'spring', bounce: 0, duration: 0.3 }`

### Path Aliases

- `@/` maps to project root (configured in tsconfig.json)
- Example: `import { cn } from '@/lib/utils'`

## SEO and Metadata

Metadata is configured in `app/layout.tsx`:

- `WEBSITE_URL` in `app/data.ts` is the source of truth for canonical URL, OG, and `robots.ts` — update it when domain changes
- Metadata includes OpenGraph, Twitter cards, and structured data
- Viewport settings and theme color defined in layout
- Vercel Analytics is wired in `app/layout.tsx` via `@vercel/analytics/next`
