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
  description: string
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
    name: 'pills.trade',
    description:
      'Trade Stocks, Forex & Commodity derivatives — all via Telegram native RWA Perp DEX',
    link: 'https://pills.trade/',
    video: '',
    id: 'project1',
  },
  {
    name: 'Eido App',
    description: 'DeFi Copilot. Explore, earn, and execute in DeFi across Berachain — just by chatting.',
    link: 'https://eidolabs.xyz/',
    video: '',
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
    description: 'Building the future of decentralized applications with a focus on user experience and security.',
  },
  {
    company: 'SquaredLabs',
    title: 'Founding Engineer',
    start: 'Jun 2024',
    end: 'Dec 2024',
    link: 'https://www.linkedin.com/company/squaredlabs/',
    id: 'work2',
    description: 'Developed core infrastructure and frontend components for a high-performance trading platform.',
  },
  {
    company: 'DefiLens',
    title: 'Engineer Consultant',
    start: 'Jan 2024',
    end: 'May 2024',
    link: '',
    id: 'work3',
    description: 'Provided technical consultation and implemented key features for a DeFi analytics dashboard.',
  },
  {
    company: 'Find Signal / YieldBay',
    title: 'Frontend Engineer',
    start: 'Feb 2022',
    end: 'Aug 2023',
    link: 'https://www.findsignal.studio/',
    id: 'work4',
    description: 'Built responsive and interactive user interfaces for various fintech clients using React and Next.js.',
  },
]

export const BLOG_POSTS: BlogPost[] = [
  {
    title: 'Ready Player One: A Virtual Odyssey',
    description: 'Exploring the immersive world of the OASIS and its implications for our future.',
    link: '/essay/ready-player-one',
    uid: 'blog-5',
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

export const WEBSITE_URL = 'https://sarthakverma.vercel.app/'
