# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal portfolio website for Sarthak Verma, built with Next.js 16, React 19, TypeScript, and Tailwind CSS 4. The site features a minimal one-page layout with MDX blog support and animated components powered by Motion-Primitives.

## Development Commands

```bash
# Install dependencies
npm install

# Run development server (default: http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Project Structure

### Core Directories

- `app/` - Next.js App Router pages and layouts
  - `data.ts` - Central data source for projects, work experience, blog posts, and personal info
  - `page.tsx` - Main portfolio page with all sections
  - `layout.tsx` - Root layout with metadata, fonts (Geist, Geist Mono), and theme provider
  - `header.tsx` - Site header component
  - `footer.tsx` - Site footer component
  - `essay/` - MDX blog posts directory with custom layout
- `components/ui/` - Reusable animated UI components from Motion-Primitives
- `lib/utils.ts` - Utility functions (cn helper for Tailwind class merging)
- `public/` - Static assets

### Key Configuration Files

- `next.config.mjs` - Next.js configuration with MDX support
- `tsconfig.json` - TypeScript config with `@/*` path alias pointing to root
- `eslint.config.mjs` - ESLint with Next.js, TypeScript, Prettier, and MDX support

## Architecture

### Data Management

All content is centralized in `app/data.ts`:

- `PROJECTS` - Portfolio projects with name, description, link, and video
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
- Custom UI components in `components/ui/`:
  - `morphing-dialog.tsx` - Expandable video/image modals
  - `magnetic.tsx` - Magnetic hover effect for interactive elements
  - `spotlight.tsx` - Gradient spotlight effect on hover
  - `animated-background.tsx` - Animated background for list items
  - `text-effect.tsx`, `text-morph.tsx`, `text-loop.tsx` - Text animations
  - `scroll-progress.tsx` - Scroll position indicator

### Styling

- Tailwind CSS 4 with dark mode support via `next-themes`
- `@tailwindcss/typography` for MDX prose styling
- Custom fonts: Geist (sans) and Geist Mono (monospace)
- Dark mode: System-based default, toggleable via theme provider
- Utility function `cn()` in `lib/utils.ts` for merging Tailwind classes

## Key Patterns

### Adding New Projects

1. Add project object to `PROJECTS` array in `app/data.ts`
2. Include: `name`, `description`, `link`, `video` (URL to video preview), and unique `id`

### Adding New Blog Posts

1. Create directory `app/essay/[slug]/`
2. Add `page.mdx` file with content
3. Add entry to `BLOG_POSTS` array in `app/data.ts` with matching link path

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

- Update `WEBSITE_URL` in `app/data.ts` when deploying
- Metadata includes OpenGraph, Twitter cards, and structured data
- Viewport settings and theme color defined in layout
