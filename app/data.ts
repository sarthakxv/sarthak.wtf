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
    name: 'xaut.cool',
    description:
      'Real-time analytics dashboard tracking XAUT tokenized gold supply across 8 chains with Native Ethereum and LayerZero OFT bridges.',
    link: 'https://xaut-cool.vercel.app/',
    image: '/images/xaut-cover.webp',
    id: 'project4',
  },
  {
    name: 'pills.trade',
    description:
      'Trade Stocks, Forex & Commodity derivatives: all via Telegram native RWA Perp DEX',
    link: 'https://pills.trade/',
    image: '/images/pills-cover.webp',
    id: 'project1',
  },
  {
    name: 'Eido App',
    description: 'DeFi Copilot. Explore, earn, and execute in DeFi across Berachain; just by chatting.',
    link: 'https://eidolabs.xyz/',
    image: '/images/eido-cover.webp',
    id: 'project2',
  },
  {
    name: 'Genie DEX',
    description: 'Squared Perps on Base Network',
    link: 'https://geniedex.io/',
    image: '/images/genie-cover.webp',
    id: 'project3',
  }
]

export const WORK_EXPERIENCE: WorkExperience[] = [
  {
    company: 'Gold.fi (Bullion Digital)',
    title: 'Founding Engineer',
    start: 'Jan 2026',
    end: 'Present',
    link: 'https://gold.fi',
    id: 'work0',
    description: '• Sole engineer building a mobile-first PWA for Indian retail to buy, sell, and hold tokenized gold (XAUT) via UPI or USDT.\n• Built end-to-end INR/USDT → XAUT flow: UPI on-ramp → Privy embedded wallets (gas-sponsored, no seed phrases) → Uniswap V3 with 1inch v6 quote routing.\n• Shipped CDP yield strategy (XAUT collateral on AAVE v3 → borrow USDC → Morpho Blue vaults) with custom Solidity PositionManager (Foundry tests) and Vercel cron keepers; managed Pashov audit pre-launch.',
  },
  {
    company: 'Eido Labs',
    title: 'Co-founder and Head of Engineering',
    start: 'Dec 2024',
    end: 'Dec 2025',
    link: 'https://eidolabs.xyz',
    id: 'work1',
    description: 'Led technical strategy as co-founder. Built two products from 0→1:\n• Eido App — Multi-agent AI system on Berachain for executing DeFi via natural language, with LangGraph orchestration across specialized agents for intent parsing, transaction building, and execution. Shipped beta in 2 months, acquired 3,000+ users, raised $500k, and sold out 1.5k NFT collection.\n• Pills.trade — Telegram bot for 24/7 RWA perpetual trading on Arbitrum & Solana. Hit 200+ users and ~$50k trade volume within 2 weeks of beta launch. Designed novel DEX architecture with synthetic pricing oracles and liquidation mechanisms for round-the-clock trading.',
  },
  {
    company: 'SquaredLabs',
    title: 'Senior Frontend Engineer, Founding Engineer #3',
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
  TITLE: 'Founding Engineer / Head of Engineering @ Gold.fi',
  DESCRIPTION: '• Senior engineer and ex-founder. 4+ years shipping DeFi and AI products from 0→1. RWA perps, DEXes, and now tokenized gold on Ethereum.\n• Frontend-heavy with full-stack depth. Best where engineering and product decisions are the same conversation.\n• Besides code, I degen or play Poker.',
  EMAIL: 'sarthakvdev@gmail.com',
  COMPANY_NAME: 'Gold.fi',
  COMPANY_LINK: 'https://gold.fi'
}

export const WEBSITE_URL = 'https://sarthakxv.com/'
