'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface ScrollNavigationProps {
  items: {
    id: string
    label: string
  }[]
}

export function ScrollNavigation({ items }: ScrollNavigationProps) {
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      {
        rootMargin: '-20% 0px -50% 0px',
        threshold: 0.1,
      }
    )

    items.forEach((item) => {
      const element = document.getElementById(item.id)
      if (element) observer.observe(element)
    })

    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 50
      ) {
        setActiveId(items[items.length - 1].id)
      }
    }

    window.addEventListener('scroll', handleScroll)

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', handleScroll)
    }
  }, [items])

  const handleClick = (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    const element = document.getElementById(id)
    if (element) {
      const navHeight = 80 // offset for fixed header if any, page.tsx has pt-20
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - navHeight

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
      setActiveId(id)
    }
  }

  return (
    <div className="fixed left-6 top-1/2 z-50 hidden -translate-y-1/2 flex-col gap-3 md:flex lg:left-12">
      {items.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          onClick={(e) => handleClick(item.id, e)}
          className="group flex items-center"
          aria-label={`Scroll to ${item.label}`}
        >
           <span className="absolute left-8 ml-2 hidden translate-x-2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 dark:text-zinc-400 text-sm text-zinc-500 lg:block">
            {item.label}
          </span>
          <div
            className={cn(
              "h-0.5 rounded-full transition-all duration-300",
              activeId === item.id
                ? "w-8 bg-zinc-900 dark:bg-zinc-100"
                : "w-4 bg-zinc-300 group-hover:w-6 group-hover:bg-zinc-400 dark:bg-zinc-700 dark:group-hover:bg-zinc-600"
            )}
          />
        </a>
      ))}
    </div>
  )
}
