type Project = {
  name: string
  description: string
  link: string
  video: string
  id: string
}

type WorkExperience = {
  company: string
  title: string
  start: string
  end: string
  link: string
  id: string
}

type BlogPost = {
  title: string
  description: string
  link: string
  uid: string
}

type SocialLink = {
  label: string
  link: string
}

export const PROJECTS: Project[] = [
  {
    name: 'Motion Primitives Pro',
    description:
      'Advanced components and templates to craft beautiful websites.',
    link: 'https://pro.motion-primitives.com/',
    video:
      'https://res.cloudinary.com/read-cv/video/upload/t_v_b/v1/1/profileItems/W2azTw5BVbMXfj7F53G92hMVIn32/newProfileItem/d898be8a-7037-4c71-af0c-8997239b050d.mp4?_a=DATAdtAAZAA0',
    id: 'project1',
  },
  {
    name: 'Motion Primitives',
    description: 'UI kit to make beautiful, animated interfaces.',
    link: 'https://motion-primitives.com/',
    video:
      'https://res.cloudinary.com/read-cv/video/upload/t_v_b/v1/1/profileItems/W2azTw5BVbMXfj7F53G92hMVIn32/XSfIvT7BUWbPRXhrbLed/ee6871c9-8400-49d2-8be9-e32675eabf7e.mp4?_a=DATAdtAAZAA0',
    id: 'project2',
  },
]

export const WORK_EXPERIENCE: WorkExperience[] = [
  {
    company: 'Eido Labs',
    title: 'Co-Founder and Engineer',
    start: 'Dec 2024',
    end: 'Present',
    link: 'https://eidolabs.xyz',
    id: 'work1',
  },
  {
    company: 'SquaredLabs',
    title: 'Founding Engineer',
    start: 'Jun 2024',
    end: 'Dec 2024',
    link: 'https://www.linkedin.com/company/squaredlabs/',
    id: 'work2',
  },
  {
    company: 'DefiLens',
    title: 'Engineer Consultant',
    start: 'Jan 2024',
    end: 'May 2024',
    link: '',
    id: 'work3',
  },
  {
    company: 'Find Signal / YieldBay',
    title: 'Frontend Engineer',
    start: 'Feb 2022',
    end: 'Aug 2023',
    link: 'https://www.findsignal.studio/',
    id: 'work4',
  },
]

export const BLOG_POSTS: BlogPost[] = [
  {
    title: 'Exploring the Intersection of Design, AI, and Design Engineering',
    description: 'How AI is changing the way we design',
    link: '/blog/exploring-the-intersection-of-design-ai-and-design-engineering',
    uid: 'blog-1',
  },
  {
    title: 'Why I left my job to start my own company',
    description:
      'A deep dive into my decision to leave my job and start my own company',
    link: '/blog/exploring-the-intersection-of-design-ai-and-design-engineering',
    uid: 'blog-2',
  },
  {
    title: 'What I learned from my first year of freelancing',
    description:
      'A look back at my first year of freelancing and what I learned',
    link: '/blog/exploring-the-intersection-of-design-ai-and-design-engineering',
    uid: 'blog-3',
  },
  {
    title: 'How to Export Metadata from MDX for Next.js SEO',
    description: 'A guide on exporting metadata from MDX files to leverage Next.js SEO features.',
    link: '/blog/example-mdx-metadata',
    uid: 'blog-4',
  },
]

export const SOCIAL_LINKS: SocialLink[] = [
  {
    label: 'Github',
    link: 'https://github.com/sarthakxv',
  },
  {
    label: 'Twitter',
    link: 'https://twitter.com/0xSarthak',
  },
  {
    label: 'LinkedIn',
    link: 'https://www.linkedin.com/in/sarthakv',
  }
]

export const PERSONAL_INFO = {
  NAME: 'Sarthak',
  TITLE: 'Co-Founder and Engineer @ Eido Labs',
  DESCRIPTION: 'Focused on creating intuitive and performant web experiences. Bridging the gap between design and development.',
  EMAIL: 'sarthakvdev@gmail.com',
  COMPANY_NAME: 'Eido Labs',
  COMPANY_LINK: 'https://eidolabs.xyz'
}
