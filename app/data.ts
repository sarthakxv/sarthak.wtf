type Project = {
  name: string
  description: string
  link: string
  image: string
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
    image: '/images/pills-cover.webp',
    id: 'project1',
  },
  {
    name: 'Eido App',
    description: 'DeFi Copilot. Explore, earn, and execute in DeFi across Berachain — just by chatting.',
    link: 'https://eidolabs.xyz/',
    image: '/images/eido-cover.webp',
    id: 'project2',
  },
]

export const WORK_EXPERIENCE: WorkExperience[] = [
  {
    company: 'Eido Labs',
    title: 'Co-founder and Head of Engineering',
    start: 'Dec 2024',
    end: 'Present',
    link: 'https://eidolabs.xyz',
    id: 'work1',
    description: 'Led technical strategy as co-founder. Built two products from 0→1:\n• Eido App — Multi-agent AI system on Berachain for executing DeFi activities via natural language. Shipped beta in 2 months, acquired 3,000+ users, raised $500k, and sold out 1.5k NFT collection.\n• Pills.trade — Telegram bot for 24/7 RWA perpetual trading on Arbitrum & Solana. Designed novel DEX architecture with synthetic pricing oracles and liquidation mechanisms for round-the-clock trading.',
  },
  {
    company: 'SquaredLabs',
    title: 'Founding Engineer',
    start: 'Jun 2024',
    end: 'Dec 2024',
    link: 'https://www.linkedin.com/company/squaredlabs/',
    id: 'work2',
    description: '• Laid down and built the modular frontend architecture of Genie DEX from scratch and built all core functionalities and interactions. Shipped the production to the Base Sepolia testnet.\n• Helped designing the internal SDK for core interactions with Indexer, The Graph, smart contracts, and Potentia Protocol infrastructure layer.',
  },
  {
    company: 'DefiLens',
    title: 'Sr. Frontend Engineer',
    start: 'Feb 2024',
    end: 'May 2024',
    link: '',
    id: 'work3',
    description: '• Joined in the initial phase. Revamped code design patterns and implemented industry-standard UX for transaction flows and user onboarding.\n• Contributed to Product Strategy, Growth, and Community initiatives, increasing DAU to 500+.',
  },
  {
    company: 'YieldBay',
    title: 'Lead Frontend Engineer',
    start: 'Feb 2022',
    end: 'Sept 2023',
    link: 'https://www.findsignal.studio/',
    id: 'work4',
    description: '• Built maintainable frontend architecture for YieldBay, a DeFi Yield Aggregator on Polkadot.\n• Achieved 70% performance improvement through optimized React patterns, data fetching & caching strategies, and reduced bundle size.',
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
  TITLE: 'Co-founder and Head of Engineering @ Eido Labs',
  DESCRIPTION: 'A product-focused engineer who thrives in the 0→1 journey. Builder at heart. I bridge the gap between complex engineering and seamless user experiences to ship products real people love.',
  EMAIL: 'sarthakvdev@gmail.com',
  COMPANY_NAME: 'Eido Labs',
  COMPANY_LINK: 'https://eidolabs.xyz'
}

export const WEBSITE_URL = 'https://sarthakverma.vercel.app/'
